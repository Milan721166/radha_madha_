import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const isSaved = isInWishlist(product.id);

  const mainImage = product.images?.[0]?.image_url || product.image_url || product.image || 'https://res.cloudinary.com/qxiwsbze/image/upload/v1726685000/saree_default.jpg';
  const hoverImage = product.images?.[1]?.image_url || mainImage;

  const currentPrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return (
    <div
      className="group relative bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-sm hover:shadow-2xl gold-glow-hover transition-all duration-500 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Dynamic Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {(product.stock ?? 0) <= 0 ? (
            <span className="bg-neutral-900/90 text-red-400 border border-red-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          ) : (
            <>
              {hasDiscount && (
                <span className="bg-gradient-to-r from-brand-maroon to-red-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
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
                  New Drop
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md transition-all ${
            isSaved ? 'text-red-500 bg-white scale-110' : 'text-neutral-600 hover:text-red-500 hover:scale-110'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-red-500' : ''}`} />
        </button>

        {/* Action Overlay Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="flex-1 bg-white/95 backdrop-blur-md hover:bg-white text-neutral-800 text-xs font-semibold py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          )}
          <button
            onClick={() => (product.stock ?? 0) > 0 && addToCart(product)}
            disabled={(product.stock ?? 0) <= 0}
            className={`flex-1 text-xs font-semibold py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all ${
              (product.stock ?? 0) <= 0
                ? 'bg-neutral-800 text-neutral-400 opacity-90 cursor-not-allowed'
                : 'maroon-btn'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {(product.stock ?? 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <p className="text-[11px] font-semibold text-brand-gold uppercase tracking-widest font-serif mb-0.5">
            {product.category_name || 'Radhamav Couture'}
          </p>
          
          <Link to={`/product/${product.slug}`} className="block group-hover:text-brand-maroon transition-colors">
            <h3 className="font-serif font-bold text-base text-neutral-900 line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-neutral-800">{product.rating_avg || 4.8}</span>
            <span className="text-[11px] text-neutral-400">({product.reviews_count || 14})</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-brand-maroon font-serif">
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
