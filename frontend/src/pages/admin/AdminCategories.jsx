import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Folders } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ImageUploader from '../../components/ImageUploader';

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/categories', {
        id: editingCat?.id,
        name,
        image
      });
      if (res.success) {
        showToast(res.message, 'success');
        setShowModal(false);
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      const res = await api.delete(`/admin/categories/${id}`);
      if (res.success) {
        showToast('Category deleted', 'info');
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Category Management</h1>
          <p className="text-xs text-neutral-500">Create & manage store categories with Cloudinary Image Uploads</p>
        </div>
        <button
          onClick={() => { setEditingCat(null); setName(''); setImage(''); setShowModal(true); }}
          className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-3xl p-4 border border-neutral-200 shadow-sm flex items-center gap-4">
            <img src={cat.image} alt={cat.name} className="w-16 h-20 object-cover rounded-2xl shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-base text-neutral-900 truncate">{cat.name}</h3>
              <p className="text-xs text-neutral-500">{cat.product_count || 0} products</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { setEditingCat(cat); setName(cat.name); setImage(cat.image); setShowModal(true); }} className="text-xs text-brand-maroon hover:underline font-semibold">Edit</button>
                <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-600 hover:underline font-semibold">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 font-bold text-xs"><X className="w-5 h-5" /></button>
            <h3 className="font-serif font-bold text-xl text-neutral-900">{editingCat ? 'Edit Category' : 'Create Category'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Category Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              
              <ImageUploader
                label="Category Cover Image (Cloudinary Direct Upload)"
                currentImage={image}
                onUploadSuccess={(url) => setImage(url)}
              />

              <div>
                <label className="block text-xs font-semibold mb-1">Cover Image URL (Or enter manual URL)</label>
                <input type="text" required value={image} onChange={e => setImage(e.target.value)} placeholder="https://... or /uploads/..." className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <button type="submit" className="w-full maroon-btn py-3 rounded-full text-xs font-semibold uppercase">Save Category</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
