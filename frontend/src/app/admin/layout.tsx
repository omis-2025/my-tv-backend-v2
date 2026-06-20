'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAdmin } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user || !isAdmin(user)) router.push('/login');
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
