'use client';
import Link from 'next/link';
import { useState } from 'react';

const plans = [
  {
    id: 'free', name: 'Free', price: 0, period: '/mo', badge: null,
    features: ['50+ Free Channels', '1 Device', 'SD Quality', 'Basic EPG'],
    cta: 'Start Free', href: '/register', accent: 'border-slate-600',
  },
  {
    id: 'basic', name: 'Basic', price: 4.99, period: '/mo', badge: null,
    features: ['500+ Channels', '1 Device', 'SD Quality', 'Full EPG'],
    cta: 'Get Basic', href: '/register', accent: 'border-blue-600',
  },
  {
    id: 'standard', name: 'Standard', price: 9.99, period: '/mo', badge: 'Most Popular',
    features: ['1,000+ Channels', '2 Devices', 'HD Quality', 'Full EPG', 'VOD Library'],
    cta: 'Get Standard', href: '/register', accent: 'border-blue-500',
  },
  {
    id: 'premium', name: 'Premium', price: 14.99, period: '/mo', badge: 'Best Value',
    features: ['5,000+ Channels', '4 Devices', '4K Quality', 'Full EPG', 'VOD Library', 'Multi-screen'],
    cta: 'Get Premium', href: '/register', accent: 'border-purple-500',
  },
];

const faqs = [
  { q: 'What devices can I watch MyTV on?', a: 'MyTV works on any device with a browser — Smart TVs, phones, tablets, laptops, and desktops. You can also use any IPTV player with our M3U playlist link.' },
  { q: 'Is there a free trial?', a: 'Yes! Our Free plan gives you instant access to 50+ channels with no credit card required. Upgrade anytime to unlock more channels and devices.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, cancel anytime from your account dashboard. Your access continues until the end of the billing period with no cancellation fees.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) through our secure Stripe payment gateway.' },
  { q: 'How quickly does my subscription activate?', a: 'Instantly! As soon as your payment is confirmed, your channels are unlocked and you can start streaming immediately.' },
  { q: 'Do you offer refunds?', a: 'We offer a 7-day money-back guarantee on all paid plans if you\'re not completely satisfied.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(6,12,20,0.85)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">📺</span>
            <span className="text-xl font-bold text-white">My<span className="text-blue-500">TV</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#pricing" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pricing</a>
            <a href="#faq" className="text-sm" style={{ color: 'var(--text-secondary)' }}>FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Sign In
            </Link>
            <Link href="/register" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(139,92,246,0.07) 0%, transparent 60%)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
            <span className="live-pulse inline-block w-2 h-2 rounded-full bg-blue-400"></span>
            5,000+ Channels Now Live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Watch <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Anything</span>,
            <br />Anywhere
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            5,000+ live channels in HD & 4K — sports, news, movies, entertainment from 100+ countries. Start in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-blue-500/25">
              Start Free Today →
            </Link>
            <a href="#pricing" className="px-8 py-4 font-semibold text-lg rounded-xl transition-colors" style={{ border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
              View Plans
            </a>
          </div>
          <p className="mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>No credit card required · Cancel anytime · Instant access</p>
        </div>

        {/* Stats bar */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
            {[
              { num: '5,000+', label: 'Live Channels' },
              { num: '100+', label: 'Countries' },
              { num: '4K', label: 'Max Quality' },
              { num: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label} className="py-6 text-center" style={{ background: 'var(--bg-card)' }}>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-400">{s.num}</div>
                <div className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to stream</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Professional-grade IPTV infrastructure built for reliability</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📡', title: '5,000+ Live Channels', desc: 'Sports, news, movies, and entertainment channels from over 100 countries, available 24/7.' },
              { icon: '🎬', title: 'HD & 4K Streaming', desc: 'Crystal-clear picture quality on all your devices. Adaptive bitrate ensures smooth playback.' },
              { icon: '📅', title: 'Full EPG Guide', desc: 'Complete electronic programme guide with 7-day schedules so you never miss a show.' },
              { icon: '📱', title: 'Any Device', desc: 'Works on Smart TVs, phones, tablets, computers, and any IPTV player with M3U support.' },
              { icon: '⚡', title: 'Instant Setup', desc: 'Start watching within 60 seconds of signing up. No hardware or downloads required.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your streams are protected. Secure Stripe payments and no data sharing with third parties.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl p-7 transition-all hover:-translate-y-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 60%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => (
              <div key={p.id} className={`relative rounded-2xl p-8 flex flex-col transition-all hover:-translate-y-1 ${p.id === 'standard' ? 'ring-2 ring-blue-500' : ''}`}
                style={{ background: p.id === 'standard' ? 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(139,92,246,0.06))' : 'var(--bg-card)', border: `1px solid ${p.id === 'standard' ? 'rgba(59,130,246,0.4)' : 'var(--border)'}` }}>
                {p.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded-full" style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', color: 'white' }}>
                    {p.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold mb-1">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">{p.price === 0 ? 'Free' : `$${p.price}`}</span>
                  {p.price > 0 && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mo</span>}
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${p.id === 'standard' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25' : 'hover:bg-white/5 text-white'}`}
                  style={p.id !== 'standard' ? { border: '1px solid var(--border-light)' } : {}}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>All paid plans include a 7-day money-back guarantee · Cancel anytime · No contracts</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Everything you need to know about MyTV.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-sm">{faq.q}</span>
                  <span className="text-xl ml-4 flex-shrink-0 transition-transform" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed fade-in" style={{ color: 'var(--text-secondary)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center rounded-3xl p-12" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.2)' }}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to start streaming?</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>Join thousands of viewers watching live TV right now.</p>
          <Link href="/register" className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all shadow-xl hover:shadow-blue-500/30">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }} className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📺</span>
                <span className="font-bold text-white">My<span className="text-blue-500">TV</span></span>
              </div>
              <p className="text-xs leading-relaxed">Premium IPTV streaming with 5,000+ live channels worldwide.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-4 text-white">Account</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ borderTop: '1px solid var(--border)' }}>
            <span>© {new Date().getFullYear()} MyTV. All rights reserved.</span>
            <span>Powered by Stripe · Secured by HTTPS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
