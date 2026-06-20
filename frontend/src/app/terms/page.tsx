import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit">
            <span className="text-2xl">📺</span>
            <span className="text-xl font-bold">My<span className="text-blue-500">TV</span></span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: June 2026</p>
        </div>
        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {[
            { title: '1. Acceptance of Terms', body: 'By accessing or using MyTV services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.' },
            { title: '2. Service Description', body: 'MyTV provides an IPTV streaming platform offering access to live television channels. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.' },
            { title: '3. Account Registration', body: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.' },
            { title: '4. Subscription and Payments', body: 'Paid subscriptions are billed monthly. All payments are processed securely through Stripe. By subscribing, you authorize us to charge your payment method. Prices may change with 30 days notice.' },
            { title: '5. Cancellation and Refunds', body: 'You may cancel your subscription at any time from your account settings. Your access continues until the end of the current billing period. We offer a 7-day money-back guarantee for first-time subscribers.' },
            { title: '6. Acceptable Use', body: 'You agree not to share your account credentials, use automated tools to access the service, attempt to circumvent any security measures, or use the service for any illegal purpose.' },
            { title: '7. Intellectual Property', body: 'All content available through MyTV is protected by copyright. You may only view content for personal, non-commercial use. Downloading, recording, or redistributing content is strictly prohibited.' },
            { title: '8. Limitation of Liability', body: 'MyTV provides the service "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.' },
            { title: '9. Changes to Terms', body: 'We may update these Terms at any time. Continued use of the service after changes constitutes acceptance of the new Terms.' },
            { title: '10. Contact', body: 'For questions about these Terms, contact us at support@mytv.com.' },
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
