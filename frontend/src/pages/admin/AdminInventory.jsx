import React, { useState, useEffect } from 'react';
import { Boxes, Edit2, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminInventory() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [note, setNote] = useState('Manual audit stock update');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/inventory');
      if (res.success) {
        setInventory(res.inventory);
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      const res = await api.post('/admin/inventory/adjust', {
        productId: selectedItem.id,
        newStock: Number(newStock),
        note
      });
      if (res.success) {
        showToast(res.message, 'success');
        setSelectedItem(null);
        fetchInventory();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Inventory & Stock Control</h1>
        <p className="text-xs text-neutral-500">Monitor stock levels, set low-stock thresholds, and adjust inventory</p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-900 uppercase font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Product Name</th>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Current Stock</th>
                <th className="px-4 py-3.5">Stock Status</th>
                <th className="px-4 py-3.5 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {inventory.map(item => {
                const isLow = item.stock <= item.low_stock_threshold && item.stock > 0;
                const isOut = item.stock === 0;

                return (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-bold text-neutral-900">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-neutral-600">{item.sku}</td>
                    <td className="px-4 py-3 font-medium">{item.category_name}</td>
                    <td className="px-4 py-3 font-bold text-base">{item.stock} units</td>
                    <td className="px-4 py-3">
                      {isOut ? (
                        <span className="bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Out of Stock</span>
                      ) : isLow ? (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Sufficient</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setSelectedItem(item); setNewStock(item.stock); }}
                        className="maroon-btn px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 font-bold text-xs">X</button>
            <h3 className="font-serif font-bold text-xl text-neutral-900">Adjust Inventory Stock</h3>
            <p className="text-xs text-neutral-500">{selectedItem.name} ({selectedItem.sku})</p>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">New Stock Count</label>
                <input type="number" required value={newStock} onChange={e => setNewStock(e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Audit Note</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>
              <button type="submit" className="w-full maroon-btn py-3 rounded-full text-xs font-semibold uppercase">Update Stock</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
