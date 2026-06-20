'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getUser, clearAuth, setAuth } from '@/lib/auth';

export default function AccountPage() {
  const router = useRouter();
  const user = getUser();
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/users/subscription')
      .then(({ data }) => setSub(data.data.subscription))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', { name: form.name });
      setAuth({ ...user!, name: data.data.user.name }, localStorage.getItem('token')!, localStorage.getItem('refreshToken')!);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  async function openBillingPortal() {
    try {
      const { data } = await api.post('/payments/portal');
      window.location.href = data.data.url;
    } catch {
      setError('Could not open billing portal. Please try again.');
    }
  }

  function logout() { clearAuth(); router.push('/'); }

  const statusColor = sub?.status === 'ACTIVE'
    ? { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#6ee7b7' }
    : { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#fca5a5' };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">📺</span>
            <span className="font-bold">My<span className="text-blue-500">TV</span></span>
          </Link>
          <button onClick={logout} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>
            Sign Out
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

        {success && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Profile */}
        <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-bold mb-5">Profile Information</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input value={form.email} disabled
                className="w-full rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', opacity: 0.6 }} />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
            </div>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              style={{ background: '#3b82f6', color: 'white', opacity: saving ? 0.7 : 1 }}>
              {saving && <span className="spinner" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-bold mb-5">Subscription & Billing</h2>
          {loading ? (
            <span className="spinner" />
          ) : sub ? (
            <>
              <div className="flex items-center justify-between mb-4 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="font-semibold">{sub.package.name} Plan</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    ${sub.package.price}/mo · Renews {new Date(sub.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: statusColor.bg, border: `1px solid ${statusColor.border}`, color: statusColor.text }}>
                  {sub.status}
                </span>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link href="/subscribe" className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-blue-600 hover:bg-blue-500 text-white">
                  Upgrade Plan
                </Link>
                {sub.package.price > 0 && (
                  <button onClick={openBillingPortal}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    Manage Billing
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>You don't have an active subscription.</p>
              <Link href="/subscribe" className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                Choose a Plan
              </Link>
            </>
          )}
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl p-6" style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: '#f87171' }}>Danger Zone</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Sign out of your account on this device.</p>
          <button onClick={logout}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
            Sign Out
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
