import React from 'react';
import { X, Ruler } from 'lucide-react';

export default function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-neutral-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-champagne flex items-center justify-center text-brand-maroon">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-neutral-900">Size Guide & Fit Measurements</h3>
            <p className="text-xs text-neutral-500">All measurements are listed in inches (in)</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Kurti & Suit Size Chart */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-maroon mb-3 font-serif">
              Kurtis, Suits & Dresses
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full text-xs text-left text-neutral-700">
                <thead className="bg-neutral-100 font-semibold text-neutral-900">
                  <tr>
                    <th className="px-4 py-3">Size Tag</th>
                    <th className="px-4 py-3">Bust (in)</th>
                    <th className="px-4 py-3">Waist (in)</th>
                    <th className="px-4 py-3">Hip (in)</th>
                    <th className="px-4 py-3">Shoulder (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr><td className="px-4 py-2.5 font-bold text-brand-maroon">S (36)</td><td className="px-4 py-2.5">36"</td><td className="px-4 py-2.5">32"</td><td className="px-4 py-2.5">38"</td><td className="px-4 py-2.5">14.5"</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold text-brand-maroon">M (38)</td><td className="px-4 py-2.5">38"</td><td className="px-4 py-2.5">34"</td><td className="px-4 py-2.5">40"</td><td className="px-4 py-2.5">15.0"</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold text-brand-maroon">L (40)</td><td className="px-4 py-2.5">40"</td><td className="px-4 py-2.5">36"</td><td className="px-4 py-2.5">42"</td><td className="px-4 py-2.5">15.5"</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold text-brand-maroon">XL (42)</td><td className="px-4 py-2.5">42"</td><td className="px-4 py-2.5">38"</td><td className="px-4 py-2.5">44"</td><td className="px-4 py-2.5">16.0"</td></tr>
                  <tr><td className="px-4 py-2.5 font-bold text-brand-maroon font-bold">XXL (44)</td><td className="px-4 py-2.5">44"</td><td className="px-4 py-2.5">40"</td><td className="px-4 py-2.5">46"</td><td className="px-4 py-2.5">16.5"</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Saree & Blouse Specs */}
          <div className="bg-brand-champagne/30 p-4 rounded-2xl border border-brand-gold/30 text-xs space-y-1.5 text-neutral-700">
            <h5 className="font-semibold text-brand-maroon uppercase tracking-wider text-xs">Saree Specifications</h5>
            <p>• <strong>Length:</strong> 5.5 meters standard handloom silk length</p>
            <p>• <strong>Blouse Piece:</strong> 0.8 meters unstitched matching blouse fabric attached</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
          <button
            onClick={onClose}
            className="maroon-btn px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
