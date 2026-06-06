import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Scissors, ShoppingBag, Users, TrendingUp, Package, Star } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    services: 0,
    products: 0,
    categories: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const [statsRes, ordersRes, reviewsRes] = await Promise.all([
          axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/reviews', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setStats({
          services: Number(statsRes.data.services) || 0,
          products: Number(statsRes.data.products) || 0,
          categories: Number(statsRes.data.categories) || 0,
          revenue: Number(statsRes.data.revenue) || 0
        });

        setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : []);
        setRecentReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data.slice(0, 5) : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Revenue', value: `£${(Number(stats.revenue) || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-400' },
    { name: 'Total Products', value: Number(stats.products) || 0, icon: ShoppingBag, color: 'text-soft-slate' },
    { name: 'Total Services', value: Number(stats.services) || 0, icon: Scissors, color: 'text-soft-slate' },
    { name: 'Categories', value: Number(stats.categories) || 0, icon: Users, color: 'text-soft-slate' },
  ];

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome back, Admin
        </h1>
        <p className="text-warm-silver font-light">Here is an overview of your salon's digital presence.</p>
      </div>

      {loading ? (
        <div className="text-soft-slate italic">Loading overview...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-silk-gray p-8 rounded-lg border border-silk-gray/10 hover:border-silk-gray/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`${stat.color} opacity-80`} size={24} />
                <span className="text-[10px] uppercase tracking-widest font-bold text-warm-silver">Live</span>
              </div>
              <div className="text-3xl font-black text-onyx mb-1">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-warm-silver font-bold">{stat.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions or Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-silk-gray p-8 rounded-lg border border-silk-gray/10">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-soft-slate" size={20} />
            <h3 className="text-lg font-bold text-onyx uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
              Recent Orders
            </h3>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-warm-silver italic text-sm">No recent orders.</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center border-l-2 border-champagne pl-4">
                  <div>
                    <p className="text-sm font-bold text-onyx">Order #{order.id} <span className="text-xs text-warm-silver font-light ml-2">{order.customer_name}</span></p>
                    <p className="text-[10px] uppercase tracking-widest text-soft-slate">{order.status}</p>
                  </div>
                  <p className="text-sm font-bold text-onyx">£{order.total}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-silk-gray p-8 rounded-lg border border-silk-gray/10">
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-soft-slate" size={20} />
            <h3 className="text-lg font-bold text-onyx uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
              Recent Reviews
            </h3>
          </div>
          <div className="space-y-4">
            {recentReviews.length === 0 ? (
              <p className="text-warm-silver italic text-sm">No recent reviews.</p>
            ) : (
              recentReviews.map(review => (
                <div key={review.id} className="border-l-2 border-champagne pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-onyx">{review.author_name}</p>
                    <div className="flex text-yellow-400">
                      {[...Array(Math.round(Number(review.rating) || 5))].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-xs text-warm-silver line-clamp-2">{review.content}</p>
                  <p className={`text-[10px] uppercase mt-1 font-bold ${review.is_approved ? 'text-green-500' : 'text-amber-500'}`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
