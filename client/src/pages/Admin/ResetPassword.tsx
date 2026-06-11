import React, { useState } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Extract token from URL query string since wouter doesn't have a built-in hook for search params
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('/api/admin/reset-password', { token, newPassword: password });
      setMessage(res.data.message);
      setTimeout(() => {
        setLocation('/admin/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
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
          <p className="text-xs uppercase tracking-widest text-warm-silver font-bold">Set New Password</p>
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

        {!token ? (
          <div className="text-center text-sm text-red-500 mb-6">
            Invalid link. Please request a new password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-onyx mb-2 font-bold">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-onyx/50 border border-silk-gray/20 p-3 text-onyx outline-none focus:border-onyx transition-colors"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-onyx mb-2 font-bold">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-onyx/50 border border-silk-gray/20 p-3 text-onyx outline-none focus:border-onyx transition-colors"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-onyx text-alabaster font-bold tracking-[0.2em] hover:bg-champagne transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'SAVING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
