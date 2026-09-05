import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, Tag, LogOut, Printer, RefreshCw, X, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Account() {
  const { user, logout, addresses, saveAddress, deleteAddress } = useAuth();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'profile';

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Return modal state
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Fit issue');
  const [returnDesc, setReturnDesc] = useState('');

  // Address form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrForm, setAddrForm] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    house_flat: '',
    street: '',
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033'
  });

  useEffect(() => {
    if (user && activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get('/orders/my-orders');
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.post(`/orders/${orderId}/cancel`);
      if (res.success) {
        showToast(res.message, 'success');
        fetchOrders();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnOrder) return;
    try {
      const res = await api.post(`/orders/${returnOrder.id}/return`, {
        reason: returnReason,
        description: returnDesc
      });
      if (res.success) {
        showToast(res.message, 'success');
        setReturnOrder(null);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveAddrSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveAddress(addrForm);
      showToast('Address saved successfully!', 'success');
      setShowAddressModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-neutral-900">Please Sign In</h2>
        <p className="text-sm text-neutral-500">Sign in to access your orders, saved addresses, and profile details.</p>
        <Link to="/checkout" className="maroon-btn px-8 py-3 rounded-full text-xs font-semibold uppercase">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">My Customer Account</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Logged in as {user.name} ({user.email})</p>
        </div>
        <button
          onClick={logout}
          className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-2 text-xs font-semibold">
        {[
          { key: 'profile', label: 'My Profile', icon: User },
          { key: 'orders', label: 'My Orders', icon: Package },
          { key: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { key: 'wishlist', label: 'Wishlist', icon: Heart },
          { key: 'coupons', label: 'My Coupons', icon: Tag }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setSearchParams({ tab: t.key })}
              className={`px-4 py-2.5 rounded-full flex items-center gap-2 transition-all ${
                activeTab === t.key ? 'bg-brand-maroon text-white shadow-sm' : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm max-w-xl space-y-4">
          <h2 className="font-serif font-bold text-xl text-neutral-900 border-b border-neutral-100 pb-3">Personal Profile</h2>
          <div className="space-y-3 text-xs text-neutral-700">
            <div><span className="font-semibold text-neutral-400">Full Name:</span> <p className="text-sm font-bold text-neutral-900">{user.name}</p></div>
            <div><span className="font-semibold text-neutral-400">Email Address:</span> <p className="text-sm font-bold text-neutral-900">{user.email}</p></div>
            <div><span className="font-semibold text-neutral-400">Phone Number:</span> <p className="text-sm font-bold text-neutral-900">{user.phone || '+91 9876543210'}</p></div>
            <div><span className="font-semibold text-neutral-400">Account Role:</span> <p className="text-xs uppercase font-bold text-brand-maroon">{user.role}</p></div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <p className="text-xs text-neutral-500">Loading your order history...</p>
          ) : orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                  <div>
                    <span className="font-serif font-bold text-lg text-neutral-900">Order #{order.order_number}</span>
                    <p className="text-[11px] text-neutral-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {order.order_status}
                    </span>
                    <span className="font-bold text-brand-maroon text-base">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img src={item.image} alt={item.product_name} className="w-10 h-12 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{item.product_name}</p>
                        <p className="text-neutral-500">Qty: {item.quantity} • Size: {item.size || 'STD'}</p>
                      </div>
                      <span className="font-bold text-neutral-900">₹{item.total?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="pt-3 border-t border-neutral-100 flex flex-wrap gap-3 text-xs font-semibold">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="maroon-btn px-4 py-2 rounded-xl"
                  >
                    View Details & Invoice
                  </button>

                  {['pending', 'confirmed'].includes(order.order_status) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.order_status === 'delivered' && (
                    <button
                      onClick={() => setReturnOrder(order)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    >
                      Request Return / Replacement
                    </button>
                  )}
                </div>

              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-500 italic">No past orders found.</p>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <button
            onClick={() => setShowAddressModal(true)}
            className="maroon-btn px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            + Add New Delivery Address
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-2 relative">
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="absolute top-4 right-4 text-xs text-red-500 hover:underline font-medium"
                >
                  Delete
                </button>
                <h4 className="font-bold text-xs text-neutral-900">{addr.full_name} ({addr.phone})</h4>
                <p className="text-xs text-neutral-600">
                  {addr.house_flat}, {addr.street}, {addr.area ? addr.area + ', ' : ''}{addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
          <h2 className="font-serif font-bold text-xl text-neutral-900 mb-4">Saved Wishlist Items</h2>
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-2xl">
                  <img src={p.image_url || p.images?.[0]?.image_url} alt={p.name} className="w-14 h-16 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-neutral-900 truncate">{p.name}</p>
                    <p className="text-xs text-brand-maroon font-bold">₹{(p.sale_price || p.price)?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">No saved wishlist items.</p>
          )}
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-brand-champagne/40 rounded-3xl p-6 border border-brand-gold/40 space-y-2">
            <span className="bg-brand-gold text-neutral-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Flat 10% OFF</span>
            <h3 className="font-serif font-bold text-xl text-brand-maroon">WELCOME10</h3>
            <p className="text-xs text-neutral-600">Min. order ₹1,999. Max discount ₹1,000.</p>
          </div>
          <div className="bg-brand-champagne/40 rounded-3xl p-6 border border-brand-gold/40 space-y-2">
            <span className="bg-brand-maroon text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">₹500 Instant Discount</span>
            <h3 className="font-serif font-bold text-xl text-brand-maroon">FESTIVE500</h3>
            <p className="text-xs text-neutral-600">Min. order ₹4,999. Valid on all Kanjeevaram Sarees & Lehengas.</p>
          </div>
        </div>
      )}

      {/* Order Details & Printable Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 p-2 font-bold text-xs">
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-neutral-100 pb-4">
              <span className="text-xs text-brand-gold uppercase font-bold tracking-widest font-serif">Official Invoice</span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900">Order #{selectedOrder.order_number}</h2>
              <p className="text-xs text-neutral-500">Date: {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-900 mb-1">Shipping Address</h4>
                <p className="text-neutral-700">{selectedOrder.shipping_address}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900">Ordered Products</h4>
                {selectedOrder.items?.map(i => (
                  <div key={i.id} className="flex justify-between py-1 border-b border-neutral-100">
                    <span>{i.product_name} (x{i.quantity})</span>
                    <span className="font-bold">₹{i.total?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right space-y-1 text-xs">
                <p>Subtotal: ₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</p>
                <p>Shipping: ₹{selectedOrder.shipping_fee}</p>
                <p className="font-bold text-base text-brand-maroon">Total Paid: ₹{selectedOrder.total_amount?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => window.print()}
                className="maroon-btn px-6 py-2 rounded-full text-xs font-semibold uppercase flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print GST Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setReturnOrder(null)} className="absolute top-4 right-4 font-bold text-xs"><X className="w-5 h-5" /></button>
            <h3 className="font-serif font-bold text-xl text-neutral-900">Return Request</h3>
            <form onSubmit={handleReturnSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs outline-none"
                >
                  <option value="Fit issue">Size / Fit issue</option>
                  <option value="Color mismatch">Color / Design Mismatch</option>
                  <option value="Damaged item">Item Damaged in Transit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Detailed Explanation</label>
                <textarea
                  rows="3"
                  value={returnDesc}
                  onChange={(e) => setReturnDesc(e.target.value)}
                  placeholder="Describe your return issue..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>
              <button type="submit" className="w-full maroon-btn py-3 rounded-full text-xs font-semibold uppercase">
                Submit Return Claim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Save Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setShowAddressModal(false)} className="absolute top-4 right-4 font-bold text-xs"><X className="w-5 h-5" /></button>
            <h3 className="font-serif font-bold text-xl text-neutral-900">Add New Address</h3>
            <form onSubmit={handleSaveAddrSubmit} className="space-y-3">
              <input type="text" placeholder="Full Name" value={addrForm.full_name} onChange={e => setAddrForm({...addrForm, full_name: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs" required />
              <input type="text" placeholder="Phone Number" value={addrForm.phone} onChange={e => setAddrForm({...addrForm, phone: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs" required />
              <input type="text" placeholder="House / Flat No." value={addrForm.house_flat} onChange={e => setAddrForm({...addrForm, house_flat: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs" required />
              <input type="text" placeholder="Street / Colony" value={addrForm.street} onChange={e => setAddrForm({...addrForm, street: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs" required />
              <input type="text" placeholder="City" value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs" required />
              <input type="text" placeholder="PIN Code" value={addrForm.pincode} onChange={e => setAddrForm({...addrForm, pincode: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs" required />
              <button type="submit" className="w-full maroon-btn py-3 rounded-full text-xs font-semibold uppercase">Save Address</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
