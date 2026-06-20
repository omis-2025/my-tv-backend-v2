import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyTV — IPTV SaaS Platform',
  description: 'Stream thousands of channels with MyTV',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
