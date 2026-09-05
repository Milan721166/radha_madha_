import React from 'react';
import { Filter, RotateCcw, Star } from 'lucide-react';

export default function FilterSidebar({
  categories = [],
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  selectedSize,
  onSizeChange,
  selectedColor,
  onColorChange,
  selectedRating,
  onRatingChange,
  onReset
}) {
  const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const colors = [
    { name: 'Ruby Red', hex: '#900C3F' },
    { name: 'Emerald Green', hex: '#004B23' },
    { name: 'Dusty Pink', hex: '#D8A7B1' },
    { name: 'Royal Maroon', hex: '#500B13' },
    { name: 'Mustard Yellow', hex: '#FFDB58' },
    { name: 'Sky Blue', hex: '#87CEEB' },
    { name: 'Navy Blue', hex: '#000080' },
    { name: 'Gold / Emerald', hex: '#D4AF37' }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand-maroon" />
          <h3 className="font-serif font-bold text-lg text-neutral-900">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-neutral-500 hover:text-brand-maroon flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Categories</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors flex items-center justify-between ${
              !selectedCategory ? 'bg-brand-maroon text-white font-semibold' : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug ? 'bg-brand-maroon text-white font-semibold' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCategory === cat.slug ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                {cat.product_count || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Price Filter</h4>
          <span className="text-xs font-bold text-brand-maroon">Up to ₹{priceRange.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="500"
          max="30000"
          step="500"
          value={priceRange}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full accent-brand-maroon cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
          <span>₹500</span>
          <span>₹30,000</span>
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Sizes</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map(sz => (
            <button
              key={sz}
              onClick={() => onSizeChange(selectedSize === sz ? '' : sz)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedSize === sz
                  ? 'border-brand-maroon bg-brand-maroon text-white'
                  : 'border-neutral-200 text-neutral-700 hover:border-brand-gold'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Colors</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map(c => (
            <button
              key={c.name}
              onClick={() => onColorChange(selectedColor === c.name ? '' : c.name)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                selectedColor === c.name ? 'border-brand-maroon scale-110 shadow-md' : 'border-white hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2].map(r => (
            <button
              key={r}
              onClick={() => onRatingChange(selectedRating === r ? '' : r)}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center gap-2 transition-colors ${
                selectedRating === r ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>{r} Stars & Above</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
