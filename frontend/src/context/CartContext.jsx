import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    shippingFee: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0
  });
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Load local guest cart if any
      const localCart = JSON.parse(localStorage.getItem('radhamav_guest_cart') || '[]');
      setCartItems(localCart);
      calculateLocalSummary(localCart);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success) {
        setCartItems(res.items || []);
        setCartSummary(res.summary);
      }
    } catch (err) {
      console.error('Fetch cart error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalSummary = (items) => {
    let subtotal = 0;
    items.forEach(item => {
      const price = item.sale_price || item.price || 0;
      subtotal += price * item.quantity;
    });
    const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
    const taxAmount = Math.round(subtotal * 0.05);
    const discountAmount = coupon ? coupon.discountAmount : 0;
    const totalAmount = Math.max(0, subtotal + shippingFee + taxAmount - discountAmount);

    setCartSummary({ subtotal, shippingFee, taxAmount, discountAmount, totalAmount });
  };

  const addToCart = async (product, variant = null, size = '', color = '', quantity = 1) => {
    const availableStock = (variant && variant.stock !== undefined) ? variant.stock : product.stock;
    if (availableStock !== undefined && availableStock <= 0) {
      showToast(`'${product.name}' is currently out of stock`, 'error');
      return;
    }

    if (user) {
      try {
        const res = await api.post('/cart/add', {
          productId: product.id,
          variantId: variant?.id,
          size: size || variant?.size || '',
          color: color || variant?.color || '',
          quantity
        });
        if (res.success) {
          showToast(`Added '${product.name}' to your cart!`, 'success');
          fetchCart();
        }
      } catch (err) {
        showToast(err.message || 'Failed to add item to cart', 'error');
      }
    } else {
      // Guest Cart logic
      const localCart = [...cartItems];
      const existingIdx = localCart.findIndex(
        i => i.product_id === product.id && i.size === size && i.color === color
      );

      const existingQty = existingIdx > -1 ? localCart[existingIdx].quantity : 0;
      if (availableStock !== undefined && (existingQty + quantity) > availableStock) {
        showToast(`Only ${availableStock} unit(s) available in stock`, 'error');
        return;
      }

      if (existingIdx > -1) {
        localCart[existingIdx].quantity += quantity;
      } else {
        localCart.push({
          id: Date.now(),
          product_id: product.id,
          product_name: product.name,
          slug: product.slug,
          price: product.price,
          sale_price: product.sale_price,
          image: product.images?.[0]?.image_url || product.image_url || product.image,
          size: size || variant?.size || '',
          color: color || variant?.color || '',
          stock: availableStock ?? 999,
          quantity
        });
      }

      setCartItems(localCart);
      localStorage.setItem('radhamav_guest_cart', JSON.stringify(localCart));
      calculateLocalSummary(localCart);
      showToast(`Added '${product.name}' to cart!`, 'success');
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    const item = cartItems.find(i => i.id === itemId);
    const availableStock = item?.variant_stock !== undefined && item?.variant_stock !== null 
      ? item.variant_stock 
      : item?.stock;

    if (newQty > 0 && availableStock !== undefined && availableStock !== null && newQty > availableStock) {
      showToast(`Only ${availableStock} unit(s) available in stock`, 'error');
      return;
    }

    if (user) {
      try {
        const res = await api.put(`/cart/items/${itemId}`, { quantity: newQty });
        if (res.success) {
          fetchCart();
        }
      } catch (err) {
        showToast(err.message || 'Failed to update quantity', 'error');
      }
    } else {
      let localCart = cartItems.map(item => item.id === itemId ? { ...item, quantity: newQty } : item);
      localCart = localCart.filter(item => item.quantity > 0);
      setCartItems(localCart);
      localStorage.setItem('radhamav_guest_cart', JSON.stringify(localCart));
      calculateLocalSummary(localCart);
    }
  };

  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        await api.delete(`/cart/items/${itemId}`);
        showToast('Item removed from cart', 'info');
        fetchCart();
      } catch (err) {
        showToast('Failed to remove item', 'error');
      }
    } else {
      const localCart = cartItems.filter(item => item.id !== itemId);
      setCartItems(localCart);
      localStorage.setItem('radhamav_guest_cart', JSON.stringify(localCart));
      calculateLocalSummary(localCart);
      showToast('Item removed from cart', 'info');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/cart/apply-coupon', { code, subtotal: cartSummary.subtotal });
      if (res.success) {
        setCoupon(res.coupon);
        showToast(res.message, 'success');
        setCartSummary(prev => ({
          ...prev,
          discountAmount: res.coupon.discountAmount,
          totalAmount: Math.max(0, prev.subtotal + prev.shippingFee + prev.taxAmount - res.coupon.discountAmount)
        }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('radhamav_guest_cart');
    setCartSummary({ subtotal: 0, shippingFee: 0, taxAmount: 0, discountAmount: 0, totalAmount: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartSummary,
        coupon,
        loading,
        cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        clearCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
