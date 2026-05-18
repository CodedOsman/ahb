import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';

interface Order {
  id: number;
  stripe_session_id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  delivery_zone_name: string;
  subtotal: string;
  delivery_fee: string;
  total: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`/api/admin/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-400/10';
      case 'shipped': return 'text-blue-400 bg-blue-400/10';
      case 'delivered': return 'text-purple-400 bg-purple-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-soft-slate bg-champagne/10';
    }
  };

  if (loading) return <div className="text-soft-slate p-8">Loading orders...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-onyx" style={{ fontFamily: "'Playfair Display', serif" }}>
          Orders
        </h1>
        <p className="text-warm-silver font-light text-sm">Manage customer orders and fulfillments.</p>
      </div>

      <div className="bg-silk-gray rounded-lg border border-silk-gray/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-silk-gray/10 bg-black/20">
                <th className="p-4 text-[10px] uppercase tracking-widest text-warm-silver font-bold">Order ID</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-warm-silver font-bold">Customer</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-warm-silver font-bold">Shipping</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-warm-silver font-bold">Total</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-warm-silver font-bold">Status</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-warm-silver font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-warm-silver italic">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-silk-gray/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm text-onyx">#{order.id}</td>
                    <td className="p-4">
                      <div className="text-sm text-onyx font-bold">{order.customer_name || 'N/A'}</div>
                      <div className="text-xs text-warm-silver">{order.customer_email || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-warm-silver max-w-xs truncate" title={order.shipping_address}>
                        {order.shipping_address || 'Pending'}
                      </div>
                      <div className="text-[10px] uppercase text-soft-slate mt-1">{order.delivery_zone_name}</div>
                    </td>
                    <td className="p-4 text-sm text-onyx font-bold">
                      £{order.total}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {order.status === 'paid' && (
                        <button 
                          onClick={() => updateStatus(order.id, 'shipped')}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                          title="Mark as Shipped"
                        >
                          <Truck size={16} />
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button 
                          onClick={() => updateStatus(order.id, 'delivered')}
                          className="p-2 text-purple-400 hover:bg-purple-400/10 rounded transition-colors"
                          title="Mark as Delivered"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button 
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Cancel Order"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
