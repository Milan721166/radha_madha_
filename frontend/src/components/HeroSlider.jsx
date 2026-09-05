import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function HeroSlider() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/cms/banners');
      if (res.success && res.banners.length) {
        setBanners(res.banners);
      } else {
        // Fallback banner
        setBanners([
          {
            id: 1,
            title: 'Festive Luxury Couture 2026',
            subtitle: 'Flat 20% OFF on Kanjeevaram Sarees & Bridal Lehengas',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
            button_text: 'Explore Collection',
            button_link: '/shop'
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  if (!banners.length) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative w-full h-[500px] md:h-[620px] bg-neutral-900 overflow-hidden">
      {/* Background Banner Image with Hero Gradient Overlay */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
        <img
          src={current.image}
          alt={current.title}
          className="w-full h-full object-cover object-center scale-105 animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-900/60 to-transparent" />
      </div>

      {/* Hero Text Content */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl text-white space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-champagne text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>Radhamav Festive Couture</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-wide text-white">
            {current.title}
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed">
            {current.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to={current.button_link || '/shop'}
              className="gold-btn px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider shadow-lg flex items-center gap-2"
            >
              {current.button_text || 'Shop Collection'}
            </Link>
            <Link
              to="/shop?category=sarees"
              className="px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider text-white border border-white/40 hover:border-brand-gold hover:text-brand-gold transition-colors"
            >
              Kanjeevaram Sarees
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((currentIndex - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-brand-maroon transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((currentIndex + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-brand-maroon transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-8 bg-brand-gold' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
