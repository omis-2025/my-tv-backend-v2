'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Stream {
  id: string; channelId: string; url: string; streamType: string;
  priority: number; isActive: boolean; channel?: { name: string };
}
interface HealthResult { id: string; url: string; healthy: boolean; status: number | null; error: string | null; }

export default function AdminStreams() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [health, setHealth] = useState<Record<string, HealthResult>>({});
  const [checking, setChecking] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [csv, setCsv] = useState('channelName,url,streamType,priority\n');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const limit = 20;

  function load() {
    api.get(`/streams?page=${page}&limit=${limit}`).then(({ data }) => {
      setStreams(data.data); setTotal(data.meta?.total || 0);
    });
  }
  useEffect(() => { load(); }, [page]);

  async function runHealthCheck(disableBroken: boolean) {
    setChecking(true);
    try {
      const ids = streams.map((s) => s.id);
      const { data } = await api.post('/streams/health-check', { streamIds: ids, disableBroken });
      const map: Record<string, HealthResult> = {};
      for (const r of data.data.results) map[r.id] = r;
      setHealth(map);
      if (disableBroken) load();
    } finally { setChecking(false); }
  }

  async function toggleActive(s: Stream) {
    await api.post('/streams/bulk-update', { updates: [{ id: s.id, isActive: !s.isActive }] });
    load();
  }

  async function deleteStream(id: string) {
    if (!confirm('Delete this stream?')) return;
    await api.delete(`/streams/${id}`);
    load();
  }

  async function doImport() {
    setImporting(true); setImportResult(null);
    try {
      const { data } = await api.post('/streams/import-csv', { csv });
      setImportResult(data.data);
      load();
    } catch (e: any) {
      setImportResult({ error: e.response?.data?.message || 'Import failed' });
    } finally { setImporting(false); }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Streams <span className="text-slate-400 text-lg font-normal">({total})</span></h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => runHealthCheck(false)} disabled={checking || !streams.length}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-sm font-medium transition">
            {checking ? 'Checking…' : '🩺 Health Check'}
          </button>
          <button onClick={() => runHealthCheck(true)} disabled={checking || !streams.length}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 rounded-lg text-sm font-medium transition">
            Check & Disable Broken
          </button>
          <button onClick={() => setImportOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
            ⬆ Import CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="text-left px-6 py-4">Channel</th>
              <th className="text-left px-6 py-4">URL</th>
              <th className="text-left px-6 py-4">Type</th>
              <th className="text-left px-6 py-4">Priority</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Health</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {streams.map((s) => {
              const h = health[s.id];
              return (
                <tr key={s.id} className="hover:bg-slate-750">
                  <td className="px-6 py-4 font-medium">{s.channel?.name || s.channelId}</td>
                  <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={s.url}>{s.url}</td>
                  <td className="px-6 py-4 text-slate-400">{s.streamType}</td>
                  <td className="px-6 py-4 text-slate-400">{s.priority}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive(s)}
                      className={`px-2 py-1 rounded text-xs ${s.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {h ? (
                      <span className={`px-2 py-1 rounded text-xs ${h.healthy ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}
                        title={h.error || `HTTP ${h.status}`}>
                        {h.healthy ? '✓ OK' : `✕ ${h.error || h.status || 'Down'}`}
                      </span>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteStream(s.id)} className="text-xs px-3 py-1 bg-red-900 hover:bg-red-800 text-red-300 rounded transition">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {streams.length === 0 && <div className="p-12 text-center text-slate-500">No streams yet. Import a CSV to attach streams to channels.</div>}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
        <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40">Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total} className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40">Next</button>
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-2xl border border-slate-700">
            <h2 className="text-xl font-bold mb-2">Import Streams from CSV</h2>
            <p className="text-sm text-slate-400 mb-4">
              Columns: <code className="text-blue-300">channelId</code> or <code className="text-blue-300">channelName</code>,
              {' '}<code className="text-blue-300">url</code>, <code className="text-blue-300">streamType</code> (HLS/DASH/RTMP/MP4),
              {' '}<code className="text-blue-300">priority</code>. Channels are matched by id or exact name.
            </p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={10}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              placeholder="channelName,url,streamType,priority&#10;BBC One,https://cdn/bbc.m3u8,HLS,0" />

            {importResult && (
              <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-700 text-sm">
                {importResult.error ? (
                  <p className="text-red-300">{importResult.error}</p>
                ) : (
                  <>
                    <p className="text-green-300">✓ Imported {importResult.created} stream(s){importResult.failed ? `, ${importResult.failed} failed` : ''}.</p>
                    {importResult.errors?.length > 0 && (
                      <ul className="mt-2 text-red-300 text-xs space-y-0.5 max-h-32 overflow-auto">
                        {importResult.errors.map((er: any, i: number) => <li key={i}>Line {er.line}: {er.error}</li>)}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setImportOpen(false); setImportResult(null); }} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">Close</button>
              <button onClick={doImport} disabled={importing} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm transition">
                {importing ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
