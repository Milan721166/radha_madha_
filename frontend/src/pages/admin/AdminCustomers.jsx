import React, { useState, useEffect } from 'react';
import { Users, Ban, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCustomers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers');
      if (res.success) setCustomers(res.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await api.put(`/admin/customers/${id}/status`, { status: nextStatus });
      if (res.success) {
        showToast(res.message, 'info');
        fetchCustomers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Customer Directory</h1>
        <p className="text-xs text-neutral-500">View customer lifetime orders, total spending, and access status</p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-900 uppercase font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Contact Email / Phone</th>
                <th className="px-4 py-3.5">Total Orders</th>
                <th className="px-4 py-3.5">Lifetime Spent</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-bold text-neutral-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-neutral-900">{c.email}</p>
                    <p className="text-neutral-500">{c.phone || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{c.total_orders || 0} orders</td>
                  <td className="px-4 py-3 font-bold text-brand-maroon">₹{(c.total_spent || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase ${c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(c.id, c.status)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${c.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      {c.status === 'active' ? 'Block Account' : 'Unblock Account'}
                    </button>
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
