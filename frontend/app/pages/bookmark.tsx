"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { getBookmarks, toggleBookmark } from "@/lib/api/bookmarks";
import { getArticles } from "@/lib/api/articles";
import { Article, Bookmark } from "@/app/types";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return dayjs(dateStr).format("D MMMM YYYY");
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex justify-between mt-4">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-5 w-5 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Komponen Utama ────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6;

export default function BookmarkPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [popular, setPopular] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // ── Guard: redirect ke login jika belum auth ──────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  // ── Fetch bookmarks ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    getBookmarks()
      .then((res) => setBookmarks(res.data.data.bookmarks))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // ── Fetch artikel populer untuk sidebar ──────────────────────────────────
  useEffect(() => {
    getArticles({ status: "published", limit: 4 })
      .then((res) => setPopular(res.data.data.articles))
      .catch(() => {});
  }, []);

  // ── Toggle (hapus) bookmark ───────────────────────────────────────────────
  const handleRemoveBookmark = async (bookmarkId: string, articleId: string) => {
    setRemovingId(bookmarkId);
    try {
      await toggleBookmark(articleId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch {
      // ignore
    } finally {
      setRemovingId(null);
    }
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(bookmarks.length / ITEMS_PER_PAGE);
  const paginated = bookmarks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            Beranda
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-semibold">Di Simpan</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Artikel Di Simpan</h1>
          <p className="text-gray-500 text-sm">
            Halo, <strong>{user?.name}</strong> — kamu memiliki{" "}
            <span className="text-blue-600 font-semibold">{bookmarks.length}</span> artikel tersimpan.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── KIRI: Grid Artikel ── */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : bookmarks.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <svg className="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada artikel tersimpan</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">
                  Simpan artikel favorit kamu dengan menekan tombol bookmark di halaman artikel.
                </p>
                <Link
                  href="/"
                  className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Jelajahi Artikel
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginated.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      removing={removingId === bookmark.id}
                      onRemove={() => handleRemoveBookmark(bookmark.id, bookmark.article.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      current={currentPage}
                      total={totalPages}
                      onChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── KANAN: Sidebar Populer ── */}
          <aside className="w-full lg:w-[340px] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24">
              <h2 className="text-sm font-bold text-gray-900 tracking-widest uppercase mb-6">
                Terpopuler Minggu Ini
              </h2>
              <div className="space-y-5">
                {popular.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-24 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-3 bg-gray-200 rounded" />
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                          <div className="h-2 bg-gray-200 rounded w-1/2 mt-2" />
                        </div>
                      </div>
                    ))
                  : popular.map((article, idx) => (
                      <div key={article.id}>
                        <Link href={`/${article.slug}`} className="flex gap-4 group">
                          <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {article.featured_image_url ? (
                              <Image
                                src={article.featured_image_url}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                –
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-0.5">
                            <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                              {article.title}
                            </h4>
                            <span className="text-[11px] text-gray-400 mt-1">
                              {formatDate(article.published_at ?? article.created_at)}
                            </span>
                          </div>
                        </Link>
                        {idx < popular.length - 1 && <hr className="border-gray-100 mt-5" />}
                      </div>
                    ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── BookmarkCard ─────────────────────────────────────────────────────────────

interface BookmarkCardProps {
  bookmark: Bookmark;
  removing: boolean;
  onRemove: () => void;
}

function BookmarkCard({ bookmark, removing, onRemove }: BookmarkCardProps) {
  const { article } = bookmark;

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        removing ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {/* Gambar */}
      <Link href={`/${article.slug}`} className="block">
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
          {article.featured_image_url ? (
            <Image
              src={article.featured_image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Category badge */}
          {article.category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-700 px-2.5 py-1 rounded-full shadow-sm">
              {article.category.name}
            </span>
          )}
        </div>
      </Link>

      {/* Konten */}
      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/${article.slug}`}>
          <h3 className="font-bold text-gray-900 leading-snug mb-2 text-base group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {article.excerpt && (
          <p className="text-gray-400 text-sm line-clamp-2 flex-grow mb-4">
            {article.excerpt}
          </p>
        )}

        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
          <span className="text-gray-400 text-xs">
            {formatDate(article.published_at ?? null)}
          </span>
          <button
            onClick={onRemove}
            aria-label="Hapus dari simpanan"
            className="text-blue-500 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Hapus dari simpanan"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

function Pagination({ current, total, onChange }: PaginationProps) {
  const pages: (number | "...")[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  const btnBase =
    "min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200";

  return (
    <div className="flex items-center gap-1.5 bg-white rounded-2xl shadow-md border border-gray-100 px-3 py-2">
      {/* Prev */}
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${btnBase} px-3 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-300 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`${btnBase} px-3 ${
              p === current
                ? "bg-black text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={`${btnBase} px-3 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
