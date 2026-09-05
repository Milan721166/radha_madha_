import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-neutral-500">Loading admin metrics...</div>;
  }

  const { stats, salesByDay, topProducts, recentOrders } = data || {};

  const kpis = [
    { title: "Total Revenue Sales", val: `₹${(stats?.totalSales || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
    { title: "Today's Sales", val: `₹${(stats?.todaySales || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { title: "Total Orders", val: stats?.totalOrders || 0, icon: ShoppingBag, color: "text-purple-600 bg-purple-50" },
    { title: "Pending Fulfillment", val: stats?.pendingOrders || 0, icon: ClockIcon, color: "text-amber-600 bg-amber-50" },
    { title: "Registered Customers", val: stats?.totalCustomers || 0, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { title: "Low Stock Alerts", val: stats?.lowStockProducts || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50" }
  ];

  function ClockIcon(props) { return <ShoppingBag {...props} />; }

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Executive Dashboard</h1>
        <p className="text-xs text-neutral-500 mt-1">Real-time sales revenue, inventory alerts, and order metrics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase">{kpi.title}</p>
                <h3 className="font-serif font-bold text-2xl text-neutral-900">{kpi.val}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-lg text-neutral-900">Weekly Revenue Trend (₹)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByDay || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#7A1C1C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-neutral-900">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts?.map((tp, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-3 bg-neutral-50 rounded-2xl">
                <span className="font-bold text-neutral-900 line-clamp-1">{tp.product_name}</span>
                <span className="font-bold text-brand-maroon">{tp.total_sold} units (₹{tp.total_revenue?.toLocaleString('en-IN')})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-neutral-900">Recent Customer Orders</h3>
          <div className="space-y-2 text-xs">
            {recentOrders?.map(ro => (
              <div key={ro.id} className="flex items-center justify-between p-3 border-b border-neutral-100">
                <div>
                  <p className="font-bold text-neutral-900">#{ro.order_number}</p>
                  <p className="text-neutral-500">{ro.customer_name}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-maroon">₹{ro.total_amount?.toLocaleString('en-IN')}</span>
                  <span className="block text-[10px] uppercase font-bold text-emerald-700">{ro.order_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
