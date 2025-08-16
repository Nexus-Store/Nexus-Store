import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <motion.div 
      className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center px-4 py-16">
        <motion.h2 
          className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          Descubre lo <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Extraordinario</span>
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          Encuentra productos únicos y de alta calidad que transformarán tu día a día.
        </motion.p>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <Link 
            to="/products" 
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Explorar Productos
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;