'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Sub { id: string; status: string; expiresAt: string; createdAt: string; user: { name: string; email: string }; package: { name: string; price: number } }

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 20;

  useEffect(() => {
    api.get(`/subscriptions?page=${page}&limit=${limit}${statusFilter ? `&status=${statusFilter}` : ''}`)
      .then(({ data }) => { setSubs(data.data); setTotal(data.meta?.total || 0); });
  }, [page, statusFilter]);

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-900 text-green-300',
    EXPIRED: 'bg-red-900 text-red-300',
    CANCELLED: 'bg-slate-700 text-slate-400',
    PENDING: 'bg-yellow-900 text-yellow-300',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscriptions <span className="text-slate-400 text-lg font-normal">({total})</span></h1>
        <select
          value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="text-left px-6 py-4">User</th>
              <th className="text-left px-6 py-4">Package</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Expires</th>
              <th className="text-left px-6 py-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-slate-750">
                <td className="px-6 py-4">
                  <div className="font-medium">{s.user?.name}</div>
                  <div className="text-slate-400 text-xs">{s.user?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div>{s.package?.name}</div>
                  <div className="text-slate-400 text-xs">${s.package?.price}/mo</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[s.status] || 'bg-slate-700 text-slate-400'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{new Date(s.expiresAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {subs.length === 0 && <div className="p-12 text-center text-slate-500">No subscriptions found</div>}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
        <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40">Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total} className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
