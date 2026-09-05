import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminBanners() {
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    button_text: 'Shop Now',
    button_link: '/shop'
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/admin/banners');
      if (res.success) setBanners(res.banners);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/banners', formData);
      if (res.success) {
        showToast(res.message, 'success');
        setShowModal(false);
        fetchBanners();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete banner?')) return;
    try {
      const res = await api.delete(`/admin/banners/${id}`);
      if (res.success) {
        showToast('Banner deleted', 'info');
        fetchBanners();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Homepage Hero Banners</h1>
          <p className="text-xs text-neutral-500">Manage hero slider images, promotional titles, and CTA links</p>
        </div>
        <button
          onClick={() => { setFormData({ title: '', subtitle: '', image: '', button_text: 'Shop Now', button_link: '/shop' }); setShowModal(true); }}
          className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm relative space-y-4 p-4">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100 relative">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <button onClick={() => handleDelete(b.id)} className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full shadow-md"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">{b.title}</h3>
              <p className="text-xs text-neutral-500">{b.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 font-bold text-xs"><X className="w-5 h-5" /></button>
            <h3 className="font-serif font-bold text-xl text-neutral-900">Add Hero Banner</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Banner Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Subtitle / Offer Description</label>
                <input type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Image URL</label>
                <input type="url" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Button CTA Text</label>
                <input type="text" value={formData.button_text} onChange={e => setFormData({...formData, button_text: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <button type="submit" className="w-full maroon-btn py-3 rounded-full text-xs font-semibold uppercase">Save Banner</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
