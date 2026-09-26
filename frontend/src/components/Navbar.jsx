import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, ShieldCheck, LogOut, Package, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import logo from '../logo.png';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const [categoriesNav, setCategoriesNav] = useState([]);
  const [settings, setSettings] = useState({
    top_bar_enabled: 'true',
    top_bar_text: 'Festive Offer: Flat 20% OFF on Kanjeevaram Sarees & Bridal Collection | Free Express Shipping',
    top_bar_bg_color: '#121212',
    top_bar_text_color: '#f3e5ab'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, catRes] = await Promise.all([
          api.get('/cms/settings'),
          api.get('/categories')
        ]);
        if (settingsRes.success && settingsRes.settings) {
          setSettings(prev => ({ ...prev, ...settingsRes.settings }));
        }
        if (catRes.success && catRes.categories) {
          setCategoriesNav(catRes.categories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSearchPopup(false);
    setUserDropdownOpen(false);
  }, [location]);

  // Handle Search Autosuggest
  useEffect(() => {
    const fetchAutosuggest = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await api.get(`/products/autosuggest?q=${encodeURIComponent(searchQuery)}`);
          if (res.success) {
            setSuggestions(res.suggestions);
            setShowSearchPopup(true);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions({ products: [], categories: [] });
        setShowSearchPopup(false);
      }
    };

    const timer = setTimeout(fetchAutosuggest, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchPopup(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-gold/20 shadow-sm">
      {/* Top Banner Notice */}
      {settings.top_bar_enabled === 'true' && (
        <div
          style={{ backgroundColor: settings.top_bar_bg_color || '#121212', color: settings.top_bar_text_color || '#f3e5ab' }}
          className="py-2 px-4 text-center text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all leading-normal min-h-[32px]"
        >
          <Tag className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span className="truncate max-w-full sm:whitespace-normal">{settings.top_bar_text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 lg:gap-4">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-700 hover:text-brand-maroon focus:outline-none shrink-0"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <img src={logo} alt="Radhamadhav Fashions Logo" className="h-10 sm:h-12 md:h-14 w-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2.5 xl:gap-5 2xl:gap-7 font-medium text-xs xl:text-sm text-neutral-800 shrink min-w-0">
            <Link to="/" className="hover:text-brand-maroon transition-colors py-1 shrink-0">Home</Link>
            <Link to="/shop" className="hover:text-brand-maroon transition-colors py-1 shrink-0">Shop All</Link>
            {categoriesNav.slice(0, 4).map(cat => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="hover:text-brand-maroon transition-colors py-1 shrink-0 truncate max-w-[120px] xl:max-w-none"
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/contact" className="hover:text-brand-maroon transition-colors py-1 shrink-0">Contact</Link>
          </nav>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 xl:gap-4 shrink-0">
            
            {/* Search Bar Input */}
            <div className="relative hidden md:block w-36 lg:w-44 xl:w-60 2xl:w-72" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search Sarees, Kurtis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchPopup(true)}
                  className="w-full bg-neutral-100/80 border border-neutral-200 focus:border-brand-gold rounded-full py-1.5 xl:py-2 pl-3 xl:pl-4 pr-9 text-xs xl:text-sm outline-none transition-all placeholder:text-neutral-400"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-maroon">
                  <Search className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </button>
              </form>

              {/* Autosuggest Popup */}
              {showSearchPopup && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden z-50 p-3">
                  {suggestions.categories.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.categories.map(cat => (
                          <Link
                            key={cat.id}
                            to={`/shop?category=${cat.slug}`}
                            className="text-xs bg-neutral-100 hover:bg-brand-champagne hover:text-brand-maroon px-2.5 py-1 rounded-full text-neutral-700 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.products.length > 0 ? (
                    <div>
                      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Products</p>
                      <div className="flex flex-col gap-2">
                        {suggestions.products.map(p => (
                          <Link
                            key={p.id}
                            to={`/product/${p.slug}`}
                            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-md" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-neutral-900 truncate">{p.name}</p>
                              <p className="text-xs text-brand-maroon font-semibold">₹{(p.sale_price || p.price).toLocaleString('en-IN')}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 py-2 text-center">No products matching query</p>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative p-2 text-neutral-700 hover:text-brand-maroon transition-colors" title="Wishlist">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-maroon text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-neutral-700 hover:text-brand-maroon transition-colors" title="Shopping Cart">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-gold text-neutral-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / User Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-maroon text-white font-medium text-sm flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-500 hidden sm:block" />
                </button>
              ) : (
                <Link
                  to="/checkout"
                  className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-brand-maroon px-3 py-1.5 rounded-full border border-neutral-200 hover:border-brand-gold transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Account Dropdown */}
              {userDropdownOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-maroon font-semibold bg-brand-champagne/40 hover:bg-brand-champagne transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link to="/account" className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                    <User className="w-4 h-4" />
                    My Account Profile
                  </Link>

                  <Link to="/account?tab=orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                    <Package className="w-4 h-4" />
                    My Orders
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-neutral-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 border border-neutral-200 rounded-full py-2 pl-4 pr-10 text-sm outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <nav className="flex flex-col gap-2 font-medium text-neutral-800">
            <Link to="/" className="py-2 border-b border-neutral-100">Home</Link>
            <Link to="/shop" className="py-2 border-b border-neutral-100 font-semibold text-brand-maroon">Shop All Catalog</Link>
            {categoriesNav.map(cat => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="py-2 border-b border-neutral-100"
              >
                {cat.name} Collection
              </Link>
            ))}
            <Link to="/contact" className="py-2">Contact Us</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
