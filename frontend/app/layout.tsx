

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/footer";
import Navbar from "./components/navbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Klojen | Portal Berita Kota Malang",
  description: "Portal berita khusus Kota Malang yang berfokus pada pendidikan, kuliner, wisata, dan hotel. Eksplorasi penginapan paling berkarakter di Indonesia. Dikurasi secara independen untuk Anda.",
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
        <Navbar />
        {/* main dengan flex-grow akan mendorong footer ke bawah jika konten sedikit */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Memanggil komponen Footer */}
        <Footer />
      </body>
    </html>
  );
}