import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function BottomNav() {
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Shop', icon: Store, path: '/shop' },
    { label: 'Wishlist', icon: Heart, path: '/wishlist', badge: wishlistCount },
    { label: 'Cart', icon: ShoppingBag, path: '/cart', badge: cartCount },
    { label: 'Account', icon: User, path: '/account' }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 p-1.5 relative transition-colors ${
              isActive ? 'text-brand-maroon font-semibold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-maroon text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
