import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, Tag, Send } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import SizeGuideModal from '../components/SizeGuideModal';
import { GridSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Home() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [catRes, newRes, bestRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?newArrival=true&limit=8'),
        api.get('/products?bestseller=true&limit=8')
      ]);

      if (catRes.success) setCategories(catRes.categories);
      if (newRes.success) setNewArrivals(newRes.products);
      if (bestRes.success) setBestsellers(bestRes.products);

      // Customer Reviews
      setReviews([
        {
          id: 1,
          name: 'Ananya Sharma',
          rating: 5,
          review: 'The Kanjeevaram Saree I ordered for my sister’s wedding is breathtaking! The zari weave and rich ruby red color are 100% authentic pure silk.',
          product: 'Kanjeevaram Royal Silk Saree',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: 2,
          name: 'Priya Sundaram',
          rating: 5,
          review: 'Radhamav Fashions kurtis have the best fitting. The Chanderi silk fabric is extremely soft and breathable. Fast delivery in 2 days!',
          product: 'Anarkali Chanderi Kurti Set',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: 3,
          name: 'Meera Nair',
          rating: 5,
          review: 'Exquisite Kundan choker set. High quality gold finish that looks just like genuine jewelry. Extremely satisfied with packaging.',
          product: 'Handcrafted Kundan Choker',
          image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
        }
      ]);
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast('Thank you for subscribing to Radhamav Fashions Insider Club!', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">Curated Collections</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">Explore Couture Categories</h2>
          <p className="text-sm text-neutral-500">Discover handcrafted sarees, bridal lehengas, and royal ethnic couture.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-900/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="font-serif font-bold text-lg md:text-xl text-white group-hover:text-brand-gold transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-neutral-300 font-light mt-0.5">
                  {cat.product_count || 12}+ Designs
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-neutral-200 pb-4">
          <div>
            <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">Fresh Drop</span>
            <h2 className="font-serif text-3xl font-bold text-neutral-900">New Arrivals</h2>
          </div>
          <Link
            to="/shop?newArrival=true"
            className="text-sm font-semibold text-brand-maroon hover:text-brand-maroonDark flex items-center gap-1.5 transition-colors"
          >
            View All New Arrivals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-obsidian p-8 md:p-12 text-white border border-brand-gold/30 shadow-2xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-semibold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Festive Season Offer</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight">
              Flat 20% OFF On Royal Kanjeevaram Sarees
            </h2>
            <p className="text-sm text-neutral-300">
              Use promo code <span className="text-brand-gold font-bold bg-neutral-800 px-2 py-0.5 rounded">FESTIVE500</span> at checkout for instant savings.
            </p>
            <div>
              <Link
                to="/shop?category=sarees"
                className="gold-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg"
              >
                Shop Festive Sarees <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block opacity-40">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              alt="Promo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-neutral-200 pb-4">
          <div>
            <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">Customer Favorites</span>
            <h2 className="font-serif text-3xl font-bold text-neutral-900">Best Sellers</h2>
          </div>
          <Link
            to="/shop?bestseller=true"
            className="text-sm font-semibold text-brand-maroon hover:text-brand-maroonDark flex items-center gap-1.5 transition-colors"
          >
            Explore Best Sellers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews Slider */}
      <section className="bg-brand-cream/60 py-16 border-y border-brand-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">Real Customer Words</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">Loved By Women Across India</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 italic leading-relaxed">
                    "{rev.review}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                  <img src={rev.image} alt={rev.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{rev.name}</h4>
                    <p className="text-[11px] text-brand-maroon font-medium">Verified Buyer • {rev.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-maroon to-brand-maroonDark rounded-3xl p-8 md:p-12 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <Sparkles className="w-8 h-8 text-brand-gold mx-auto" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Join Radhamav Couture Club</h2>
            <p className="text-sm text-neutral-200">
              Subscribe to get exclusive early access to festive drop collections, private sales, and ₹500 off your first order.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="flex-1 bg-white text-neutral-900 px-5 py-3.5 rounded-full text-sm outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="gold-btn px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
            >
              Subscribe <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onOpenSizeGuide={() => setShowSizeGuide(true)}
        />
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuideModal onClose={() => setShowSizeGuide(false)} />
      )}
    </div>
  );
}
