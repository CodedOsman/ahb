import React, { useState } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/admin/login', { username, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
      setLocation('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
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
          <p className="text-xs uppercase tracking-widest text-warm-silver font-bold">Admin Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-onyx mb-2 font-bold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-onyx/50 border border-silk-gray/20 p-3 text-onyx outline-none focus:border-onyx transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-onyx mb-2 font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-onyx/50 border border-silk-gray/20 p-3 text-onyx outline-none focus:border-onyx transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-onyx text-alabaster font-bold tracking-[0.2em] hover:bg-champagne transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
