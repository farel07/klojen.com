import type { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface ArticleSitemapEntry {
  slug: string;
  published_at: string | null;
  updated_at: string | null;
}

interface CategoryEntry {
  slug: string;
}

async function fetchArticlesForSitemap(): Promise<ArticleSitemapEntry[]> {
  try {
    const res = await fetch(`${API_URL}/articles/sitemap`, {
      next: { revalidate: 3600 }, // refresh sitemap setiap 1 jam
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<CategoryEntry[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([
    fetchArticlesForSitemap(),
    fetchCategories(),
  ]);

  // ── Halaman statis ───────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/cari`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── Halaman kategori ─────────────────────────────────────────────────────
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/kategori/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // ── Halaman artikel ───────────────────────────────────────────────────────
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/${article.slug}`,
    lastModified: article.updated_at
      ? new Date(article.updated_at)
      : article.published_at
        ? new Date(article.published_at)
        : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
