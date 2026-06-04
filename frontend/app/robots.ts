import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Blokir halaman CMS, auth, dan URL berparameter dari crawler
        disallow: [
          "/cms/",
          "/login",
          "/register",
          "/api/",
          "/*?*", // URL dengan query string (kecuali /cari yang sudah di-allow via canonical)
        ],
      },
      {
        // Izinkan Googlebot mengakses semua halaman publik tanpa batasan
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/cms/", "/login", "/register", "/api/"],
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/news-sitemap.xml`,
    ],
  };
}
