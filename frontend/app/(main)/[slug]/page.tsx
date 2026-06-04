import type { Metadata } from "next";
import DetailArtikel from "../../pages/detailArtikel";

interface Props {
  params: Promise<{ slug: string }>;
}

// ─── Fetch artikel untuk SEO (server-side) ─────────────────────────────────

interface ArticleForSeo {
  title: string;
  slug: string;
  content: string;
  featured_image_url: string | null;
  published_at: string | null;
  updated_at?: string | null;
  author: { name: string };
  category: { name: string } | null;
  tags: { name: string }[];
}

async function fetchArticleForSeo(slug: string): Promise<ArticleForSeo | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/articles/${slug}`, {
      // ISR: halaman di-cache dan diperbarui di background tiap 60 detik
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ─── Helper: strip HTML tags & truncate ────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function buildExcerpt(content: string, maxLength = 160): string {
  const plain = stripHtml(content);
  return plain.length > maxLength
    ? plain.slice(0, maxLength).trimEnd() + "…"
    : plain;
}

// ─── generateMetadata ──────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const article = await fetchArticleForSeo(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan",
      description: "Artikel yang Anda cari tidak ditemukan di portal berita Klojen.",
      robots: { index: false, follow: false },
    };
  }

  const description = buildExcerpt(article.content);
  const canonicalUrl = `${siteUrl}/${slug}`;
  const imageUrl = article.featured_image_url ?? undefined;

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "id_ID",
      siteName: "Klojen",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? article.published_at ?? undefined,
      authors: [`${siteUrl}/profil`],
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// ─── JSON-LD NewsArticle Schema ────────────────────────────────────────────

function NewsArticleJsonLd({ article, slug }: { article: ArticleForSeo; slug: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const description = buildExcerpt(article.content);

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description,
    url: `${siteUrl}/${slug}`,
    datePublished: article.published_at ?? new Date().toISOString(),
    dateModified: article.updated_at ?? article.published_at ?? new Date().toISOString(),
    author: [
      {
        "@type": "Person",
        name: article.author?.name ?? "Redaksi Klojen",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Klojen",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    ...(article.featured_image_url && {
      image: [article.featured_image_url],
    }),
    ...(article.category && {
      articleSection: article.category.name,
    }),
    ...(article.tags?.length > 0 && {
      keywords: article.tags.map((t) => t.name).join(", "),
    }),
    inLanguage: "id-ID",
    isAccessibleForFree: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Halaman ───────────────────────────────────────────────────────────────

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch ulang untuk JSON-LD — data sudah di-cache oleh Next.js (deduplication)
  const article = await fetchArticleForSeo(slug);

  return (
    <>
      {article && <NewsArticleJsonLd article={article} slug={slug} />}
      <DetailArtikel slug={slug} />
    </>
  );
}
