import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Cart from './pages/Cart';

const App = () => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('nexus-cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error parsing cart from localStorage:", error);
      return [];
    }
  });
  const [searchTerm, setSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda

  useEffect(() => {
    localStorage.setItem('nexus-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={totalCartItems} onSearch={handleSearch} /> {/* Pasa onSearch al Header */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products addToCart={addToCart} searchTerm={searchTerm} />} /> {/* Pasa searchTerm a Products */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route 
              path="/cart" 
              element={
                <Cart 
                  cartItems={cartItems} 
                  removeFromCart={removeFromCart} 
                  updateQuantity={updateQuantity} 
                  clearCart={clearCart} 
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;