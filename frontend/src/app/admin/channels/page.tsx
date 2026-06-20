'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Channel { id: string; name: string; category: string; country?: string; isPremium: boolean; isActive: boolean; }

const empty = { name: '', category: '', country: '', isPremium: false, isActive: true, url: '' };

export default function AdminChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const limit = 20;

  function load() {
    api.get(`/channels?page=${page}&limit=${limit}`).then(({ data }) => {
      setChannels(data.data); setTotal(data.meta?.total || 0);
    });
  }

  useEffect(() => { load(); }, [page]);

  async function save() {
    setSaving(true);
    try {
      await api.post('/channels', { ...form, sortOrder: 0 });
      setModal(false); setForm(empty); load();
    } finally { setSaving(false); }
  }

  async function deleteChannel(id: string) {
    if (!confirm('Delete this channel?')) return;
    await api.delete(`/channels/${id}`);
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Channels <span className="text-slate-400 text-lg font-normal">({total})</span></h1>
        <button onClick={() => setModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
          + Add Channel
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="text-left px-6 py-4">Name</th>
              <th className="text-left px-6 py-4">Category</th>
              <th className="text-left px-6 py-4">Country</th>
              <th className="text-left px-6 py-4">Type</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {channels.map((ch) => (
              <tr key={ch.id} className="hover:bg-slate-750">
                <td className="px-6 py-4 font-medium">📺 {ch.name}</td>
                <td className="px-6 py-4 text-slate-400">{ch.category}</td>
                <td className="px-6 py-4 text-slate-400">{ch.country || '—'}</td>
                <td className="px-6 py-4">
                  {ch.isPremium
                    ? <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded text-xs">⭐ Premium</span>
                    : <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Free</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${ch.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {ch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteChannel(ch.id)} className="text-xs px-3 py-1 bg-red-900 hover:bg-red-800 text-red-300 rounded transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {channels.length === 0 && <div className="p-12 text-center text-slate-500">No channels yet. Add one!</div>}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
        <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40">Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total} className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40">Next</button>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold mb-6">Add Channel</h2>
            <div className="space-y-4">
              {[
                { label: 'Channel Name', key: 'name', type: 'text', placeholder: 'BBC News' },
                { label: 'Category', key: 'category', type: 'text', placeholder: 'News' },
                { label: 'Country', key: 'country', type: 'text', placeholder: 'UK' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-slate-300 mb-1">{f.label}</label>
                  <input
                    type={f.type} placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm text-slate-300">Premium Channel</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">Cancel</button>
              <button onClick={save} disabled={saving || !form.name || !form.category} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm transition">
                {saving ? 'Saving...' : 'Add Channel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
