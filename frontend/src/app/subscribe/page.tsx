'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Package { id: string; name: string; price: number; durationDays: number; maxStreams: number; features: string[]; stripePriceId?: string; }

export default function SubscribePage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!getUser()) router.push('/login');
    api.get('/packages').then(({ data }) => setPackages(data.data.packages));
  }, []);

  async function subscribe(packageId: string) {
    setSelectedId(packageId);
    setLoading(true);
    try {
      const { data } = await api.post('/payments/checkout', { packageId });
      window.location.href = data.data.url;
    } catch (err: any) {
      if (err.response?.data?.message?.includes('not configured')) {
        // Fallback: manual subscription
        await api.post('/subscriptions/subscribe', { packageId });
        router.push('/dashboard?subscribed=1');
      }
    } finally {
      setLoading(false);
      setSelectedId('');
    }
  }

  const colors = ['border-slate-600', 'border-blue-500', 'border-purple-500'];

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-slate-400">Unlock access to thousands of live channels</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <div key={pkg.id} className={`bg-slate-800 rounded-xl p-8 border-2 ${colors[i % 3]} relative`}>
              {i === 1 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>}
              <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
              <div className="text-4xl font-bold mb-1">${pkg.price}<span className="text-sm text-slate-400">/mo</span></div>
              <ul className="mt-5 mb-8 space-y-2 text-slate-300 text-sm">
                {Array.isArray(pkg.features) && pkg.features.map((f: string) => (
                  <li key={f}>✓ {f}</li>
                ))}
                <li>✓ {pkg.maxStreams} Stream{pkg.maxStreams > 1 ? 's' : ''}</li>
              </ul>
              <button
                onClick={() => subscribe(pkg.id)}
                disabled={loading && selectedId === pkg.id}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition"
              >
                {loading && selectedId === pkg.id ? 'Loading...' : `Subscribe — $${pkg.price}/mo`}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-500 mt-8 text-sm">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
}
