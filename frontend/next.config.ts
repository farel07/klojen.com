import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts", "es-toolkit"],
  images: {
    // Izinkan optimasi gambar dari URL eksternal (S3, Cloudinary, CDN)
    // Perketat ke domain spesifik saat produksi, contoh:
    // { protocol: "https", hostname: "res.cloudinary.com" }
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
