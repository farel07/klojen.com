import type { Metadata } from "next";
import Beranda from "../pages/beranda";

export const metadata: Metadata = {
  // title tidak diset → menggunakan default dari layout: "Klojen | Portal Berita Kota Malang"
  alternates: {
    canonical: "/",
  },
};

// JSON-LD WebSite schema untuk sitelinks search box di Google
function WebsiteJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Klojen",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/cari?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <WebsiteJsonLd />
      <Beranda />
    </>
  );
}
