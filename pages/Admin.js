import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Save, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', image_url: '', category: '' });
  const [categories, setCategories] = useState([]); // Estado para almacenar las categorías disponibles

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category'); // Solo seleccionar la columna category

      if (error) {
        console.error('Error fetching categories for admin:', error.message);
      } else {
        // Extraer solo los valores de categoría y eliminar duplicados/nulos
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories.sort()); // Ordenar alfabéticamente
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/admin-login');
      } else {
        fetchProducts();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/admin-login');
      } else {
        fetchProducts();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Error al cargar los productos. ¿Seguro que eres el admin?');
      console.error('Error fetching products:', error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('El nombre y el precio son obligatorios, ¡no seas vago!');
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        { 
          name: newProduct.name, 
          description: newProduct.description, 
          price: parseFloat(newProduct.price), 
          image_url: newProduct.image_url,
          category: newProduct.category || 'General' // Asignar categoría
        }
      ])
      .select();

    if (error) {
      setError('Error al añadir el producto. ¿Estás seguro de que sabes lo que haces?');
      console.error('Error adding product:', error.message);
    } else {
      setProducts([data[0], ...products]);
      setNewProduct({ name: '', description: '', price: '', image_url: '', category: '' });
      // Actualizar categorías si se añadió una nueva
      if (newProduct.category && !categories.includes(newProduct.category)) {
        setCategories([...categories, newProduct.category].sort());
      }
    }
  };

  const handleUpdateProduct = async (id) => {
    if (!editingProduct.name || !editingProduct.price) {
      alert('El nombre y el precio no pueden estar vacíos, ¡concéntrate!');
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ 
        name: editingProduct.name, 
        description: editingProduct.description, 
        price: parseFloat(editingProduct.price), 
        image_url: editingProduct.image_url,
        category: editingProduct.category // Actualizar categoría
      })
      .eq('id', id);

    if (error) {
      setError('Error al actualizar el producto. ¿Se te ha caído el internet?');
      console.error('Error updating product:', error.message);
    } else {
      setProducts(products.map(p => (p.id === id ? editingProduct : p)));
      setEditingProduct(null);
      // Actualizar categorías si se modificó una existente a una nueva
      if (editingProduct.category && !categories.includes(editingProduct.category)) {
        setCategories([...categories, editingProduct.category].sort());
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar esto? ¡No hay vuelta atrás!')) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Error al eliminar el producto. ¡Parece que no quiere irse!');
      console.error('Error deleting product:', error.message);
    } else {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const startEditing = (product) => {
    setEditingProduct({ ...product });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
  };

  if (!session) {
    return null; // O un spinner, o un mensaje de "redirigiendo..."
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <p className="text-xl text-gray-600">Cargando panel de administración... ¡No toques nada todavía!</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <p className="text-xl text-red-500">{error}</p>
      </div>
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
        Panel de Administración
      </motion.h2>

      {/* Formulario para añadir producto */}
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-8 mb-10 border border-gray-100"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Añadir Nuevo Producto</h3>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
            <input
              type="text"
              id="name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Super Gadget 5000"
              required
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              type="number"
              id="price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 99.99"
              step="0.01"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              id="description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Una descripción increíble para tu producto..."
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">URL de la Imagen</label>
            <input
              type="url"
              id="image_url"
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: https://via.placeholder.com/300x200"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              id="category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {/* Opción para añadir una nueva categoría */}
              <option value="new_category">-- Nueva Categoría --</option>
            </select>
            {newProduct.category === 'new_category' && (
              <input
                type="text"
                placeholder="Nombre de la nueva categoría"
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    setNewProduct({ ...newProduct, category: e.target.value.trim() });
                  } else {
                    setNewProduct({ ...newProduct, category: '' }); // Si está vacío, vuelve a seleccionar
                  }
                }}
              />
            )}
          </div>
          <div className="md:col-span-2 flex justify-end">
            <motion.button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-indigo-700 transition-colors duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusCircle className="w-5 h-5" />
              Añadir Producto
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Lista de productos */}
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Productos Existentes</h3>
        <div className="space-y-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {editingProduct && editingProduct.id === product.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    step="0.01"
                  />
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows="2"
                    className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md"
                  ></textarea>
                  <input
                    type="url"
                    value={editingProduct.image_url}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {/* Opción para añadir una nueva categoría al editar */}
                    <option value="new_category">-- Nueva Categoría --</option>
                  </select>
                  {editingProduct.category === 'new_category' && (
                    <input
                      type="text"
                      placeholder="Nombre de la nueva categoría"
                      className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          setEditingProduct({ ...editingProduct, category: e.target.value.trim() });
                        } else {
                          setEditingProduct({ ...editingProduct, category: '' });
                        }
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-gray-600 text-sm">${product.price}</p>
                  <p className="text-gray-500 text-xs mt-1">{product.description}</p>
                  <p className="text-gray-500 text-xs mt-1 font-semibold">Categoría: {product.category}</p>
                  {product.image_url && <img src={product.image_url} alt={product.name} className="w-20 h-auto mt-2 rounded-md" />}
                </div>
              )}
              
              <div className="flex gap-2 mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                {editingProduct && editingProduct.id === product.id ? (
                  <>
                    <motion.button
                      onClick={() => handleUpdateProduct(product.id)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Save className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={cancelEditing}
                      className="bg-gray-400 text-white p-2 rounded-full hover:bg-gray-500 transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <XCircle className="w-5 h-5" />
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      onClick={() => startEditing(product)}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Admin;