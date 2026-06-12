import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookmark Saya',
  robots: { index: false, follow: false },
};

export default function BookmarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
