'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getUser } from '@/lib/auth';

const links = [
  { href: '/admin', label: 'Dashboard', icon: '▤', exact: true },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/channels', label: 'Channels', icon: '📺' },
  { href: '/admin/streams', label: 'Streams', icon: '📡' },
  { href: '/admin/packages', label: 'Packages', icon: '📦' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💳' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  function logout() { clearAuth(); router.push('/'); }

  return (
    <aside className="w-60 min-h-screen flex flex-col" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
      <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center gap-2 mb-1">
          <span className="text-xl">📺</span>
          <span className="font-bold">My<span className="text-blue-500">TV</span></span>
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Admin Panel</p>
      </div>

      {user && (
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-600">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-0.5">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: active ? '#60a5fa' : 'var(--text-secondary)',
                borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent',
              }}>
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:bg-white/5 mb-0.5" style={{ color: 'var(--text-secondary)' }}>
          <span>🌐</span> View Site
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:bg-red-500/10 text-left" style={{ color: 'var(--text-secondary)' }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
