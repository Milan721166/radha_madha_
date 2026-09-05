import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: 1,
    short_desc: '',
    description: '',
    price: '',
    sale_price: '',
    cost_price: '',
    stock: 20,
    material: '',
    fabric: '',
    care_instructions: '',
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: true,
    image_url_1: '',
    image_url_2: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products');
      if (res.success) setProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      category_id: categories[0]?.id || 1,
      short_desc: '',
      description: '',
      price: '3999',
      sale_price: '2799',
      cost_price: '1200',
      stock: 25,
      material: '100% Pure Silk',
      fabric: 'Handloom Silk',
      care_instructions: 'Dry Clean Only',
      is_featured: true,
      is_bestseller: false,
      is_new_arrival: true,
      image_url_1: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      image_url_2: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category_id: p.category_id,
      short_desc: p.short_desc || '',
      description: p.description || '',
      price: p.price,
      sale_price: p.sale_price || '',
      cost_price: p.cost_price || '',
      stock: p.stock,
      material: p.material || '',
      fabric: p.fabric || '',
      care_instructions: p.care_instructions || '',
      is_featured: Boolean(p.is_featured),
      is_bestseller: Boolean(p.is_bestseller),
      is_new_arrival: Boolean(p.is_new_arrival),
      image_url_1: p.images?.[0]?.image_url || '',
      image_url_2: p.images?.[1]?.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.success) {
        showToast('Product deleted', 'info');
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
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
        images: imagesArr
      });

      if (res.success) {
        showToast(res.message, 'success');
        setShowModal(false);
        fetchProducts();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Product Catalog Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage products, pricing, variants, and stock thresholds</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-xs outline-none"
        />
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
                  <td className="px-4 py-3 font-mono text-neutral-600">{p.sku}</td>
                  <td className="px-4 py-3 font-medium">{p.category_name}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-brand-maroon">₹{(p.sale_price || p.price)?.toLocaleString('en-IN')}</span>
                    {p.sale_price && <span className="block text-[10px] text-neutral-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold px-2 py-0.5 rounded-full ${p.stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-1">
                    {p.is_bestseller === 1 && <span className="text-[9px] bg-brand-gold text-neutral-900 font-bold px-2 py-0.5 rounded-full">Bestseller</span>}
                    {p.is_featured === 1 && <span className="text-[9px] bg-brand-maroon text-white font-bold px-2 py-0.5 rounded-full">Featured</span>}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-neutral-600 hover:text-brand-maroon"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-neutral-600 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-xs font-bold"><X className="w-5 h-5" /></button>
            
            <h2 className="font-serif font-bold text-2xl text-neutral-900">
              {editingProduct ? 'Edit Product' : 'Add New Couture Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">SKU Code</label>
                  <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: Number(e.target.value)})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Original Price (₹)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Offer Sale Price (₹)</label>
                  <input type="number" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Stock Quantity</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Material / Fabric Specs</label>
                  <input type="text" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Primary Image URL</label>
                <input type="url" required value={formData.image_url_1} onChange={e => setFormData({...formData, image_url_1: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Secondary Hover Image URL</label>
                <input type="url" value={formData.image_url_2} onChange={e => setFormData({...formData, image_url_2: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>

              <div className="flex items-center gap-6 pt-2 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="accent-brand-maroon" />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_bestseller} onChange={e => setFormData({...formData, is_bestseller: e.target.checked})} className="accent-brand-maroon" />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

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
