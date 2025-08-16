import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const Cart = ({ cartItems, removeFromCart, updateQuantity, clearCart }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Por favor, ingresa tu nombre y número de teléfono. ¡No somos adivinos!');
      setLoading(false);
      return;
    }

    if (cartItems.length === 0) {
      setError('Tu carrito está vacío. ¿Qué quieres que te enviemos, aire?');
      setLoading(false);
      return;
    }

    try {
      // 1. Buscar o crear el cliente
      let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_number', customerPhone)
        .single();

      if (customerError && customerError.code === 'PGRST116') { // No rows found
        const { data: newCustomer, error: newCustomerError } = await supabase
          .from('customers')
          .insert({ name: customerName, phone_number: customerPhone })
          .select('id')
          .single();
        
        if (newCustomerError) throw newCustomerError;
        customer = newCustomer;
      } else if (customerError) {
        throw customerError;
      }

      // 2. Crear el pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ 
          customer_id: customer.id, 
          total_amount: totalAmount,
          status: 'pending' 
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // 3. Crear los ítems del pedido
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_order: item.price
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) throw orderItemsError;

      // 4. Enviar mensaje de WhatsApp (simulado, ya que no tenemos la API de WhatsApp aquí)
      const whatsappMessage = `Nuevo pedido de ${customerName} (${customerPhone}):\n\n${cartItems.map(item => `- ${item.name} x ${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`).join('\n')}\n\nTotal: $${totalAmount.toFixed(2)}`;
      
      console.log("Simulando envío de WhatsApp a +5355462411:");
      console.log(whatsappMessage);
      alert(`¡Pedido realizado con éxito! Te contactaremos pronto. Mensaje simulado enviado a WhatsApp: ${whatsappMessage}`);

      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error('Error al procesar el pedido:', err);
      setError('Hubo un problema al procesar tu pedido. Inténtalo de nuevo, o quizás el universo no quiere que compres esto.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <motion.div 
        className="container mx-auto px-4 py-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ShoppingBag className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Pedido Recibido!</h2>
        <p className="text-lg text-gray-600 mb-8">
          Gracias por tu compra. Nos pondremos en contacto contigo en breve para coordinar la entrega y el pago.
        </p>
        <button 
          onClick={() => { setOrderPlaced(false); navigate('/products'); }}
          className="bg-indigo-500 text-white px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300"
        >
          Volver a la Tienda
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2 
        className="text-4xl font-bold text-gray-900 text-center mb-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Tu Carrito de Compras
      </motion.h2>

      {cartItems.length === 0 ? (
        <motion.div 
          className="text-center py-12 bg-white rounded-xl shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl text-gray-600">Tu carrito está más vacío que mi agenda social. ¡Añade algunos productos!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Productos en el Carrito</h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-gray-600 text-sm">${item.price.toFixed(2)} cada uno</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 p-2 border border-gray-300 rounded-md text-center"
                    />
                    <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    <motion.button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button
              onClick={clearCart}
              className="mt-6 bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Vaciar Carrito
            </motion.button>
          </div>

          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-24">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Resumen del Pedido</h3>
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 mb-6 border-t pt-4">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Tu Nombre:</label>
                <input
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Tu WhatsApp (+53):</label>
                <input
                  type="tel"
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: 55462411"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? 'Procesando pedido...' : 'Confirmar Pedido y Pagar al Recibir'}
              </motion.button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Cart;