'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getUser, clearAuth } from '@/lib/auth';

interface Sub { status: string; expiresAt: string; package: { name: string; price: number; maxStreams: number } }
interface Channel { id: string; name: string; logo?: string; category: string; isPremium: boolean }

const categoryIcons: Record<string, string> = {
  News: '📰', Sports: '⚽', Movies: '🎬', Entertainment: '🎭',
  Kids: '🧒', Music: '🎵', Default: '📺',
};

const categoryColors: Record<string, string> = {
  News: '#3b82f6', Sports: '#10b981', Movies: '#8b5cf6',
  Entertainment: '#f59e0b', Kids: '#ec4899', Music: '#06b6d4', Default: '#6b7280',
};

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [subscribed, setSubscribed] = useState(false);
  const [sub, setSub] = useState<Sub | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSubscribed(new URLSearchParams(window.location.search).has('subscribed'));
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    Promise.all([
      api.get('/users/subscription').then(({ data }) => setSub(data.data.subscription)).catch(() => {}),
      api.get('/channels?limit=200').then(({ data }) => {
        const list = data.data;
        setChannels(Array.isArray(list) ? list : []);
      }).catch(() => setError('Could not load channels.')),
    ]).finally(() => setLoading(false));
  }, []);

  function logout() { clearAuth(); router.push('/'); }

  const categories = ['All', ...Array.from(new Set(channels.map(c => c.category)))];
  const filtered = channels.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const subStatusColor = sub?.status === 'ACTIVE' ? { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#6ee7b7' }
    : { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#fca5a5' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Top nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'rgba(6,12,20,0.9)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📺</span>
            <span className="font-bold text-lg">My<span className="text-blue-500">TV</span></span>
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-sm hidden md:block" style={{ color: 'var(--text-secondary)' }}>
              👋 {user?.name}
            </span>
            <Link href="/account" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Account</Link>
            <button onClick={logout} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 fade-in">
        {/* Success banner */}
        {subscribed && (
          <div className="mb-6 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-medium" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
            🎉 <span>Subscription activated! Welcome to MyTV — you can now access all your channels.</span>
          </div>
        )}

        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Subscription card */}
          <div className="md:col-span-1 rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>My Subscription</h2>
            {loading ? (
              <div className="h-20 flex items-center justify-center"><span className="spinner" /></div>
            ) : sub ? (
              <>
                <div className="text-2xl font-extrabold mb-2">{sub.package.name}</div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{ background: subStatusColor.bg, border: `1px solid ${subStatusColor.border}`, color: subStatusColor.text }}>
                  <span className="live-pulse w-1.5 h-1.5 rounded-full inline-block" style={{ background: subStatusColor.text }} />
                  {sub.status}
                </span>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Renews {new Date(sub.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sub.package.maxStreams} simultaneous stream{sub.package.maxStreams > 1 ? 's' : ''}</p>
                <Link href="/subscribe" className="mt-5 block text-center py-2.5 rounded-xl text-xs font-bold transition-colors" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                  Upgrade Plan
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>No active subscription. Start watching today.</p>
                <Link href="/subscribe" className="block text-center py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 transition-colors text-white">
                  Choose a Plan
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="md:col-span-2 rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)' }}>Quick Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Channels', value: channels.length, color: '#3b82f6', icon: '📺' },
                { label: 'Premium', value: channels.filter(c => c.isPremium).length, color: '#f59e0b', icon: '⭐' },
                { label: 'Free', value: channels.filter(c => !c.isPremium).length, color: '#10b981', icon: '🆓' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-extrabold" style={{ color: s.color }}>{loading ? '…' : s.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <span className="text-2xl">📱</span>
                <div>
                  <div className="text-xs font-semibold text-blue-400">M3U Playlist</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Use with any IPTV player</div>
                </div>
              </div>
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-xs font-semibold" style={{ color: '#a78bfa' }}>EPG Guide</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>7-day TV schedule</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Live Channels</h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search channels…"
                  className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none w-64"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            {/* Category filters */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {categories.slice(0, 8).map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: activeCategory === cat ? '#3b82f6' : 'var(--bg-secondary)',
                    color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                    border: '1px solid ' + (activeCategory === cat ? '#3b82f6' : 'var(--border)'),
                  }}>
                  {cat === 'All' ? '🌐 All' : (categoryIcons[cat] || '📺') + ' ' + cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center gap-4">
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading channels…</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center">
              <p className="text-4xl mb-4">⚠️</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-5xl mb-4">📺</p>
              <p className="font-semibold mb-2">{search ? 'No channels found' : 'No channels yet'}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {search ? `No results for "${search}"` : 'Channels will appear here once added.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-6">
              {filtered.map((ch) => {
                const color = categoryColors[ch.category] || categoryColors.Default;
                const icon = categoryIcons[ch.category] || categoryIcons.Default;
                return (
                  <div key={ch.id} className="rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 hover:border-blue-500/30"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 flex-shrink-0"
                      style={{ background: `${color}18` }}>
                      {icon}
                    </div>
                    <p className="text-xs font-semibold leading-tight truncate w-full">{ch.name}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{ch.category}</p>
                    {ch.isPremium && (
                      <span className="mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>⭐ Premium</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Showing {filtered.length} of {channels.length} channels</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
