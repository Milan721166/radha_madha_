import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Tag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, cartSummary, updateQuantity, removeFromCart, applyCoupon, coupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCoupon(couponCode.trim());
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-champagne mx-auto flex items-center justify-center text-brand-maroon">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-neutral-900">Your Cart is Currently Empty</h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Explore our royal Kanjeevaram sarees, designer kurtis, and bridal lehenga collections to add items to your cart.
        </p>
        <Link to="/shop" className="maroon-btn px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">Shopping Cart</h1>
        <p className="text-xs text-neutral-500 mt-1">Review your selected items and apply promotional coupons</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const unitPrice = item.unit_price || item.sale_price || item.price;
            const itemTotal = unitPrice * item.quantity;

            return (
              <div key={item.id} className="bg-white rounded-3xl p-4 md:p-6 border border-neutral-100 shadow-sm flex gap-4 md:gap-6 items-center">
                
                <Link to={`/product/${item.slug}`} className="w-20 h-24 md:w-24 md:h-32 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                  <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/product/${item.slug}`} className="font-serif font-bold text-base md:text-lg text-neutral-900 hover:text-brand-maroon transition-colors line-clamp-1">
                        {item.product_name}
                      </Link>
                      <p className="text-xs text-neutral-500 font-medium">
                        Size: <span className="text-neutral-900 font-semibold">{item.size || 'Free Size'}</span> 
                        {item.color && <span> • Color: <span className="text-neutral-900 font-semibold">{item.color}</span></span>}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-3 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-neutral-700 text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-neutral-700 text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-base text-brand-maroon">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-neutral-400">₹{unitPrice.toLocaleString('en-IN')} each</p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupon Sidebar */}
        <div className="space-y-6">
          
          {/* Coupon Code Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm text-neutral-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-gold" /> Apply Promo Code
            </h3>
            
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter WELCOME10 or FESTIVE500"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-gold uppercase"
              />
              <button
                type="submit"
                className="maroon-btn px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider"
              >
                Apply
              </button>
            </form>

            {coupon && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs font-medium border border-emerald-200">
                Code '{coupon.code}' active: Saved ₹{coupon.discountAmount}
              </div>
            )}
          </div>

          {/* Order Summary breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">₹{cartSummary.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-neutral-900">
                  {cartSummary.shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${cartSummary.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST Tax (5%)</span>
                <span className="font-semibold text-neutral-900">₹{cartSummary.taxAmount.toLocaleString('en-IN')}</span>
              </div>

              {cartSummary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{cartSummary.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm font-bold text-neutral-900">
                <span>Final Total</span>
                <span className="text-xl text-brand-maroon font-serif">₹{cartSummary.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full gold-btn py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              Proceed to Multi-Step Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
