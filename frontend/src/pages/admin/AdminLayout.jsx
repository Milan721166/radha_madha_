import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Folders, Boxes, ShoppingBag, Users, Tag, Image, FileText, Star, Settings, BarChart2, Store, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../logo.png';

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-red-600">Access Denied</h2>
        <p className="text-sm text-neutral-500">You must be logged in as an administrator (`admin@radhamav.com` / `admin123`) to access the Admin Portal.</p>
        <Link to="/checkout" className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase">
          Sign In As Admin
        </Link>
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
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-brand-obsidian text-white shrink-0 p-6 flex flex-col justify-between border-r border-neutral-800">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Radhamav Fashions Logo" className="h-9 w-auto object-contain brightness-110" />
            <div>
              <span className="font-serif font-bold text-lg text-white uppercase">Radhamav</span>
              <span className="block text-[10px] text-brand-gold font-sans uppercase tracking-widest -mt-1">Admin Portal</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.label}
                  to={item.path}
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}
