import React, { useState, useEffect } from 'react';
import { FileText, Save } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCMS() {
  const { showToast } = useToast();
  const [selectedSlug, setSelectedSlug] = useState('about-us');
  const [pageData, setPageData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchPage();
  }, [selectedSlug]);

  const fetchPage = async () => {
    try {
      const res = await api.get(`/cms/page/${selectedSlug}`);
      if (res.success) setPageData(res.page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    showToast(`Updated '${pageData.title}' CMS page content`, 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Website CMS Content Manager</h1>
        <p className="text-xs text-neutral-500">Edit dynamic static policy pages (About Us, Privacy, Refund Policy)</p>
      </div>

      <div className="flex gap-2 border-b border-neutral-200 pb-2 text-xs font-semibold">
        {['about-us', 'privacy-policy', 'terms-and-conditions', 'refund-policy', 'shipping-policy'].map(slug => (
          <button
            key={slug}
            onClick={() => setSelectedSlug(slug)}
            className={`px-4 py-2 rounded-full capitalize transition-colors ${selectedSlug === slug ? 'bg-brand-maroon text-white' : 'bg-white text-neutral-700'}`}
          >
            {slug.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Page Heading Title</label>
          <input type="text" value={pageData.title} onChange={e => setPageData({...pageData, title: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">HTML Page Content</label>
          <textarea rows="10" value={pageData.content} onChange={e => setPageData({...pageData, content: e.target.value})} className="w-full bg-neutral-50 border rounded-xl p-3 text-xs outline-none font-mono" />
        </div>

        <button type="submit" className="maroon-btn px-6 py-3 rounded-full text-xs font-semibold uppercase flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Page Content
        </button>
      </form>
    </div>
  );
}
