import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lupa Password',
  robots: { index: false, follow: false },
};

export default function LupaPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
