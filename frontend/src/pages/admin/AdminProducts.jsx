import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUploader from '../../components/ImageUploader';

const INITIAL_FORM = {
  name: '', sku: '', category_id: 1, brand: '',
  short_desc: '', description: '',
  color: '', pattern: '', fit_shape: '', neck: '', sleeve_length: '',
  length: '', occasion: '', stitch_type: '',
  price: '', sale_price: '', cost_price: '', stock: 20,
  gst_rate: '', hsn_code: '', product_weight: '',
  material: '', fabric: '', care_instructions: '',
  country_of_origin: 'India', manufacturer_name: '', manufacturer_address: '',
  is_featured: false, is_bestseller: false, is_new_arrival: true,
  status: 'published',
  seo_title: '', seo_description: '', url_slug: '', tags: '',
  image_url_1: '', image_url_2: ''
};

function SectionToggle({ title, open, onToggle, children }) {
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 transition-colors">
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Section toggles
  const [openSections, setOpenSections] = useState({
    basic: true, garment: true, pricing: true, compliance: false, images: true, seo: false, flags: true
  });

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products');
      if (res.success) setProducts(res.products);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.categories);
    } catch (err) { console.error(err); }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...INITIAL_FORM,
      sku: `RM-PRODUCT-${Date.now().toString().slice(-4)}`,
      category_id: categories[0]?.id || 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '', sku: p.sku || '', category_id: p.category_id, brand: p.brand || '',
      short_desc: p.short_desc || '', description: p.description || '',
      color: p.color || '', pattern: p.pattern || '', fit_shape: p.fit_shape || '',
      neck: p.neck || '', sleeve_length: p.sleeve_length || '', length: p.length || '',
      occasion: p.occasion || '', stitch_type: p.stitch_type || '',
      price: p.price || '', sale_price: p.sale_price || '', cost_price: p.cost_price || '',
      stock: p.stock || 0,
      gst_rate: p.gst_rate || '', hsn_code: p.hsn_code || '', product_weight: p.product_weight || '',
      material: p.material || '', fabric: p.fabric || '', care_instructions: p.care_instructions || '',
      country_of_origin: p.country_of_origin || 'India',
      manufacturer_name: p.manufacturer_name || '', manufacturer_address: p.manufacturer_address || '',
      is_featured: Boolean(p.is_featured), is_bestseller: Boolean(p.is_bestseller), is_new_arrival: Boolean(p.is_new_arrival),
      status: p.status || 'published',
      seo_title: p.seo_title || '', seo_description: p.seo_description || '',
      url_slug: p.url_slug || '', tags: p.tags || '',
      image_url_1: p.images?.[0]?.image_url || '', image_url_2: p.images?.[1]?.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.success) { showToast('Product deleted', 'info'); fetchProducts(); }
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imagesArr = [formData.image_url_1, formData.image_url_2].filter(Boolean);
      const res = await api.post('/admin/products', {
        id: editingProduct?.id,
        ...formData,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        cost_price: formData.cost_price ? Number(formData.cost_price) : null,
        gst_rate: formData.gst_rate ? Number(formData.gst_rate) : null,
        product_weight: formData.product_weight ? Number(formData.product_weight) : null,
        images: imagesArr
      });
      if (res.success) { showToast(res.message, 'success'); setShowModal(false); fetchProducts(); }
    } catch (err) { showToast(err.message, 'error'); }
  };

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
  const inp = (key, label, opts = {}) => (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      <input
        type={opts.type || 'text'}
        required={opts.required}
        value={formData[key]}
        onChange={e => set(key, opts.type === 'number' ? e.target.value : e.target.value)}
        placeholder={opts.placeholder || ''}
        className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none focus:border-brand-gold transition-colors"
      />
    </div>
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Product Catalog Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage products, pricing, variants, and stock thresholds</p>
        </div>
        <button onClick={handleOpenAdd} className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-400" />
        <input type="text" placeholder="Search by product name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-xs outline-none" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-900 uppercase font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Image & Name</th>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price / Sale Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Badges</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80'} alt={p.name} className="w-10 h-12 object-cover rounded-xl shrink-0" />
                    <div>
                      <p className="font-bold text-neutral-900 line-clamp-1">{p.name}</p>
                      <span className="text-[10px] text-neutral-400">ID: #{p.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-brand-maroon font-bold">{p.sku}</td>
                  <td className="px-4 py-3">{p.category_name}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-neutral-900">₹{Number(p.price).toLocaleString('en-IN')}</span>
                    {p.sale_price && <span className="block text-emerald-600 font-semibold">₹{Number(p.sale_price).toLocaleString('en-IN')}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${p.stock <= 0 ? 'text-red-600' : p.stock <= (p.low_stock_threshold || 5) ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-1">
                    {p.is_featured === 1 && <span className="bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full text-[10px] font-bold">Featured</span>}
                    {p.is_bestseller === 1 && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Bestseller</span>}
                    {p.is_new_arrival === 1 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">New</span>}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(p)} className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-brand-maroon transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-neutral-400 italic">No products found. Click "Add New Product" to begin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-xs font-bold"><X className="w-5 h-5" /></button>

            <h2 className="font-serif font-bold text-2xl text-neutral-900">
              {editingProduct ? 'Edit Product' : 'Add New Couture Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* === BASIC INFO === */}
              <SectionToggle title="Basic Information" open={openSections.basic} onToggle={() => toggleSection('basic')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inp('name', 'Product Name *', { required: true })}
                  {inp('sku', 'SKU / Product ID *', { required: true, placeholder: 'RM-PRODUCT-001' })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Category *</label>
                    <select value={formData.category_id} onChange={e => set('category_id', Number(e.target.value))} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {inp('brand', 'Brand')}
                  <div>
                    <label className="block text-xs font-semibold mb-1">Status</label>
                    <select value={formData.status} onChange={e => set('status', e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Short Description</label>
                  <textarea rows="2" value={formData.short_desc} onChange={e => set('short_desc', e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => set('description', e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </SectionToggle>

              {/* === GARMENT DETAILS === */}
              <SectionToggle title="Garment / Product Details" open={openSections.garment} onToggle={() => toggleSection('garment')}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {inp('color', 'Color', { placeholder: 'Navy Blue' })}
                  {inp('fabric', 'Fabric', { placeholder: 'Handloom Silk' })}
                  {inp('material', 'Material', { placeholder: '100% Pure Silk' })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {inp('pattern', 'Pattern', { placeholder: 'Embroidered' })}
                  {inp('fit_shape', 'Fit / Shape', { placeholder: 'Straight' })}
                  {inp('neck', 'Neck Type', { placeholder: 'Round neck with notch' })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {inp('sleeve_length', 'Sleeve Length', { placeholder: 'Three-quarter sleeves' })}
                  {inp('length', 'Length', { placeholder: 'Calf Length' })}
                  {inp('occasion', 'Occasion', { placeholder: 'Casual/Daily Wear' })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inp('stitch_type', 'Stitch Type', { placeholder: 'Stitched' })}
                  <div>
                    <label className="block text-xs font-semibold mb-1">Care Instructions</label>
                    <input type="text" value={formData.care_instructions} onChange={e => set('care_instructions', e.target.value)} placeholder="Dry Clean Only" className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                  </div>
                </div>
              </SectionToggle>

              {/* === PRICING & INVENTORY === */}
              <SectionToggle title="Pricing & Inventory" open={openSections.pricing} onToggle={() => toggleSection('pricing')}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {inp('price', 'MRP / Original Price (₹) *', { type: 'number', required: true })}
                  {inp('sale_price', 'Website Selling Price (₹)', { type: 'number' })}
                  {inp('cost_price', 'Purchase Cost (₹)', { type: 'number' })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {inp('stock', 'Stock Quantity', { type: 'number' })}
                  {inp('product_weight', 'Product Weight (g)', { type: 'number', placeholder: '250' })}
                  {inp('hsn_code', 'HSN Code', { placeholder: '6204' })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inp('gst_rate', 'GST Rate (%)', { type: 'number', placeholder: '5' })}
                </div>
              </SectionToggle>

              {/* === COMPLIANCE & MANUFACTURER === */}
              <SectionToggle title="Manufacturer & Compliance" open={openSections.compliance} onToggle={() => toggleSection('compliance')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inp('country_of_origin', 'Country of Origin')}
                  {inp('manufacturer_name', 'Manufacturer Name')}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Manufacturer Address</label>
                  <textarea rows="2" value={formData.manufacturer_address} onChange={e => set('manufacturer_address', e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </SectionToggle>

              {/* === IMAGES === */}
              <SectionToggle title="Product Images" open={openSections.images} onToggle={() => toggleSection('images')}>
                <ImageUploader
                  label="Primary Product Image (Cloudinary Direct Upload)"
                  currentImage={formData.image_url_1}
                  onUploadSuccess={(url) => set('image_url_1', url)}
                />
                <div>
                  <label className="block text-xs font-semibold mb-1">Primary Image URL (Or enter manual URL)</label>
                  <input type="text" required value={formData.image_url_1} onChange={e => set('image_url_1', e.target.value)} placeholder="https://... or /uploads/..." className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <ImageUploader
                  label="Secondary Hover Image (Cloudinary Direct Upload)"
                  currentImage={formData.image_url_2}
                  onUploadSuccess={(url) => set('image_url_2', url)}
                />
                <div>
                  <label className="block text-xs font-semibold mb-1">Secondary Hover Image URL</label>
                  <input type="text" value={formData.image_url_2} onChange={e => set('image_url_2', e.target.value)} placeholder="https://..." className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </SectionToggle>

              {/* === SEO & TAGS === */}
              <SectionToggle title="SEO & Tags" open={openSections.seo} onToggle={() => toggleSection('seo')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inp('seo_title', 'SEO Title')}
                  {inp('url_slug', 'URL Slug', { placeholder: 'womens-blue-embroidered-straight-kurti' })}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Meta Description</label>
                  <textarea rows="2" value={formData.seo_description} onChange={e => set('seo_description', e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tags (comma separated)</label>
                  <input type="text" value={formData.tags} onChange={e => set('tags', e.target.value)} placeholder="kurti, embroidered, daily wear" className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </SectionToggle>

              {/* === FLAGS === */}
              <SectionToggle title="Product Flags" open={openSections.flags} onToggle={() => toggleSection('flags')}>
                <div className="flex items-center gap-6 text-xs font-semibold flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_featured} onChange={e => set('is_featured', e.target.checked)} className="accent-brand-maroon" />
                    <span>Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_bestseller} onChange={e => set('is_bestseller', e.target.checked)} className="accent-brand-maroon" />
                    <span>Mark as Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_new_arrival} onChange={e => set('is_new_arrival', e.target.checked)} className="accent-brand-maroon" />
                    <span>New Arrival</span>
                  </label>
                </div>
              </SectionToggle>

              <button type="submit" className="w-full maroon-btn py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-wider">
                {editingProduct ? 'Save Product Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
