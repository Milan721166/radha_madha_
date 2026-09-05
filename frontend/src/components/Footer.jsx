import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Award, Instagram, Facebook, Youtube } from 'lucide-react';
import logo from '../logo.png';

export default function Footer() {
  return (
    <footer className="bg-brand-obsidian text-neutral-300 pt-16 pb-24 md:pb-12 border-t border-brand-gold/30">
      
      {/* Brand Value Propositions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/40 flex items-center justify-center text-brand-gold shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Free Express Shipping</h4>
            <p className="text-xs text-neutral-400">On all orders above ₹999 across India</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/40 flex items-center justify-center text-brand-gold shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">7-Day Easy Returns</h4>
            <p className="text-xs text-neutral-400">Hassle-free exchange & refund</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/40 flex items-center justify-center text-brand-gold shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">100% Handloom Silk</h4>
            <p className="text-xs text-neutral-400">Certified authentic silk weave</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-maroon/40 flex items-center justify-center text-brand-gold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">100% Secure Payment</h4>
            <p className="text-xs text-neutral-400">Encrypted UPI, Cards & NetBanking</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand Bio */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Radhamav Fashions Logo" className="h-10 w-auto object-contain brightness-110" />
            <span className="font-serif font-bold text-2xl tracking-wider text-white uppercase">
              Radhamav <span className="text-brand-gold text-xs font-sans tracking-[0.2em]">FASHIONS</span>
            </span>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6">
            Radhamav Fashions is a premier single-vendor Indian ethnic couture store. Celebrating centuries of handloom silk weaving, royal zari motifs, and modern bridal fashion.
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-gold hover:text-neutral-900 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-gold hover:text-neutral-900 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-gold hover:text-neutral-900 transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
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
            <li><Link to="/page/about-us" className="hover:text-brand-gold transition-colors">About Radhamav</Link></li>
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
              <span>108 Silk Mill Ave, Jubilee Hills, Hyderabad 500033</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-brand-gold shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-gold shrink-0" />
              <span>support@radhamav.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <p>© 2026 Radhamav Fashions. All Rights Reserved. GSTIN: 36AAAAA0000A1Z5.</p>
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
