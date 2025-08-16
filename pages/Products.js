import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { Filter, XCircle, CheckCircle } from 'lucide-react';

const Products = ({ addToCart, searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category');

      if (error) {
        console.error('Error fetching categories:', error.message);
      } else {
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
        setCategories(['Todas', ...uniqueCategories.sort()]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (appliedMinPrice !== '') {
        query = query.gte('price', parseFloat(appliedMinPrice));
      }
      if (appliedMaxPrice !== '') {
        query = query.lte('price', parseFloat(appliedMaxPrice));
      }

      if (selectedCategory && selectedCategory !== 'Todas') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        setError('Error al cargar los productos. Intenta de nuevo más tarde. ¡Quizás se fueron de vacaciones!');
        console.error('Error fetching products:', error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [searchTerm, appliedMinPrice, appliedMaxPrice, selectedCategory]);

  const handleApplyFilters = () => {
    setAppliedMinPrice(minPriceInput);
    setAppliedMaxPrice(maxPriceInput);
  };

  const handleClearFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setSelectedCategory('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <p className="text-xl text-gray-600">Cargando productos... ¡Paciencia, que lo bueno se hace esperar!</p>
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
        Nuestros Productos
      </motion.h2>

      <motion.div 
        className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 flex flex-col md:flex-row items-center justify-center gap-6 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 text-gray-700 font-medium">
          <Filter className="w-5 h-5 text-indigo-600" />
          <span>Precio:</span>
          <label htmlFor="minPrice" className="sr-only">Precio Mínimo</label>
          <input
            type="number"
            id="minPrice"
            placeholder="Mín."
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-center"
            step="0.01"
          />
          <span className="text-gray-700">-</span>
          <label htmlFor="maxPrice" className="sr-only">Precio Máximo</label>
          <input
            type="number"
            id="maxPrice"
            placeholder="Máx."
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-center"
            step="0.01"
          />
        </div>
        
        <div className="flex items-center gap-3 text-gray-700 font-medium">
          <Filter className="w-5 h-5 text-indigo-600" />
          <span>Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <motion.button
          onClick={handleApplyFilters}
          className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CheckCircle className="w-4 h-4" />
          Aplicar Filtros
        </motion.button>

        <motion.button
          onClick={handleClearFilters}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2 rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <XCircle className="w-4 h-4" />
          Limpiar Filtros
        </motion.button>
      </motion.div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <p className="text-xl text-gray-600">No se encontraron productos con esos criterios. ¡Intenta otra cosa!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            >
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-48 object-cover" 
                onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/300x200/CCCCCC/FFFFFF?text=Imagen+no+disponible"; }} // Fallback para imágenes rotas
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <p className="text-gray-500 text-xs font-semibold mb-2">Categoría: {product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                  <motion.button 
                    onClick={() => addToCart(product)}
                    className="bg-indigo-500 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Añadir al Carrito
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Products;