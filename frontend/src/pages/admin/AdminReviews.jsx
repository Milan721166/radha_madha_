import React, { useState, useEffect } from 'react';
import { Star, Check, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminReviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      if (res.success) setReviews(res.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, status) => {
    try {
      const res = await api.put(`/admin/reviews/${id}`, { status });
      if (res.success) {
        showToast(res.message, 'success');
        fetchReviews();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete review permanently?')) return;
    try {
      const res = await api.delete(`/admin/reviews/${id}`);
      if (res.success) {
        showToast('Review deleted', 'info');
        fetchReviews();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Customer Reviews Moderation</h1>
        <p className="text-xs text-neutral-500">Approve, reject, or feature customer product reviews</p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-900 uppercase font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Customer & Product</th>
                <th className="px-4 py-3.5">Rating</th>
                <th className="px-4 py-3.5">Review Text</th>
                <th className="px-4 py-3.5">Verified</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-neutral-900">{r.user_name}</p>
                    <p className="text-[10px] text-neutral-400">{r.product_name}</p>
                  </td>
                  <td className="px-4 py-3 text-amber-400 font-bold">{r.rating} / 5 ★</td>
                  <td className="px-4 py-3 text-neutral-600 max-w-xs">{r.review_text}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{r.verified_purchase === 1 ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 font-bold uppercase text-[10px]">{r.status}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {r.status !== 'approved' && <button onClick={() => handleModerate(r.id, 'approved')} className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg">Approve</button>}
                    <button onClick={() => handleDelete(r.id)} className="p-1 text-red-600 hover:underline"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
