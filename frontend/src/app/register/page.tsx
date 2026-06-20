'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.data.user, data.data.token, data.data.refreshToken);
      router.push('/subscribe');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%,rgba(59,130,246,0.06) 0%,transparent 60%)' }} />
      <div className="w-full max-w-md relative fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <span className="text-3xl">📺</span>
            <span className="text-2xl font-bold">My<span className="text-blue-500">TV</span></span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Free forever · No credit card required</p>
        </div>
        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <span>⚠️</span>{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input type="email" required autoComplete="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="At least 6 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              style={{ background: '#3b82f6', color: 'white', opacity: loading ? 0.75 : 1 }}>
              {loading && <span className="spinner" />}
              {loading ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>
          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-blue-400">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-blue-400">Privacy Policy</Link>.
          </p>
          <p className="text-center text-sm mt-4 pt-5" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
