import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Eye, Truck, Printer, CheckCircle2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Order for Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('confirmed');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('BlueDart Express');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchReturns();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
      const res = await api.get(url);
      if (res.success) setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    try {
      const res = await api.get('/admin/returns');
      if (res.success) setReturns(res.returns || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        order_status: newStatus,
        tracking_number: trackingNumber,
        courier_name: courierName,
        comment
      });
      if (res.success) {
        showToast(res.message, 'success');
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnAction = async (returnId, status) => {
    try {
      const res = await api.put(`/admin/returns/${returnId}`, { status, admin_comment: `Return ${status} by admin` });
      if (res.success) {
        showToast(res.message, 'success');
        fetchReturns();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Order Fulfillment & Returns</h1>
        <p className="text-xs text-neutral-500">Update order status, assign courier tracking numbers, approve returns & generate invoices</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 bg-neutral-50 px-3 py-2 rounded-2xl border border-neutral-200">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search Order # or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2 text-xs outline-none font-semibold"
        >
          <option value="">All Order Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-900 uppercase font-semibold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Order #</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Tracking #</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-bold text-neutral-900">#{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-neutral-900">{o.customer_name}</p>
                    <p className="text-[10px] text-neutral-400">{o.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 uppercase font-medium">{o.payment_method} ({o.payment_status})</td>
                  <td className="px-4 py-3 font-bold text-brand-maroon">₹{o.total_amount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase bg-neutral-100 text-neutral-800">
                      {o.order_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-600">{o.tracking_number || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setSelectedOrder(o); setNewStatus(o.order_status); setTrackingNumber(o.tracking_number || ''); }}
                      className="maroon-btn px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Return Requests Section */}
      {returns.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
          <h2 className="font-serif font-bold text-xl text-neutral-900">Customer Return Claims</h2>
          <div className="space-y-3 text-xs">
            {returns.map(ret => (
              <div key={ret.id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="font-bold text-neutral-900">Order #{ret.order_number} • {ret.customer_name}</p>
                  <p className="text-neutral-600 mt-1 font-semibold text-brand-maroon">Reason: {ret.reason}</p>
                  <p className="text-neutral-500">{ret.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase text-[10px] bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">{ret.status}</span>
                  {ret.status === 'requested' && (
                    <>
                      <button onClick={() => handleReturnAction(ret.id, 'approved')} className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded-lg text-xs">Approve Return</button>
                      <button onClick={() => handleReturnAction(ret.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white font-semibold rounded-lg text-xs">Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 font-bold text-xs"><X className="w-5 h-5" /></button>
            <h3 className="font-serif font-bold text-xl text-neutral-900">Fulfill Order #{selectedOrder.order_number}</h3>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Update Order Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none">
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Courier Partner</label>
                <input type="text" value={courierName} onChange={e => setCourierName(e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tracking Number</label>
                <input type="text" placeholder="e.g. RM12345678IN" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Status Note</label>
                <input type="text" placeholder="Package dispatched via courier..." value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-neutral-50 border rounded-xl p-2.5 text-xs outline-none" />
              </div>

              <button type="submit" className="w-full maroon-btn py-3 rounded-full text-xs font-semibold uppercase">Save Status & Notify Customer</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
