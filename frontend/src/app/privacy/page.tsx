import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit">
            <span className="text-2xl">📺</span>
            <span className="text-xl font-bold">My<span className="text-blue-500">TV</span></span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: June 2026</p>
        </div>
        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {[
            { title: 'Information We Collect', body: 'We collect your name, email address, and payment information (processed securely by Stripe — we never store card details). We also collect usage data such as channel views and session times to improve our service.' },
            { title: 'How We Use Your Information', body: 'We use your information to provide and improve the MyTV service, process payments, send account-related notifications, and provide customer support. We do not sell your personal information to third parties.' },
            { title: 'Data Storage & Security', body: 'Your data is stored on secure servers. We use industry-standard encryption for data transmission (HTTPS) and at rest. Passwords are hashed using bcrypt and are never stored in plain text.' },
            { title: 'Cookies', body: 'We use essential cookies to maintain your session and keep you logged in. We do not use tracking cookies or third-party advertising cookies.' },
            { title: 'Third-Party Services', body: 'We use Stripe for payment processing. Stripe\'s privacy policy governs how your payment information is handled. We do not share your data with any other third parties.' },
            { title: 'Data Retention', body: 'We retain your account data for as long as your account is active. Upon account deletion, your personal data is removed within 30 days, except where required by law.' },
            { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal data. You may also request a copy of all data we hold about you. To exercise these rights, contact us at privacy@mytv.com.' },
            { title: 'Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our website.' },
            { title: 'Contact', body: 'For privacy-related questions, contact us at privacy@mytv.com.' },
          ].map(s => (
            <div key={s.title}>
              <h2 className="text-base font-bold text-white mb-2">{s.title}</h2>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>← Back to MyTV</Link>
        </div>
      </div>
    </div>
  );
}
