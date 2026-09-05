import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    store_name: 'Radhamav Fashions',
    store_email: 'support@radhamav.com',
    store_phone: '+91 9876543210',
    store_address: '108 Silk Mill Avenue, Jubilee Hills, Hyderabad 500033',
    free_shipping_min: '999',
    standard_shipping_charge: '99',
    cod_enabled: 'true',
    gst_number: '36AAAAA0000A1Z5'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/cms/settings');
      if (res.success && Object.keys(res.settings).length) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/settings', settings);
      if (res.success) {
        showToast('Store configuration settings saved!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Store Settings & Configuration</h1>
        <p className="text-xs text-neutral-500">Configure business info, GST rules, shipping thresholds, and payment policies</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-lg text-neutral-900 border-b pb-2">General Business Info</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Store Brand Name</label>
            <input type="text" value={settings.store_name} onChange={e => setSettings({...settings, store_name: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Support Email</label>
            <input type="email" value={settings.store_email} onChange={e => setSettings({...settings, store_email: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Support Phone</label>
            <input type="text" value={settings.store_phone} onChange={e => setSettings({...settings, store_phone: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">GSTIN Tax Registration</label>
            <input type="text" value={settings.gst_number} onChange={e => setSettings({...settings, gst_number: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none uppercase" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Showroom Address</label>
          <input type="text" value={settings.store_address} onChange={e => setSettings({...settings, store_address: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
        </div>

        <h3 className="font-serif font-bold text-lg text-neutral-900 border-b pb-2 pt-4">Shipping & Payment Rules</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Free Shipping Threshold (₹)</label>
            <input type="number" value={settings.free_shipping_min} onChange={e => setSettings({...settings, free_shipping_min: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Standard Shipping Fee (₹)</label>
            <input type="number" value={settings.standard_shipping_charge} onChange={e => setSettings({...settings, standard_shipping_charge: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
          </div>
        </div>

        <button type="submit" className="maroon-btn px-8 py-3.5 rounded-full text-xs font-semibold uppercase flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Store Settings
        </button>
      </form>
    </div>
  );
}
