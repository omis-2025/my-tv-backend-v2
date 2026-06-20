'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, wire this to an email API or form service
    setSent(true);
  }

  return (
    <div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit">
            <span className="text-2xl">📺</span>
            <span className="text-xl font-bold">My<span className="text-blue-500">TV</span></span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
          <p style={{ color: 'var(--text-secondary)' }}>We typically respond within 24 hours.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            { icon: '✉️', title: 'Email', value: 'support@mytv.com' },
            { icon: '💬', title: 'Live Chat', value: 'Available 9am–6pm UTC' },
            { icon: '📚', title: 'Help Center', value: 'docs.mytv.com' },
          ].map(c => (
            <div key={c.title} className="rounded-xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-3xl mb-2">{c.icon}</div>
              <p className="font-semibold text-sm">{c.title}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{c.value}</p>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="rounded-2xl p-10 text-center fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">Message sent!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>We'll get back to you within 24 hours.</p>
            <Link href="/" className="px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors inline-block">
              Back to MyTV
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Name</label>
                  <input required value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <select value={form.subject} onChange={e => setForm({...form,subject:e.target.value})} required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: form.subject ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  <option value="">Select a topic</option>
                  <option>Billing & Payments</option>
                  <option>Account Issues</option>
                  <option>Technical Support</option>
                  <option>Channel Requests</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({...form,message:e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Describe your issue or question…" />
              </div>
              <button type="submit" className="w-full py-3.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                Send Message
              </button>
            </form>
          </div>
        )}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>← Back to MyTV</Link>
        </div>
      </div>
    </div>
  );
}
