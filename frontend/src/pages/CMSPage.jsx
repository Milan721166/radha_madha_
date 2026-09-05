import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function CMSPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cms/page/${slug}`);
      if (res.success) {
        setPage(res.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-maroon mx-auto" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Page Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest font-serif">Radhamav Information</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mt-1">{page.title}</h1>
      </div>

      <div
        className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm prose max-w-none text-sm text-neutral-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
