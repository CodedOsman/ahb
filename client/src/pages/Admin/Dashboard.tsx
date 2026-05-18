import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Scissors, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    services: 0,
    products: 0,
    categories: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats({
          services: Number(res.data.services) || 0,
          products: Number(res.data.products) || 0,
          categories: Number(res.data.categories) || 0,
          revenue: Number(res.data.revenue) || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
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
          <h3 className="text-lg font-bold text-onyx mb-6 uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
            Recent Status
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-warm-silver font-light border-l-2 border-onyx pl-4">
              Database connection: <span className="text-green-500 font-bold">Stable</span>
            </p>
            <p className="text-sm text-warm-silver font-light border-l-2 border-onyx pl-4">
              API endpoints: <span className="text-green-500 font-bold">Operational</span>
            </p>
            <p className="text-sm text-warm-silver font-light border-l-2 border-onyx pl-4">
              SSL Certificate: <span className="text-soft-slate font-bold">Development Mode</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
