import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    store_name: 'Radhamav Fashions',
    store_email: 'support@radhamav.com',
    store_phone: '+91 6296740204',
    store_address: 'Sahoo House, 6FFX+RP6, Makrampur - Temathani Rd, Larma, Larma Batitaki, West Bengal 721166'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/cms/settings');
        if (res.success && res.settings) {
          setSettings(prev => ({ ...prev, ...res.settings }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/cms/contact', formData);
      if (res.success) {
        showToast(res.message, 'success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const cleanPhone = (settings.store_phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">{settings.store_name} Concierge</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">Get In Touch With Us</h1>
        <p className="text-sm text-neutral-500">Our customer support concierge is ready to assist with sizing, order inquiries, and bridal consultation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Sidebar */}
        <div className="bg-brand-obsidian text-white rounded-3xl p-8 space-y-8 border border-brand-gold/30 shadow-xl">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white mb-2">Store Headquarters</h3>
            <p className="text-xs text-neutral-300">Visit our flagship couture showroom or connect via WhatsApp.</p>
          </div>

          <div className="space-y-6 text-sm text-neutral-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-maroon/50 flex items-center justify-center text-brand-gold shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Showroom Address</h4>
                <p className="text-xs text-neutral-400 mt-0.5">{settings.store_address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-maroon/50 flex items-center justify-center text-brand-gold shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Phone Support</h4>
                <p className="text-xs text-neutral-400 mt-0.5">{settings.store_phone} (Mon - Sat, 10 AM - 7 PM)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-maroon/50 flex items-center justify-center text-brand-gold shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Email Address</h4>
                <p className="text-xs text-neutral-400 mt-0.5">{settings.store_email}</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Chat Button */}
          <div className="pt-4 border-t border-neutral-800">
            <a
              href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(settings.store_name)},%20I%20have%20an%20inquiry`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm space-y-6">
          <h2 className="font-serif text-2xl font-bold text-neutral-900 border-b border-neutral-100 pb-4">
            Send an Enquiry
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 Mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Order Inquiry, Sizing, etc."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Message</label>
              <textarea
                rows="4"
                required
                placeholder="Write your query details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs outline-none focus:border-brand-gold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="maroon-btn px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
            >
              {loading ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
