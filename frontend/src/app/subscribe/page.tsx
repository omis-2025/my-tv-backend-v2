'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Package { id: string; name: string; price: number; durationDays: number; maxStreams: number; features: string[]; stripePriceId?: string; }

const accentMap: Record<string, string> = {
  Free: '#10b981',
  Basic: '#3b82f6',
  Standard: '#3b82f6',
  Premium: '#8b5cf6',
};

export default function SubscribePage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) { router.push('/login'); return; }
    api.get('/packages')
      .then(({ data }) => setPackages(data.data.packages))
      .catch(() => setError('Failed to load plans. Please refresh.'))
      .finally(() => setPageLoading(false));
  }, []);

  async function subscribe(pkg: Package) {
    setSelectedId(pkg.id);
    setLoading(true);
    setError('');
    try {
      if (pkg.price === 0) {
        // Free plan — activate directly
        await api.post('/subscriptions/subscribe', { packageId: pkg.id });
        router.push('/dashboard?subscribed=1');
        return;
      }
      const { data } = await api.post('/payments/checkout', { packageId: pkg.id });
      window.location.href = data.data.url;
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('not configured')) {
        // Stripe not set up — fallback
        await api.post('/subscriptions/subscribe', { packageId: pkg.id });
        router.push('/dashboard?subscribed=1');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
        setLoading(false);
        setSelectedId('');
      }
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center fade-in">
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading plans…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(59,130,246,0.05) 0%,transparent 50%)' }} />
      <div className="max-w-5xl mx-auto relative fade-in">
        {/* Header */}
        <div className="text-center mb-14">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <span className="text-2xl">📺</span>
            <span className="text-xl font-bold">My<span className="text-blue-500">TV</span></span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Choose Your Plan</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Unlock access to thousands of live channels</p>
        </div>

        {error && (
          <div className="mb-8 px-5 py-4 rounded-xl text-sm flex items-center gap-3 max-w-xl mx-auto" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            <span>⚠️</span>{error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {packages.map((pkg, i) => {
            const accent = accentMap[pkg.name] || '#3b82f6';
            const isPopular = pkg.name === 'Standard';
            const isFree = pkg.price === 0;
            const isBusy = loading && selectedId === pkg.id;

            return (
              <div key={pkg.id} className={`relative rounded-2xl p-7 flex flex-col transition-all ${isPopular ? 'ring-2 ring-blue-500' : ''}`}
                style={{ background: isPopular ? 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.06))' : 'var(--bg-card)', border: `1px solid ${isPopular ? 'rgba(59,130,246,0.4)' : 'var(--border)'}` }}>
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded-full"
                    style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', color: 'white' }}>
                    POPULAR
                  </span>
                )}
                <h3 className="text-lg font-bold mb-1">{pkg.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold" style={{ color: isFree ? '#10b981' : 'white' }}>
                    {isFree ? 'Free' : `$${pkg.price}`}
                  </span>
                  {!isFree && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mo</span>}
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {Array.isArray(pkg.features) && pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: accent }}>✓</span>{f}
                    </li>
                  ))}
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: accent }}>✓</span>
                    {pkg.maxStreams} Device{pkg.maxStreams > 1 ? 's' : ''}
                  </li>
                </ul>
                <button
                  onClick={() => subscribe(pkg)}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: isPopular ? '#3b82f6' : isFree ? '#10b981' : 'transparent',
                    color: 'white',
                    border: (isPopular || isFree) ? 'none' : '1px solid var(--border-light)',
                    opacity: (loading && selectedId !== pkg.id) ? 0.5 : 1,
                  }}>
                  {isBusy && <span className="spinner" />}
                  {isBusy ? 'Processing…' : isFree ? 'Start Free' : `Subscribe — $${pkg.price}/mo`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-10 text-sm" style={{ color: 'var(--text-muted)' }}>
          🔒 Secured by Stripe · Cancel anytime · 7-day money-back guarantee
        </p>

        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
