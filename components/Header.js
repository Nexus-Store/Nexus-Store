import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Search, Settings, LogOut, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const Header = ({ cartItemCount, onSearch }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      navigate('/admin-login');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    setIsSearchOpen(false);
  };

  return (
    <motion.header 
      className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.img 
            src={`${process.env.PUBLIC_URL}/logo.svg`} // Usar PUBLIC_URL para asegurar la ruta absoluta
            alt="Nexus Store Logo" 
            className="h-8 w-8"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Nexus Store
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-300">
            Inicio
          </Link>
          <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-300">
            Productos
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <motion.button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Search className="w-5 h-5" />
          </motion.button>
          <Link to="/cart">
            <motion.button 
              className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>
          </Link>
          <motion.button 
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <User className="w-5 h-5" />
          </motion.button>
          {session ? (
            <motion.button
              onClick={handleLogout}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          ) : (
            <Link to="/admin-login" className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-300">
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
      
      {isSearchOpen && (
        <motion.div 
          className="bg-white/95 backdrop-blur-lg py-4 px-4 border-t border-gray-100"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSearchSubmit} className="container mx-auto flex items-center gap-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <motion.button
              type="submit"
              className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => { setIsSearchOpen(false); setSearchTerm(''); onSearch(''); }}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </form>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;