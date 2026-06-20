'use client';
import Link from 'next/link';

const plans = [
  { name: 'Free', price: '$0', period: '/mo', channels: '50+', streams: 1, quality: 'SD', color: 'border-green-600' },
  { name: 'Basic', price: '$4.99', period: '/mo', channels: '500+', streams: 1, quality: 'SD', color: 'border-slate-600' },
  { name: 'Standard', price: '$9.99', period: '/mo', channels: '1,000+', streams: 2, quality: 'HD', color: 'border-blue-500', popular: true },
  { name: 'Premium', price: '$14.99', period: '/mo', channels: '5,000+', streams: 4, quality: '4K', color: 'border-purple-500' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <span className="text-2xl font-bold text-blue-500">📺 MyTV</span>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition">Login</Link>
          <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-4">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Watch Anything, Anywhere
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          5,000+ live channels, HD & 4K quality, EPG guide included. Start watching in 60 seconds.
        </p>
        <Link href="/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold transition inline-block">
          Start Free Trial →
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-12 max-w-5xl mx-auto">
        {[
          { icon: '📡', title: '5,000+ Channels', desc: 'Sports, news, movies, entertainment from 100+ countries' },
          { icon: '🎬', title: 'HD & 4K Streams', desc: 'Crystal clear picture quality on all your devices' },
          { icon: '📅', title: 'EPG TV Guide', desc: 'Full electronic program guide so you never miss a show' },
        ].map((f) => (
          <div key={f.title} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="py-16 px-4" id="pricing">
        <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`bg-slate-800 rounded-xl p-8 border-2 ${p.color} relative`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
              )}
              <h3 className="text-xl font-bold mb-2">{p.name}</h3>
              <div className="text-4xl font-bold mb-1">{p.price}<span className="text-sm text-slate-400">{p.period}</span></div>
              <ul className="mt-6 space-y-3 text-slate-300 text-sm mb-8">
                <li>✓ {p.channels} Channels</li>
                <li>✓ {p.streams} Simultaneous Stream{p.streams > 1 ? 's' : ''}</li>
                <li>✓ {p.quality} Quality</li>
                <li>✓ EPG Guide</li>
              </ul>
              <Link href="/register" className="block text-center py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
                Get {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-slate-500 border-t border-slate-800">
        © 2026 MyTV. All rights reserved.
      </footer>
    </div>
  );
}
