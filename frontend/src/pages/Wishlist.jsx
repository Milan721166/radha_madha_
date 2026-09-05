import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-champagne mx-auto flex items-center justify-center text-brand-maroon">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-neutral-900">Your Wishlist is Empty</h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Save your favorite royal silk sarees, designer kurtis, and Kundan jewelry pieces to review later.
        </p>
        <Link to="/shop" className="maroon-btn px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2">
          Explore Couture <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">My Saved Wishlist</h1>
        <p className="text-xs text-neutral-500 mt-1">{wishlist.length} saved couture items</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl p-4 border border-neutral-100 shadow-sm flex flex-col justify-between space-y-4">
            
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100">
              <img src={item.image_url || item.images?.[0]?.image_url} alt={item.name} className="w-full h-full object-cover" />
              <button
                onClick={() => toggleWishlist(item)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white text-red-500 shadow-md hover:scale-110 transition-all"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-sm text-neutral-900 truncate">{item.name}</h3>
              <p className="font-bold text-sm text-brand-maroon">₹{(item.sale_price || item.price)?.toLocaleString('en-IN')}</p>
            </div>

            <button
              onClick={() => {
                addToCart(item);
                toggleWishlist(item);
              }}
              className="w-full maroon-btn py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Move to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
