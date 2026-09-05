import React, { useState } from 'react';
import { Download, BarChart2, Calendar, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminReports() {
  const { showToast } = useToast();
  const [range, setRange] = useState('30days');

  const handleExport = (type) => {
    showToast(`Downloading ${type} report as CSV spreadsheet...`, 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Analytics & Sales Reports</h1>
        <p className="text-xs text-neutral-500">Export detailed financial, inventory movement, and order reports</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="font-serif font-bold text-lg text-neutral-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-gold" /> Filter Date Range
          </h3>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="prev_month">Previous Month</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Sales & Revenue Report</h4>
              <p className="text-[11px] text-neutral-500">Order amounts, GST breakdown, payment modes</p>
            </div>
            <button onClick={() => handleExport('Sales')} className="maroon-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Inventory Stock Audit Report</h4>
              <p className="text-[11px] text-neutral-500">SKU stock counts, sold quantities, low-stock warnings</p>
            </div>
            <button onClick={() => handleExport('Inventory')} className="maroon-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Customer Acquisition Report</h4>
              <p className="text-[11px] text-neutral-500">New customer registrations, lifetime spending rankings</p>
            </div>
            <button onClick={() => handleExport('Customers')} className="maroon-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Returns & Refunds Log</h4>
              <p className="text-[11px] text-neutral-500">Return claims, approval rates, refund statuses</p>
            </div>
            <button onClick={() => handleExport('Returns')} className="maroon-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
