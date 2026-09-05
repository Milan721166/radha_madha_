import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, RefreshCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import QuickViewModal from '../components/QuickViewModal';
import SizeGuideModal from '../components/SizeGuideModal';
import { GridSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState(30000);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Read query params from URL if changed
    const searchFromUrl = searchParams.get('search') || '';
    const catFromUrl = searchParams.get('category') || '';
    setSearchQuery(searchFromUrl);
    setSelectedCategory(catFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, priceRange, selectedSize, selectedColor, selectedRating, sortBy, page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParts = [
        `page=${page}`,
        `limit=12`,
        `sort=${sortBy}`
      ];

      if (searchQuery) queryParts.push(`search=${encodeURIComponent(searchQuery)}`);
      if (selectedCategory) queryParts.push(`category=${selectedCategory}`);
      if (priceRange < 30000) queryParts.push(`maxPrice=${priceRange}`);
      if (selectedSize) queryParts.push(`size=${selectedSize}`);
      if (selectedColor) queryParts.push(`color=${selectedColor}`);
      if (selectedRating) queryParts.push(`rating=${selectedRating}`);

      if (searchParams.get('newArrival') === 'true') queryParts.push(`newArrival=true`);
      if (searchParams.get('bestseller') === 'true') queryParts.push(`bestseller=true`);

      const res = await api.get(`/products?${queryParts.join('&')}`);
      if (res.success) {
        setProducts(res.products);
        setTotalProducts(res.total);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange(30000);
    setSelectedSize('');
    setSelectedColor('');
    setSelectedRating('');
    setSortBy('latest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">Radhamav Catalog</span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 capitalize">
            {selectedCategory ? selectedCategory.replace('-', ' ') : searchQuery ? `Search: "${searchQuery}"` : 'All Couture Collection'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Showing {products.length} of {totalProducts} items</p>
        </div>

        {/* Sorting Dropdown & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-4 py-2 bg-white rounded-full border border-neutral-200 text-xs font-semibold flex items-center gap-2 text-neutral-800 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-maroon" /> Filters
          </button>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-neutral-200 shadow-sm text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-neutral-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-neutral-900 outline-none cursor-pointer"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => { setSelectedCategory(cat); setPage(1); }}
            priceRange={priceRange}
            onPriceChange={(val) => { setPriceRange(val); setPage(1); }}
            selectedSize={selectedSize}
            onSizeChange={(sz) => { setSelectedSize(sz); setPage(1); }}
            selectedColor={selectedColor}
            onColorChange={(clr) => { setSelectedColor(clr); setPage(1); }}
            selectedRating={selectedRating}
            onRatingChange={(r) => { setSelectedRating(r); setPage(1); }}
            onReset={resetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 relative space-y-4 max-w-lg mx-auto">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 font-bold text-xs"
              >
                Close
              </button>
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={(cat) => { setSelectedCategory(cat); setPage(1); setMobileFilterOpen(false); }}
                priceRange={priceRange}
                onPriceChange={(val) => { setPriceRange(val); setPage(1); }}
                selectedSize={selectedSize}
                onSizeChange={(sz) => { setSelectedSize(sz); setPage(1); }}
                selectedColor={selectedColor}
                onColorChange={(clr) => { setSelectedColor(clr); setPage(1); }}
                selectedRating={selectedRating}
                onRatingChange={(r) => { setSelectedRating(r); setPage(1); }}
                onReset={resetFilters}
              />
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <GridSkeleton count={6} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-100 space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-brand-champagne mx-auto flex items-center justify-center text-brand-maroon">
                <RefreshCcw className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-neutral-900">No Couture Items Found</h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                We couldn't find any products matching your active filter criteria. Try adjusting your filters or price range.
              </p>
              <button
                onClick={resetFilters}
                className="maroon-btn px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

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
