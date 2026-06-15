import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface NewsArticle {
  slug: string;
  title: string;
  published_at: string;
}

// Google News Sitemap — hanya artikel dalam 48 jam terakhir
// Format harus menggunakan namespace xmlns:news dari Google
export async function GET() {
  let articles: NewsArticle[] = [];

  try {
    const res = await fetch(`${API_URL}/articles/news-sitemap`, {
      // Tidak di-cache — selalu fresh agar berita terbaru segera masuk
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      articles = json?.data ?? [];
    }
  } catch {
    // Jika API tidak tersedia, kembalikan sitemap kosong
    articles = [];
  }

  const urlEntries = articles
    .map((article) => {
      const loc = `${SITE_URL}/${article.slug}`;
      const pubDate = article.published_at
        ? new Date(article.published_at).toISOString()
        : new Date().toISOString();

      // Escape karakter XML yang berbahaya
      const safeTitle = article.title
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>Klojen</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache 30 menit di browser/CDN — Google News crawler datang lebih sering dari sitemap biasa
      "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=600",
    },
  });
}
