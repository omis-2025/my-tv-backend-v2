'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/users', label: '👥 Users' },
  { href: '/admin/channels', label: '📺 Channels' },
  { href: '/admin/packages', label: '📦 Packages' },
  { href: '/admin/subscriptions', label: '💳 Subscriptions' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() { clearAuth(); router.push('/'); }

  return (
    <aside className="w-64 min-h-screen bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <Link href="/" className="text-xl font-bold text-blue-500">📺 MyTV</Link>
        <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href} href={l.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button onClick={logout} className="w-full text-left text-slate-400 hover:text-white text-sm px-4 py-3 hover:bg-slate-700 rounded-lg transition">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
