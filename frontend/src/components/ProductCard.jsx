import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const isSaved = isInWishlist(product.id);

  const mainImage = product.images?.[0]?.image_url || product.image_url || product.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1]?.image_url || mainImage;

  const currentPrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Box */}
      <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-brand-maroon text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_bestseller === 1 && (
            <span className="bg-brand-gold text-neutral-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Bestseller
            </span>
          )}
          {product.is_new_arrival === 1 && !product.is_bestseller && (
            <span className="bg-neutral-900 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md transition-all ${
            isSaved ? 'text-red-500 bg-white' : 'text-neutral-600 hover:text-red-500 hover:scale-110'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Action Overlay Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="flex-1 bg-white/90 backdrop-blur-md hover:bg-white text-neutral-800 text-xs font-semibold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          )}
          <button
            onClick={() => addToCart(product)}
            className="flex-1 maroon-btn text-xs font-semibold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            {product.category_name || 'Radhamav Couture'}
          </p>
          
          <Link to={`/product/${product.slug}`} className="block group-hover:text-brand-maroon transition-colors">
            <h3 className="font-serif font-semibold text-base text-neutral-900 line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-neutral-700">{product.rating_avg || 4.5}</span>
            <span className="text-[11px] text-neutral-400">({product.reviews_count || 12})</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-brand-maroon">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through font-medium">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
