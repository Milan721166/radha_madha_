import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, Ruler } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function QuickViewModal({ product, onClose, onOpenSizeGuide }) {
  if (!product) return null;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState(product.variants?.[0]?.size || 'M');
  const [selectedColor, setSelectedColor] = useState(product.variants?.[0]?.color || '');
  const [quantity, setQuantity] = useState(1);

  const isSaved = isInWishlist(product.id);

  const images = product.images?.length 
    ? product.images.map(i => i.image_url)
    : [product.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'];

  const [activeImage, setActiveImage] = useState(images[0]);

  const currentPrice = product.sale_price || product.price;

  const handleAddToCart = () => {
    addToCart(product, null, selectedSize, selectedColor, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-100 relative p-6 md:p-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100">
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img ? 'border-brand-gold scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-1 font-serif">
                Radhamav Couture
              </p>

              <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold text-neutral-800 ml-1">{product.rating_avg || 4.8}</span>
                </div>
                <span className="text-xs text-neutral-400">({product.reviews_count || 14} reviews)</span>
                <span className="text-xs text-neutral-300">•</span>
                <span className="text-xs font-semibold text-emerald-600">In Stock ({product.stock || 25} available)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl md:text-3xl font-bold text-brand-maroon">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {product.sale_price && product.sale_price < product.price && (
                  <span className="text-sm text-neutral-400 line-through font-medium">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                {product.short_desc || product.description}
              </p>

              {/* Size Picker */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700">Select Size</label>
                  {onOpenSizeGuide && (
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-xs text-brand-maroon hover:underline flex items-center gap-1 font-medium"
                    >
                      <Ruler className="w-3.5 h-3.5" /> Size Guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        selectedSize === sz
                          ? 'border-brand-maroon bg-brand-maroon text-white shadow-sm'
                          : 'border-neutral-200 text-neutral-700 hover:border-brand-gold'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3 w-32 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-neutral-700"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-semibold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-neutral-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 maroon-btn py-3.5 rounded-2xl font-semibold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Shopping Bag
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-center ${
                    isSaved ? 'border-red-500 bg-red-50 text-red-500' : 'border-neutral-200 text-neutral-600 hover:border-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-around text-[11px] text-neutral-500 pt-2">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-brand-gold" /> Free Shipping &gt; ₹999</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-brand-gold" /> 100% Authentic Silk</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
