import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LocalShop Admin',
  description: 'Platform administration for LocalShop',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
