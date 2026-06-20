import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'MyTV — Premium IPTV Streaming',
  description: '5,000+ live channels in HD & 4K. Sports, news, movies, and more. Start watching instantly.',
  keywords: 'IPTV, live TV, streaming, channels, sports, movies, HD, 4K',
  openGraph: {
    title: 'MyTV — Premium IPTV Streaming',
    description: 'Stream 5,000+ live channels in HD & 4K quality.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📺</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
