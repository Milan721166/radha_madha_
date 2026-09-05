import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCoupons() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_value: 1999,
    max_discount_amount: 1000
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons');
      if (res.success) setCoupons(res.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/coupons', formData);
      if (res.success) {
        showToast(res.message, 'success');
        setShowModal(false);
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon code?')) return;
    try {
      const res = await api.delete(`/admin/coupons/${id}`);
      if (res.success) {
        showToast('Coupon deleted', 'info');
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Promotional Coupon Management</h1>
          <p className="text-xs text-neutral-500">Create & manage promotional discount promo codes</p>
        </div>
        <button
          onClick={() => { setFormData({ code: '', discount_type: 'percentage', discount_value: 15, min_order_value: 1999, max_discount_amount: 1000 }); setShowModal(true); }}
          className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(c => (
          <div key={c.id} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-3 relative">
            <button onClick={() => handleDelete(c.id)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            <span className="bg-brand-gold text-neutral-900 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">{c.discount_type}</span>
            <h3 className="font-serif font-bold text-2xl text-brand-maroon">{c.code}</h3>
            <p className="text-xs text-neutral-600 font-medium">
              Discount: {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
            </p>
            <p className="text-[11px] text-neutral-400">Min Order: ₹{c.min_order_value} • Max Discount: ₹{c.max_discount_amount || 'No Limit'}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 font-bold text-xs"><X className="w-5 h-5" /></button>
            <h3 className="font-serif font-bold text-xl text-neutral-900">Create Promo Code</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Coupon Code</label>
                <input type="text" required placeholder="e.g. FESTIVE20" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Type</label>
                  <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Discount Value</label>
                  <input type="number" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: Number(e.target.value)})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Min Order Value (₹)</label>
                <input type="number" value={formData.min_order_value} onChange={e => setFormData({...formData, min_order_value: Number(e.target.value)})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <button type="submit" className="w-full maroon-btn py-3 rounded-full text-xs font-semibold uppercase">Save Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
