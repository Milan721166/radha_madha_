import React, { useState } from 'react';
import { Package, Search, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import api from '../services/api';

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/orders/track/${orderNumber.trim()}`);
      if (res.success) {
        setOrderData(res.order);
      }
    } catch (err) {
      setError(err.message || 'Order number not found. Please verify your order ID.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['confirmed', 'processing', 'packed', 'shipped', 'delivered'];

  const getStepIndex = (status) => {
    const idx = steps.indexOf(status?.toLowerCase());
    return idx === -1 ? 1 : idx;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-16 h-16 rounded-full bg-brand-champagne mx-auto flex items-center justify-center text-brand-maroon">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">Track Your Package Order</h1>
        <p className="text-sm text-neutral-500">Enter your Radhamav order number (e.g. RM-12345678) to view live status timeline.</p>
      </div>

      <form onSubmit={handleTrack} className="max-w-md mx-auto flex gap-2">
        <input
          type="text"
          placeholder="Enter Order Number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="flex-1 bg-white border border-neutral-200 rounded-full px-5 py-3.5 text-sm outline-none shadow-sm focus:border-brand-gold uppercase"
        />
        <button
          type="submit"
          className="maroon-btn px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
        >
          Track Order <Search className="w-4 h-4" />
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-medium text-center border border-red-200 max-w-md mx-auto">
          {error}
        </div>
      )}

      {orderData && (
        <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl space-y-8 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-100 pb-4 gap-2">
            <div>
              <span className="text-xs font-semibold text-brand-gold uppercase">Package Status Details</span>
              <h2 className="font-serif font-bold text-2xl text-neutral-900">Order #{orderData.order_number}</h2>
              <p className="text-xs text-neutral-500">Carrier: {orderData.courier_name || 'BlueDart Express'} • Tracking #: {orderData.tracking_number || 'RM12345678IN'}</p>
            </div>
            <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-brand-maroon text-white uppercase self-start sm:self-auto">
              {orderData.order_status}
            </span>
          </div>

          {/* Visual Step Bar */}
          <div className="py-4">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-brand-maroon -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(getStepIndex(orderData.order_status) / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((st, idx) => {
                const currentIdx = getStepIndex(orderData.order_status);
                const isPassed = idx <= currentIdx;

                return (
                  <div key={st} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-colors ${
                      isPassed ? 'bg-brand-maroon text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-700 uppercase mt-2 capitalize">{st}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Events */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="font-bold text-sm text-neutral-900">Status History Updates</h3>
            <div className="space-y-2">
              {orderData.history?.map(h => (
                <div key={h.id} className="flex items-start gap-3 text-xs bg-neutral-50 p-3 rounded-xl">
                  <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 capitalize">{h.status}</p>
                    <p className="text-neutral-600">{h.comment}</p>
                    <span className="text-[10px] text-neutral-400">{new Date(h.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
