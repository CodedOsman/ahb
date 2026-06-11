import React, { useState } from 'react';
import { Link } from 'wouter';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('/api/admin/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-alabaster flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-silk-gray p-8 rounded-lg shadow-2xl border border-silk-gray/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-soft-slate mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            ASANTEY
          </h1>
          <p className="text-xs uppercase tracking-widest text-warm-silver font-bold">Forgot Password</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-700 p-3 rounded mb-6 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-onyx mb-2 font-bold">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-onyx/50 border border-silk-gray/20 p-3 text-onyx outline-none focus:border-onyx transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-onyx text-alabaster font-bold tracking-[0.2em] hover:bg-champagne transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/admin/login" className="text-xs uppercase tracking-widest text-warm-silver hover:text-onyx transition-colors font-bold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
