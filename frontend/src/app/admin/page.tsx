'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Stats { users: number; channels: number; streams: number; activeSubscriptions: number }
interface PeriodStats { newUsers: number; newSubscriptions: number; expiredSubscriptions: number }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState<PeriodStats | null>(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data.data));
    api.get('/admin/stats').then(({ data }) => setPeriod(data.data));
  }, []);

  const cards = stats ? [
    { label: 'Total Users', value: stats.users, icon: '👥', color: 'text-blue-400' },
    { label: 'Live Channels', value: stats.channels, icon: '📺', color: 'text-green-400' },
    { label: 'Active Streams', value: stats.streams, icon: '📡', color: 'text-purple-400' },
    { label: 'Active Subscribers', value: stats.activeSubscriptions, icon: '💳', color: 'text-yellow-400' },
  ] : [];

  const periodCards = period ? [
    { label: 'New Users (30d)', value: period.newUsers, icon: '📈' },
    { label: 'New Subs (30d)', value: period.newSubscriptions, icon: '✅' },
    { label: 'Expired Subs', value: period.expiredSubscriptions, icon: '⚠️' },
  ] : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-3xl mb-3">{c.icon}</div>
            <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-slate-400 text-sm mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Last 30 Days</h2>
      <div className="grid grid-cols-3 gap-5">
        {periodCards.map((c) => (
          <div key={c.label} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-slate-400 text-sm mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
