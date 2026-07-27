import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referral System',
  description: 'Refer friends, earn points',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
