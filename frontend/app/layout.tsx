import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider';
import AnalyticsTracker from './components/AnalyticsTracker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Klojen | Portal Berita Kota Malang",
    // Halaman lain akan menghasilkan: "Judul Artikel | Klojen"
    template: "%s | Klojen",
  },
  description:
    "Portal berita khusus Kota Malang yang berfokus pada pendidikan, kuliner, wisata, dan hotel. Eksplorasi penginapan paling berkarakter di Indonesia. Dikurasi secara independen untuk Anda.",
  openGraph: {
    siteName: "Klojen",
    locale: "id_ID",
    type: "website",
    title: "Klojen | Portal Berita Kota Malang",
    description:
      "Portal berita khusus Kota Malang yang berfokus pada pendidikan, kuliner, wisata, dan hotel.",
    url: "/",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Klojen — Portal Berita Kota Malang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Klojen | Portal Berita Kota Malang",
    description:
      "Portal berita khusus Kota Malang yang berfokus pada pendidikan, kuliner, wisata, dan hotel.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnalyticsTracker />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}