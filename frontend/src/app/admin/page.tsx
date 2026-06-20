'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Stats { users: number; channels: number; streams: number; activeSubscriptions: number }
interface PeriodStats { newUsers: number; newSubscriptions: number; expiredSubscriptions: number }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState<PeriodStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard').then(({ data }) => setStats(data.data)),
      api.get('/admin/stats').then(({ data }) => setPeriod(data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.users, icon: '👥', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
    { label: 'Live Channels', value: stats?.channels, icon: '📺', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    { label: 'Active Streams', value: stats?.streams, icon: '📡', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
    { label: 'Subscribers', value: stats?.activeSubscriptions, icon: '💳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  ];

  const periodCards = [
    { label: 'New Users', sub: 'Last 30 days', value: period?.newUsers, icon: '📈', color: '#10b981' },
    { label: 'New Subscriptions', sub: 'Last 30 days', value: period?.newSubscriptions, icon: '✅', color: '#3b82f6' },
    { label: 'Expired Subscriptions', sub: 'Last 30 days', value: period?.expiredSubscriptions, icon: '⚠️', color: '#f59e0b' },
  ];

  if (loading) return (
    <div className="p-10 flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
      <span className="spinner" /> Loading dashboard…
    </div>
  );

  return (
    <div className="p-8 fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-2xl p-6" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{c.icon}</span>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: c.color }}>{c.value ?? '…'}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Last 30 Days</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {periodCards.map((c) => (
          <div key={c.label} className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl mb-3">{c.icon}</div>
            <div className="text-2xl font-extrabold" style={{ color: c.color }}>{c.value ?? '…'}</div>
            <div className="font-semibold mt-1">{c.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
