import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, MapPin, CreditCard, Truck, ArrowRight, UserCheck, Check, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import OtpAuthModal from '../components/OtpAuthModal';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, login, register, addresses, saveAddress } = useAuth();
  const { cartItems, cartSummary, clearCart } = useCart();
  const { showToast } = useToast();

  const [step, setStep] = useState(user ? 2 : 1);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Guest Auth State
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');

  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || 'new');
  const [newAddr, setNewAddr] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    house_flat: '',
    street: '',
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033'
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
        showToast('Welcome back! Proceeding to address selection.', 'success');
        setStep(2);
      } else {
        await register(authName, authEmail, authPassword, '');
        showToast('Account created successfully! Proceeding to checkout.', 'success');
        setStep(2);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      let shippingAddressObj = addresses.find(a => a.id === selectedAddressId);
      if (!shippingAddressObj || selectedAddressId === 'new') {
        shippingAddressObj = newAddr;
      }

      const res = await api.post('/orders/create', {
        shippingAddress: shippingAddressObj,
        paymentMethod,
        items: cartItems,
        subtotal: cartSummary.subtotal,
        shippingFee: cartSummary.shippingFee,
        taxAmount: cartSummary.taxAmount,
        discountAmount: cartSummary.discountAmount,
        totalAmount: cartSummary.totalAmount,
        notes
      });

      if (res.success) {
        setCompletedOrder(res.order);
        clearCart();
        setStep(5);
        showToast('Order placed successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 5 && completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">Order Confirmed</span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">
            Thank You For Your Order!
          </h1>
          <p className="text-sm text-neutral-600">
            Your Order ID is <span className="font-bold text-brand-maroon">{completedOrder.orderNumber}</span>. We've sent a confirmation notice to your email.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-neutral-200 text-left space-y-4 shadow-sm max-w-lg mx-auto">
          <h3 className="font-bold text-sm text-neutral-900 border-b border-neutral-100 pb-2">Order Summary Details</h3>
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Payment Method:</span>
            <span className="font-bold text-neutral-900">{completedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Total Paid:</span>
            <span className="font-bold text-brand-maroon text-base">₹{completedOrder.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Estimated Express Delivery:</span>
            <span className="font-bold text-emerald-600">Within 3-5 Business Days</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={`/account`}
            className="maroon-btn px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
          >
            Track Order In Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/shop"
            className="px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-neutral-300 hover:border-brand-gold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Checkout Steps Progress Bar */}
      <div className="bg-white rounded-3xl p-4 border border-neutral-100 shadow-sm flex items-center justify-between text-xs max-w-3xl mx-auto">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-maroon font-bold' : 'text-neutral-400'}`}>
          <span className="w-6 h-6 rounded-full bg-brand-maroon text-white flex items-center justify-center text-[10px]">1</span>
          <span>Authentication</span>
        </div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-maroon font-bold' : 'text-neutral-400'}`}>
          <span className="w-6 h-6 rounded-full bg-brand-maroon text-white flex items-center justify-center text-[10px]">2</span>
          <span>Address</span>
        </div>
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-brand-maroon font-bold' : 'text-neutral-400'}`}>
          <span className="w-6 h-6 rounded-full bg-brand-maroon text-white flex items-center justify-center text-[10px]">3</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Steps Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: Authentication */}
          {!user && step === 1 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                <h2 className="font-serif text-2xl font-bold text-neutral-900">Step 1: Sign In or Register</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${authMode === 'login' ? 'bg-brand-maroon text-white' : 'text-neutral-600'}`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${authMode === 'register' ? 'bg-brand-maroon text-white' : 'text-neutral-600'}`}
                  >
                    Register
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-md">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900">Instant Mobile OTP</h4>
                    <p className="text-[11px] text-neutral-500">Sign in instantly via 6-digit SMS code</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow transition shrink-0"
                >
                  Login with OTP
                </button>
              </div>

              <div className="relative flex py-1 items-center max-w-md">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-gray-400">Or with Email & Password</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-md">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full maroon-btn py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-wider"
                >
                  {authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}
                </button>
              </form>

              <OtpAuthModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onSuccess={() => setStep(2)}
              />
            </div>
          )}

          {/* STEP 2: Address Selection */}
          {step === 2 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-neutral-900 border-b border-neutral-100 pb-4">
                Step 2: Shipping Address
              </h2>

              <div className="space-y-4">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-maroon bg-brand-champagne/20 shadow-sm'
                        : 'border-neutral-200 hover:border-brand-gold'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-brand-maroon"
                      />
                      <div>
                        <p className="font-bold text-xs text-neutral-900">{addr.full_name} ({addr.phone})</p>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          {addr.house_flat}, {addr.street}, {addr.area ? addr.area + ', ' : ''}{addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}

                {/* Add New Address Form */}
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-700">Add New Delivery Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddr.full_name}
                      onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Mobile Phone"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="House / Flat No."
                      value={newAddr.house_flat}
                      onChange={(e) => setNewAddr({ ...newAddr, house_flat: e.target.value })}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Street / Colony"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="PIN Code"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="maroon-btn px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
              >
                Proceed to Payment Method <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Payment Gateway Selector */}
          {step === 3 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-neutral-900 border-b border-neutral-100 pb-4">
                Step 3: Select Payment Method
              </h2>

              <div className="space-y-3">
                {[
                  { id: 'COD', title: 'Cash on Delivery (COD)', desc: 'Pay with cash upon package arrival' },
                  { id: 'UPI', title: 'Instant UPI (Google Pay / PhonePe / Paytm)', desc: 'Scan & Pay instantly' },
                  { id: 'CARD', title: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay' },
                  { id: 'NETBANKING', title: 'Net Banking', desc: 'All major Indian banks supported' }
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-brand-maroon bg-brand-champagne/30 font-bold'
                        : 'border-neutral-200 hover:border-brand-gold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="accent-brand-maroon"
                      />
                      <div>
                        <p className="text-xs text-neutral-900">{pm.title}</p>
                        <p className="text-[11px] text-neutral-500 font-normal">{pm.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Order Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Special instructions for delivery partner..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-full text-xs font-semibold border border-neutral-200"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="gold-btn flex-1 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Processing Order...' : `Confirm & Place Order (₹${cartSummary.totalAmount?.toLocaleString('en-IN')})`}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Summary Sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4 h-fit">
          <h3 className="font-serif font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">
            Cart Review ({cartItems.length} items)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.product_name} className="w-12 h-14 object-cover rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-neutral-900 truncate">{item.product_name}</p>
                  <p className="text-neutral-500">Qty: {item.quantity} • {item.size || 'Free Size'}</p>
                </div>
                <span className="font-bold text-xs text-brand-maroon">₹{((item.unit_price || item.sale_price || item.price) * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-neutral-900">₹{cartSummary.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold text-emerald-600">{cartSummary.shippingFee === 0 ? 'FREE' : `₹${cartSummary.shippingFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Total Payable</span>
              <span className="text-brand-maroon font-serif text-lg">₹{cartSummary.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
