import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Folders, Boxes, ShoppingBag, Users, Tag, Image, FileText, Star, Settings, BarChart2, Store, LogOut, Lock, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logo from '../../logo.png';

export default function AdminLayout() {
  const { user, login, logout, isAdmin } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin Login State
  const [email, setEmail] = useState('milan@radhamadhav.com');
  const [password, setPassword] = useState('Milan@7894561230');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoggingIn(true);
      const res = await login(email, password);
      if (res.user?.role === 'admin') {
        showToast('Welcome to Radhamav Admin Portal!', 'success');
      } else {
        showToast('Access privilege error: Admin account required', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Invalid admin credentials', 'error');
    } finally {
      setLoggingIn(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-brand-obsidian flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 border border-brand-gold/30">
          
          <div className="text-center space-y-3">
            <img src={logo} alt="Radhamav Fashions Logo" className="h-12 w-auto object-contain mx-auto" />
            <div>
              <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">Management Portal</span>
              <h2 className="font-serif text-2xl font-bold text-neutral-900">Admin Sign In</h2>
            </div>
            <p className="text-xs text-neutral-500">Sign in to access Radhamav Fashions management console.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-gold"
              />
            </div>

            <div className="bg-brand-champagne/40 p-3 rounded-xl border border-brand-gold/30 text-[11px] text-neutral-700 space-y-0.5">
              <p className="font-bold text-brand-maroon">Default Admin Credentials:</p>
              <p>• Email: <span className="font-mono font-bold">milan@radhamadhav.com</span></p>
              <p>• Password: <span className="font-mono font-bold">Milan@7894561230</span></p>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full maroon-btn py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to Admin Portal'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/" className="text-xs text-neutral-500 hover:text-brand-maroon transition-colors">
              ← Return to Customer Storefront
            </Link>
          </div>

        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Categories', icon: Folders, path: '/admin/categories' },
    { label: 'Inventory Stock', icon: Boxes, path: '/admin/inventory' },
    { label: 'Orders & Returns', icon: ShoppingBag, path: '/admin/orders' },
    { label: 'Customers', icon: Users, path: '/admin/customers' },
    { label: 'Coupons & Promos', icon: Tag, path: '/admin/coupons' },
    { label: 'Hero Banners', icon: Image, path: '/admin/banners' },
    { label: 'CMS Pages', icon: FileText, path: '/admin/cms' },
    { label: 'Review Moderation', icon: Star, path: '/admin/reviews' },
    { label: 'Sales Reports', icon: BarChart2, path: '/admin/reports' },
    { label: 'Store Settings', icon: Settings, path: '/admin/settings' }
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header for Admin */}
      <div className="md:hidden bg-brand-obsidian text-white p-4 flex items-center justify-between border-b border-neutral-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-brand-gold focus:outline-none"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <img src={logo} alt="Radhamav Fashions Logo" className="h-8 w-auto bg-white/95 p-1 rounded-lg" />
        </div>
        <span className="text-[10px] text-brand-gold uppercase font-bold tracking-widest">Admin Control</span>
      </div>

      {/* Desktop & Mobile Responsive Admin Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-obsidian text-white p-6 flex flex-col justify-between border-r border-neutral-800 transition-transform duration-300 md:static md:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex flex-col gap-1">
              <img src={logo} alt="Radhamav Fashions Logo" className="h-10 w-auto object-contain bg-white/95 p-1 rounded-xl shadow-md self-start" />
              <span className="text-[10px] text-brand-gold font-sans uppercase tracking-[0.2em] font-semibold">Admin Portal</span>
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-neutral-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1 text-xs">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive ? 'bg-brand-maroon text-white font-bold shadow-md' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-800 space-y-2 text-xs">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-neutral-300 hover:text-brand-gold py-1.5 transition-colors"
          >
            <Store className="w-4 h-4 text-brand-gold" /> View Customer Store
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 py-1.5 transition-colors w-full text-left font-semibold"
          >
            <LogOut className="w-4 h-4" /> Exit Admin Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}
