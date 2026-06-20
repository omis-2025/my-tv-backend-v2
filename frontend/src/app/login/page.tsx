'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuth, isAdmin } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.data.user, data.data.token, data.data.refreshToken);
      router.push(isAdmin(data.data.user) ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-500">📺 MyTV</Link>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 space-y-5">
          {error && <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg p-3 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-slate-400 text-sm">
            No account?{' '}
            <Link href="/register" className="text-blue-400 hover:underline">Create one free</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
