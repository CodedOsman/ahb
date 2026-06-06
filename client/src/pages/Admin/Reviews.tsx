import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: number;
  name: string;
  service: string;
  rating: number;
  content: string;
  is_approved: boolean;
  created_at: string;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        setReviews(res.data);
      } else {
        console.error('Unexpected reviews response:', res.data);
        toast.error('Could not load reviews — the reviews table may not exist yet. Please run the database migration.');
      }
    } catch (err: any) {
      console.error('Reviews fetch error:', err);
      const msg = err?.response?.data?.error || err?.message || 'Unknown error';
      toast.error(`Failed to load reviews: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`/api/admin/reviews/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Review approved');
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));
    } catch (err: any) {
      toast.error('Failed to approve review');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete review');
    }
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reviews
          </h1>
          <p className="text-warm-silver font-light text-sm">
            Approve or delete client-submitted reviews.
            {pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8 border-b border-silk-gray/10">
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${
              filter === f ? 'border-b-2 border-onyx text-onyx' : 'text-warm-silver hover:text-soft-slate'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-soft-slate italic">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-warm-silver">
          <Star size={32} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm italic">No {filter !== 'all' ? filter : ''} reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div
              key={review.id}
              className={`border p-6 flex flex-col sm:flex-row gap-4 sm:items-start justify-between transition-all ${
                review.is_approved ? 'border-green-200/30 bg-green-50/5' : 'border-silk-gray/20 bg-white'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest ${
                    review.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined text-[12px] ${i < review.rating ? 'text-amber-500' : 'text-gray-200'}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >star</span>
                    ))}
                  </div>
                </div>
                <h3 className="font-bold text-sm text-onyx">{review.name}</h3>
                <p className="text-[11px] text-warm-silver uppercase tracking-widest mb-3">{review.service}</p>
                <p className="text-sm text-soft-slate leading-relaxed italic">"{review.content}"</p>
                <p className="text-[10px] text-warm-silver mt-3">
                  {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                {!review.is_approved && (
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-all"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
