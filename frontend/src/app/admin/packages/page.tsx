'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Package { id: string; name: string; price: number; durationDays: number; maxStreams: number; isActive: boolean; features: string[] }

const emptyForm = { name: '', description: '', price: '', durationDays: '30', maxStreams: '1', features: '' };

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() { api.get('/packages').then(({ data }) => setPackages(data.data.packages)); }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      await api.post('/packages', {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        durationDays: parseInt(form.durationDays),
        maxStreams: parseInt(form.maxStreams),
        features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
      });
      setModal(false); setForm(emptyForm); load();
    } finally { setSaving(false); }
  }

  async function toggleActive(id: string, current: boolean) {
    await api.put(`/packages/${id}`, { isActive: !current });
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Packages</h1>
        <button onClick={() => setModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
          + New Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{pkg.name}</h3>
                <div className="text-2xl font-bold text-blue-400 mt-1">${pkg.price}<span className="text-sm text-slate-400">/mo</span></div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${pkg.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {pkg.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <ul className="space-y-1 text-sm text-slate-300 mb-4">
              {Array.isArray(pkg.features) && pkg.features.map((f) => <li key={f}>✓ {f}</li>)}
              <li>✓ {pkg.maxStreams} Stream{pkg.maxStreams > 1 ? 's' : ''}</li>
              <li>✓ {pkg.durationDays} days</li>
            </ul>
            <button
              onClick={() => toggleActive(pkg.id, pkg.isActive)}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
            >
              {pkg.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold mb-6">New Package</h2>
            <div className="space-y-4">
              {[
                { label: 'Name', key: 'name', placeholder: 'Basic' },
                { label: 'Description', key: 'description', placeholder: 'Essential channels' },
                { label: 'Price (USD/mo)', key: 'price', placeholder: '9.99' },
                { label: 'Duration (days)', key: 'durationDays', placeholder: '30' },
                { label: 'Max Streams', key: 'maxStreams', placeholder: '1' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-slate-300 mb-1">{f.label}</label>
                  <input
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Features (one per line)</label>
                <textarea
                  rows={4} placeholder="HD Streams&#10;1000+ Channels&#10;EPG Guide"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">Cancel</button>
              <button onClick={save} disabled={saving || !form.name || !form.price} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm transition">
                {saving ? 'Saving...' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
