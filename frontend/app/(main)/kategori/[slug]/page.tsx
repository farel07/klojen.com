import Kategori from "@/app/pages/kategori";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

// ── Fetch nama kategori dari API ────────────────────────────────────────────

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

async function fetchCategory(slug: string): Promise<CategoryData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 3600 }, // kategori jarang berubah, cache 1 jam
    });
    if (!res.ok) return null;
    const json = await res.json();
    const categories: CategoryData[] = json?.data ?? [];
    return categories.find((c) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
}

// ── Dynamic Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const category = await fetchCategory(slug);

  const categoryName = category?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
  const title = `${categoryName} Kota Malang`;
  const description = `Baca berita dan artikel terbaru seputar ${categoryName} di Kota Malang. Informasi terkini, terpercaya, dan dikurasi khusus untuk Anda.`;
  const canonicalUrl = `${siteUrl}/kategori/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Klojen`,
      description,
      url: canonicalUrl,
      type: "website",
      locale: "id_ID",
      siteName: "Klojen",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Klojen`,
      description,
    },
  };
}

// ── BreadcrumbList JSON-LD ──────────────────────────────────────────────────

function BreadcrumbJsonLd({
  categoryName,
  slug,
}: {
  categoryName: string;
  slug: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${siteUrl}/kategori/${slug}`,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function KategoriPage({ params }: Props) {
  const { slug } = await params;
  const category = await fetchCategory(slug);
  const categoryName =
    category?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <>
      <BreadcrumbJsonLd categoryName={categoryName} slug={slug} />
      <Kategori slug={slug} />
    </>
  );
}
