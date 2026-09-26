import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Award, Instagram, Facebook, Youtube } from 'lucide-react';
import api from '../services/api';
import logo from '../logo.png';

export default function Footer() {
  const [settings, setSettings] = useState({
    store_name: 'Radhamav Fashions',
    store_email: 'support@radhamav.com',
    store_phone: '+91 6296740204',
    store_address: 'Sahoo House, 6FFX+RP6, Makrampur - Temathani Rd, Larma, Larma Batitaki, West Bengal 721166',
    gst_number: '36AAAAA0000A1Z5',
    footer_bio: 'Radhamav Fashions is a premier single-vendor Indian ethnic couture store. Celebrating centuries of handloom silk weaving, royal zari motifs, and modern bridal fashion.',
    social_instagram: 'https://instagram.com',
    social_facebook: 'https://facebook.com',
    social_youtube: 'https://youtube.com',
    value_prop_1_title: 'Free Express Shipping',
    value_prop_1_desc: 'On all orders above ₹999 across India',
    value_prop_2_title: '7-Day Easy Returns',
    value_prop_2_desc: 'Hassle-free exchange & refund',
    value_prop_3_title: '100% Handloom Silk',
    value_prop_3_desc: 'Certified authentic silk weave',
    value_prop_4_title: '100% Secure Payment',
    value_prop_4_desc: 'Encrypted UPI, Cards & NetBanking'
  });

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

  return (
    <footer className="bg-brand-obsidian text-neutral-300 pt-16 pb-24 md:pb-12 border-t border-brand-gold/30">
      
      {/* Brand Value Propositions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/40 flex items-center justify-center text-brand-gold shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{settings.value_prop_1_title}</h4>
            <p className="text-xs text-neutral-400">{settings.value_prop_1_desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/40 flex items-center justify-center text-brand-gold shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{settings.value_prop_2_title}</h4>
            <p className="text-xs text-neutral-400">{settings.value_prop_2_desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/40 flex items-center justify-center text-brand-gold shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{settings.value_prop_3_title}</h4>
            <p className="text-xs text-neutral-400">{settings.value_prop_3_desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/40 flex items-center justify-center text-brand-gold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{settings.value_prop_4_title}</h4>
            <p className="text-xs text-neutral-400">{settings.value_prop_4_desc}</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand Bio */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Radhamav Fashions Logo" className="h-12 w-auto object-contain bg-white/90 p-1.5 rounded-xl shadow-md" />
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6">
            {settings.footer_bio}
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            {settings.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-gold hover:text-neutral-900 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {settings.social_facebook && (
              <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-gold hover:text-neutral-900 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings.social_youtube && (
              <a href={settings.social_youtube} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-gold hover:text-neutral-900 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Collections */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4 font-serif">Quick Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/shop?category=sarees" className="hover:text-brand-gold transition-colors">Kanjeevaram Sarees</Link></li>
            <li><Link to="/shop?category=kurtis" className="hover:text-brand-gold transition-colors">Anarkali Kurtis</Link></li>
            <li><Link to="/shop?category=lehengas" className="hover:text-brand-gold transition-colors">Bridal Lehengas</Link></li>
            <li><Link to="/shop?category=salwar-suits" className="hover:text-brand-gold transition-colors">Salwar Suits</Link></li>
            <li><Link to="/shop?category=accessories" className="hover:text-brand-gold transition-colors">Kundan Jewelry</Link></li>
            <li><Link to="/shop?category=mens-fashion" className="hover:text-brand-gold transition-colors">Men's Jacquard Kurtas</Link></li>
          </ul>
        </div>

        {/* Customer Service & Policies */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4 font-serif">Customer Care</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/page/about-us" className="hover:text-brand-gold transition-colors">About {settings.store_name || 'Radhamav'}</Link></li>
            <li><Link to="/page/privacy-policy" className="hover:text-brand-gold transition-colors">Privacy Policy</Link></li>
            <li><Link to="/page/terms-and-conditions" className="hover:text-brand-gold transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/page/refund-policy" className="hover:text-brand-gold transition-colors">Refund & Return Policy</Link></li>
            <li><Link to="/page/shipping-policy" className="hover:text-brand-gold transition-colors">Shipping Policy</Link></li>
            <li><Link to="/track-order" className="hover:text-brand-gold transition-colors">Track Your Order</Link></li>
          </ul>
        </div>

        {/* Store Contact Info */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4 font-serif">Store Helpdesk</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
              <span>{settings.store_address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-brand-gold shrink-0" />
              <span>{settings.store_phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-gold shrink-0" />
              <span>{settings.store_email}</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <p>© 2026 {settings.store_name}. All Rights Reserved. GSTIN: {settings.gst_number}.</p>
        <div className="flex items-center gap-4 text-neutral-400">
          <span>UPI / GPay</span>
          <span>•</span>
          <span>Visa & MasterCard</span>
          <span>•</span>
          <span>NetBanking</span>
          <span>•</span>
          <span>Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
}
