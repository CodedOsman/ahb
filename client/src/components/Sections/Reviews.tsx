import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface Review {
  id: number;
  name: string;
  service: string;
  content: string;
  rating: number;
  created_at: string;
  isGoogle?: boolean;
}

const StarRating: React.FC<{ rating: number; interactive?: boolean; onRate?: (r: number) => void }> = ({ rating, interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-[14px] transition-colors ${
            star <= (interactive ? hovered || rating : rating) ? 'text-primary' : 'text-primary/20'
          } ${interactive ? 'cursor-pointer' : ''}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate && onRate(star)}
        >
          star
        </span>
      ))}
    </div>
  );
};

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'TODAY';
  if (days < 7) return `${days} DAY${days > 1 ? 'S' : ''} AGO`;
  if (days < 14) return '1 WEEK AGO';
  if (days < 28) return `${Math.floor(days / 7)} WEEKS AGO`;
  if (days < 60) return '1 MONTH AGO';
  return `${Math.floor(days / 30)} MONTHS AGO`;
}

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', service: '', rating: 5, content: '' });

  useEffect(() => {
    Promise.all([
      axios.get('/api/reviews').catch(() => ({ data: [] })),
      axios.get('/api/reviews/google').catch(() => ({ data: [] }))
    ]).then(([localRes, googleRes]) => {
      const localReviews = Array.isArray(localRes.data) ? localRes.data : [];
      const googleReviews = Array.isArray(googleRes.data) ? googleRes.data : [];
      
      const combined = [...localReviews, ...googleReviews].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReviews(combined);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.service.trim() || !form.content.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/reviews', form);
      toast.success('Thank you! Your review has been submitted and will appear after approval.');
      setForm({ name: '', service: '', rating: 5, content: '' });
      setShowForm(false);
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-surface border-t border-primary">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="font-label-caps text-label-caps block mb-4">CLIENT VOICE</span>
          <h2 className="font-headline-lg text-headline-lg uppercase">Reviews</h2>
          <div className="editorial-line w-24 mx-auto my-6"></div>
          <p className="font-body-md text-body-md max-w-2xl mx-auto text-on-surface-variant">
            Read what our clients say about their premium hair installations, custom units, and specialized beauty services.
          </p>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-primary bg-background">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`p-8 border-primary flex flex-col justify-between ${i < 3 ? 'border-b md:border-b-0 md:border-r' : ''}`}>
                <div className="animate-pulse space-y-4">
                  <div className="h-3 bg-primary/10 rounded w-1/2" />
                  <div className="space-y-2">
                    <div className="h-2 bg-primary/10 rounded" />
                    <div className="h-2 bg-primary/10 rounded w-5/6" />
                    <div className="h-2 bg-primary/10 rounded w-4/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-primary bg-background">
            {reviews.slice(0, 4).map((review, i) => (
              <div
                key={review.id}
                className={`p-8 border-primary flex flex-col justify-between
                  ${i < Math.min(reviews.length - 1, 3) ? 'border-b md:border-b-0 md:border-r' : ''}
                `}
              >
                <div>
                  {/* Stars and Date */}
                  <div className="flex justify-between items-center mb-6">
                    <StarRating rating={review.rating} />
                    <span className="font-label-caps text-[10px] opacity-50 tracking-wider">
                      {getRelativeTime(review.created_at)}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md italic mb-6 text-on-surface-variant">
                    "{review.content}"
                  </p>
                </div>
                {/* Reviewer Details */}
                <div className="flex items-center gap-3 pt-6 border-t border-primary/10">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${review.isGoogle ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-primary/5 border border-primary/10 text-primary'}`}>
                    {review.isGoogle ? 'G' : review.name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-label-caps text-label-caps text-[11px] text-primary">{review.name}</h4>
                    <span className="text-[10px] opacity-60 uppercase tracking-widest block mt-0.5">
                      {review.isGoogle ? 'Google Review' : review.service}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-primary p-16 text-center bg-background">
            <p className="font-body-md text-on-surface-variant opacity-60">Be the first to leave a review!</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="font-label-caps text-label-caps bg-surface-container-high text-primary px-8 py-4 flex items-center gap-2 mx-auto border border-primary hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">rate_review</span>
            {showForm ? 'CLOSE FORM' : 'LEAVE A REVIEW'}
          </button>
        </div>

        {/* Review Submission Form */}
        {showForm && (
          <div className="mt-12 max-w-2xl mx-auto border border-primary p-8 bg-background">
            <h3 className="font-headline-md text-headline-md uppercase tracking-widest mb-8 text-center">Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-label-caps text-[10px] tracking-widest uppercase mb-2 block text-on-surface-variant">Your Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-surface-container border border-primary/20 p-3 text-sm outline-none focus:border-primary transition-all"
                    placeholder="Jane Smith"
                    required
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] tracking-widest uppercase mb-2 block text-on-surface-variant">Service Received *</label>
                  <input
                    type="text"
                    value={form.service}
                    onChange={(e) => setForm(f => ({ ...f, service: e.target.value }))}
                    className="w-full bg-surface-container border border-primary/20 p-3 text-sm outline-none focus:border-primary transition-all"
                    placeholder="Knotless Braids"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="font-label-caps text-[10px] tracking-widest uppercase mb-2 block text-on-surface-variant">Rating *</label>
                <StarRating rating={form.rating} interactive onRate={(r) => setForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="font-label-caps text-[10px] tracking-widest uppercase mb-2 block text-on-surface-variant">Your Review *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full bg-surface-container border border-primary/20 p-3 text-sm outline-none focus:border-primary transition-all h-32 resize-none"
                  placeholder="Tell us about your experience..."
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="font-label-caps text-label-caps border border-primary/30 px-6 py-3 hover:border-primary transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-label-caps text-label-caps bg-primary text-on-primary px-8 py-3 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;
