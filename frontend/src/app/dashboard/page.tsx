'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getUser, clearAuth } from '@/lib/auth';

interface Sub { status: string; expiresAt: string; package: { name: string; maxStreams: number } }
interface Channel { id: string; name: string; logo?: string; category: string; isPremium: boolean }

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [subscribed, setSubscribed] = useState(false);
  useEffect(() => {
    setSubscribed(new URLSearchParams(window.location.search).has('subscribed'));
  }, []);
  const [sub, setSub] = useState<Sub | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    Promise.all([
      api.get('/users/subscription').then(({ data }) => setSub(data.data.subscription)),
      api.get('/channels?limit=50').then(({ data }) => setChannels(data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  function logout() { clearAuth(); router.push('/'); }

  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Topbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-slate-800 border-b border-slate-700">
        <Link href="/" className="text-xl font-bold text-blue-500">📺 MyTV</Link>
        <div className="flex items-center gap-6">
          <span className="text-slate-400 text-sm">👋 {user?.name}</span>
          <button onClick={logout} className="text-slate-400 hover:text-white text-sm transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {subscribed && (
          <div className="mb-6 bg-green-900/40 border border-green-700 text-green-300 rounded-lg p-4">
            🎉 Subscription activated! Welcome to MyTV.
          </div>
        )}

        {/* Subscription Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-1 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">My Subscription</h2>
            {sub ? (
              <>
                <div className="text-2xl font-bold text-blue-400 mb-1">{sub.package.name}</div>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-3 ${sub.status === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {sub.status}
                </div>
                <p className="text-slate-400 text-sm">Expires: {new Date(sub.expiresAt).toLocaleDateString()}</p>
                <p className="text-slate-400 text-sm mt-1">Streams: {sub.package.maxStreams} simultaneous</p>
                <Link href="/subscribe" className="block mt-4 text-center py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition">
                  Upgrade Plan
                </Link>
              </>
            ) : (
              <>
                <p className="text-slate-400 mb-4">No active subscription</p>
                <Link href="/subscribe" className="block text-center py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition">
                  Subscribe Now
                </Link>
              </>
            )}
          </div>

          <div className="md:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Channels', value: channels.length },
                { label: 'Premium', value: channels.filter(c => c.isPremium).length },
                { label: 'Free', value: channels.filter(c => !c.isPremium).length },
              ].map((s) => (
                <div key={s.label} className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{s.value}</div>
                  <div className="text-slate-400 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold">Live Channels</h2>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channels..."
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No channels found</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
              {filtered.map((ch) => (
                <div key={ch.id} className="bg-slate-700 rounded-lg p-4 text-center hover:bg-slate-600 transition cursor-pointer border border-slate-600">
                  <div className="text-3xl mb-2">📺</div>
                  <p className="text-sm font-medium truncate">{ch.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{ch.category}</p>
                  {ch.isPremium && <span className="text-xs text-yellow-400">⭐ Premium</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
