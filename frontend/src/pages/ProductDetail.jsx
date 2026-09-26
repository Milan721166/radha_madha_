import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, Ruler, RefreshCw, Check, Share2, ThumbsUp, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SizeGuideModal from '../components/SizeGuideModal';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProductDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${slug}`);
      if (res.success) {
        setProduct(res.product);
        const primaryImg = res.product.images?.[0]?.image_url || res.product.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
        setActiveImage(primaryImg);

        if (res.product.variants?.length) {
          setSelectedSize(res.product.variants[0].size || 'M');
          setSelectedColor(res.product.variants[0].color || '');
        } else {
          setSelectedSize('Free Size');
        }
      }
    } catch (err) {
      console.error('Product detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-4">Product Not Found</h2>
        <Link to="/shop" className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase">
          Back to Shop Catalog
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const currentPrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const images = product.images?.length
    ? product.images.map(i => i.image_url)
    : [product.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = () => {
    addToCart(product, null, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, null, selectedSize, selectedColor, quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to post a verified review', 'info');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews/submit', {
        productId: product.id,
        rating: reviewRating,
        reviewText
      });
      if (res.success) {
        showToast(res.message, 'success');
        setReviewText('');
        fetchProductDetail();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumb */}
      <div className="text-xs text-neutral-400 flex items-center gap-2">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-neutral-900">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category_slug}`} className="hover:text-neutral-900">{product.category_name}</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold truncate">{product.name}</span>
      </div>

      {/* Main Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Gallery with Zoom & Thumbnails */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white border border-neutral-100 shadow-md">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-all duration-300" />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-brand-maroon text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img ? 'border-brand-gold scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Spec & Selection */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">
              Radhamav Couture • SKU: {product.sku}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1 mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-neutral-900 ml-1.5">{product.rating_avg || 4.9}</span>
              </div>
              <span className="text-xs text-neutral-400">({product.reviews_count || 18} Verified Customer Reviews)</span>
              <span className="text-xs text-neutral-300">•</span>
              {(product.stock ?? 0) > 0 ? (
                <span className="text-xs font-bold text-emerald-600">In Stock ({product.stock} units available)</span>
              ) : (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-brand-champagne/40 rounded-2xl p-4 border border-brand-gold/30 flex items-baseline gap-4">
            <span className="text-3xl font-bold text-brand-maroon font-serif">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through font-medium">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xs text-neutral-500 ml-auto font-medium">(Inclusive of all GST taxes)</span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-neutral-600 leading-relaxed">
            {product.short_desc || product.description}
          </p>

          {/* Size Picker */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800">Available Size</label>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-xs text-brand-maroon hover:underline font-semibold flex items-center gap-1"
              >
                <Ruler className="w-3.5 h-3.5" /> View Size Chart
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-5 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                    selectedSize === sz
                      ? 'border-brand-maroon bg-brand-maroon text-white shadow-md'
                      : 'border-neutral-200 text-neutral-700 hover:border-brand-gold bg-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800">Quantity</label>
            <div className="flex items-center gap-4 w-36 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={(product.stock ?? 0) <= 0}
                className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-sm">{(product.stock ?? 0) <= 0 ? 0 : quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                disabled={(product.stock ?? 0) <= 0 || quantity >= (product.stock || 0)}
                className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            {quantity >= (product.stock || 0) && (product.stock ?? 0) > 0 && (
              <p className="text-[11px] text-amber-700 font-medium">Maximum available stock ({product.stock}) selected</p>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 space-y-3">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={(product.stock ?? 0) <= 0}
                className={`flex-1 py-4 rounded-2xl font-semibold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                  (product.stock ?? 0) <= 0
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                    : 'maroon-btn'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {(product.stock ?? 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={(product.stock ?? 0) <= 0}
                className={`flex-1 py-4 rounded-2xl font-semibold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                  (product.stock ?? 0) <= 0
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                    : 'gold-btn'
                }`}
              >
                Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-2xl border transition-colors flex items-center justify-center ${
                  isSaved ? 'border-red-500 bg-red-50 text-red-500' : 'border-neutral-200 bg-white text-neutral-700 hover:border-red-400'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Brand Assurances */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-gold" />
              <span>Free Express Delivery &gt; ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-gold" />
              <span>7-Day Easy Replacement</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>Certified Handloom Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-brand-gold" />
              <span>COD Payment Available</span>
            </div>
          </div>

        </div>
      </div>

      {/* Fabric, Care & Specifications Tabs */}
      <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm space-y-6">
        <h3 className="font-serif text-2xl font-bold text-neutral-900 border-b border-neutral-100 pb-4">
          Product Details & Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-neutral-700">
          <div>
            <h4 className="font-semibold text-brand-maroon uppercase tracking-wider text-xs mb-2">Material & Weave</h4>
            <p className="text-neutral-600">{product.material || '100% Pure Silk'}</p>
            <p className="text-neutral-600 mt-1">{product.fabric || 'Handwoven Kanjeevaram with Real Zari'}</p>
          </div>

          <div>
            <h4 className="font-semibold text-brand-maroon uppercase tracking-wider text-xs mb-2">Care Instructions</h4>
            <p className="text-neutral-600">{product.care_instructions || 'Dry Clean Only. Keep stored in cotton cover.'}</p>
          </div>

          <div>
            <h4 className="font-semibold text-brand-maroon uppercase tracking-wider text-xs mb-2">Shipping & Returns</h4>
            <p className="text-neutral-600">Dispatched within 24 hours. Express shipping takes 3-5 business days across India.</p>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Verified Rating Section */}
      <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-neutral-900">Customer Ratings & Reviews</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-neutral-900 text-lg">{product.rating_avg || 4.8} out of 5</span>
              <span className="text-xs text-neutral-400">({product.reviews_count || 12} customer reviews)</span>
            </div>
          </div>
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-4">
          <h4 className="font-semibold text-sm text-neutral-900">Write a Verified Review</h4>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-600">Your Rating:</span>
            <div className="flex items-center gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`w-5 h-5 transition-colors ${star <= reviewRating ? 'text-amber-400 fill-current' : 'text-neutral-300'}`}
                />
              ))}
            </div>
          </div>

          <textarea
            rows="3"
            placeholder="Share your feedback about the fit, fabric quality, and finish..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-sm outline-none focus:border-brand-gold"
          />

          <button
            type="submit"
            disabled={submittingReview}
            className="maroon-btn px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5"
          >
            Submit Review <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews?.length > 0 ? (
            product.reviews.map(rev => (
              <div key={rev.id} className="p-4 rounded-2xl border border-neutral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-neutral-900">{rev.user_name}</span>
                    {rev.verified_purchase === 1 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">{new Date(rev.created_at || Date.now()).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed">{rev.review_text}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-500 italic text-center py-4">No reviews submitted yet for this product. Be the first to review!</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts?.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-serif text-2xl font-bold text-neutral-900">You May Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuideModal onClose={() => setShowSizeGuide(false)} />
      )}
    </div>
  );
}
