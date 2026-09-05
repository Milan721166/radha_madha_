import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      const localWishlist = JSON.parse(localStorage.getItem('radhamav_guest_wishlist') || '[]');
      setWishlist(localWishlist);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.success) {
        setWishlist(res.wishlist || []);
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product) => {
    if (user) {
      try {
        const res = await api.post('/wishlist/toggle', { productId: product.id });
        if (res.success) {
          showToast(res.message, res.added ? 'success' : 'info');
          fetchWishlist();
        }
      } catch (err) {
        showToast(err.message || 'Failed to update wishlist', 'error');
      }
    } else {
      const exists = wishlist.some(item => item.id === product.id || item.product_id === product.id);
      let updated;
      if (exists) {
        updated = wishlist.filter(item => item.id !== product.id && item.product_id !== product.id);
        showToast('Removed from wishlist', 'info');
      } else {
        updated = [...wishlist, product];
        showToast('Saved to wishlist!', 'success');
      }
      setWishlist(updated);
      localStorage.setItem('radhamav_guest_wishlist', JSON.stringify(updated));
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId || item.product_id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        toggleWishlist,
        isInWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
