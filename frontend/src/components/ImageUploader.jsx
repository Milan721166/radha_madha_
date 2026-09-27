import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ImageUploader({ onUploadSuccess, currentImage, label = "Upload Image to Cloudinary" }) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    try {
      // Instant local preview
      setPreview(URL.createObjectURL(file));
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      // Upload via backend API
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 45000
      });

      if (res.success && res.url) {
        setPreview(res.url);
        if (onUploadSuccess) onUploadSuccess(res.url);
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast(res.message || 'Upload failed', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.message || 'Failed to upload image. You can also paste an image URL directly.', 'error');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-neutral-700">{label}</label>
      
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-neutral-200 shrink-0 group">
            <img src={preview} alt="Upload Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-champagne/60 hover:bg-brand-champagne text-brand-maroon text-xs font-semibold transition-colors border border-brand-gold/30">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading to Cloudinary...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>{preview ? 'Change Image' : 'Choose & Upload File'}</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
