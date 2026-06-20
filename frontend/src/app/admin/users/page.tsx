'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface User { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string }

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  function load() {
    api.get(`/users?page=${page}&limit=${limit}&search=${search}`)
      .then(({ data }) => { setUsers(data.data); setTotal(data.meta?.total || 0); });
  }

  useEffect(() => { load(); }, [page, search]);

  async function toggleStatus(id: string, current: boolean) {
    await api.put(`/users/${id}/status`, { isActive: !current });
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users <span className="text-slate-400 text-lg font-normal">({total})</span></h1>
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users..."
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
        />
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="text-left px-6 py-4">Name</th>
              <th className="text-left px-6 py-4">Email</th>
              <th className="text-left px-6 py-4">Role</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Joined</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-750">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4 text-slate-400">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'SUPER_ADMIN' ? 'bg-purple-900 text-purple-300' : u.role === 'ADMIN' ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${u.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStatus(u.id, u.isActive)}
                    className="text-xs px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded transition"
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-12 text-center text-slate-500">No users found</div>}
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
