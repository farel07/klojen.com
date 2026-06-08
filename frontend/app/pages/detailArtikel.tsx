"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getArticles, getArticleBySlug, getComments, postComment, deleteComment } from "@/lib/api/articles";
import { toggleBookmark } from "@/lib/api/bookmarks";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/app/constants/errorMessages";
import { Article, Comment, Media } from "@/app/types";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return dayjs(dateStr).format("D MMMM YYYY");
}

function formatDateTime(dateStr: string) {
  return dayjs(dateStr).format("D MMMM YYYY, HH.mm");
}

// ─── Toast sederhana (tanpa library) ──────────────────────────────────────

type ToastType = "success" | "error" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return { toasts, show };
}

// ─── Komponen Toast ────────────────────────────────────────────────────────

function ToastContainer({ toasts }: { toasts: ToastState[] }) {
  const colors: Record<ToastType, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
  };
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${colors[t.type]} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Komponen Komentar Rekursif ────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  depth: number;
  onReply: (parentId: string, parentName: string) => void;
  onDelete: (commentId: string) => void;
  canDelete: boolean;
}

function CommentItem({ comment, depth, onReply, onDelete, canDelete }: CommentItemProps) {
  return (
    <div className={depth > 0 ? "ml-10 mt-4" : ""}>
      <div className="flex space-x-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm uppercase">
          {comment.user.name.charAt(0)}
        </div>
        <div className="flex-grow">
          <div className="flex items-center space-x-3 mb-1">
            <span className="font-bold text-gray-900 text-sm">{comment.user.name}</span>
            <span className="text-xs text-gray-400">{formatDateTime(comment.created_at)}</span>
          </div>
          <p className="text-gray-700 mb-2 text-sm leading-relaxed">{comment.content}</p>
          <div className="flex items-center space-x-4">
            {depth < 2 && (
              <button
                onClick={() => onReply(comment.id, comment.user.name)}
                className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
              >
                Balas
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton Loading ──────────────────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 border border-gray-200 rounded-3xl p-10">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-3xl p-6 h-64 bg-gray-50"></div>
      </div>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface DetailArtikelProps {
  slug: string;
}

// ─── Komponen Utama ────────────────────────────────────────────────────────

export default function DetailArtikel({ slug }: DetailArtikelProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { toasts, show: showToast } = useToast();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [errorArticle, setErrorArticle] = useState<string | null>(null);

  // Komentar
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Bookmark
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Hak hapus komentar
  const canDelete =
    isAuthenticated && (user?.role === "editor" || user?.role === "admin");

  // ── Fetch artikel ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!slug) return;

    getArticleBySlug(slug)
      .then((res) => {
        setArticle(res.data.data);
        setErrorArticle(null);
      })
      .catch((err) => {
        const code = err?.response?.data?.error ?? "INTERNAL_SERVER_ERROR";
        setErrorArticle(getErrorMessage(code));
      })
      .finally(() => setLoadingArticle(false));
  }, [slug]);

  // ── Fetch komentar setelah article berhasil ────────────────────────────

  useEffect(() => {
    if (!article?.id) return;

    getComments(article.id)
      .then((res) => setComments(res.data.data.comments))
      .catch(() => {/* komentar gagal — tidak fatal */ })
      .finally(() => setLoadingComments(false));
  }, [article?.id]);

  // ── Submit komentar ────────────────────────────────────────────────────

  const handleSubmitComment = async () => {
    if (!article) return;

    const trimmed = commentText.trim();
    if (trimmed.length < 3) {
      showToast(getErrorMessage("COMMENT_TOO_SHORT"), "warning");
      return;
    }
    if (trimmed.length > 1000) {
      showToast(getErrorMessage("COMMENT_TOO_LONG"), "warning");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await postComment(article.id, {
        content: trimmed,
        parent_id: replyTo?.id ?? null,
      });

      const newComment = res.data.data;

      if (replyTo) {
        // Tambahkan sebagai reply secara optimistic
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyTo.id) {
              return { ...c, replies: [...(c.replies ?? []), newComment] };
            }
            return c;
          }),
        );
      } else {
        // Tambahkan sebagai komentar baru (optimistic)
        setComments((prev) => [newComment, ...prev]);
      }

      setCommentText("");
      setReplyTo(null);
      showToast("Komentar berhasil dikirim", "success");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = axiosErr?.response?.data?.error ?? "INTERNAL_SERVER_ERROR";
      const rawMessage = axiosErr?.response?.data?.message;

      if (code === "COMMENT_RATE_LIMIT" && rawMessage) {
        showToast(rawMessage, "error");
      } else {
        showToast(getErrorMessage(code), "error");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  // ── Hapus komentar ─────────────────────────────────────────────────────

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Hapus komentar ini?")) return;

    try {
      await deleteComment(commentId);
      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: (c.replies ?? []).filter((r) => r.id !== commentId),
          })),
      );
      showToast("Komentar berhasil dihapus", "success");
    } catch {
      showToast("Gagal menghapus komentar", "error");
    }
  };

  // ── Toggle bookmark ────────────────────────────────────────────────────

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      showToast("Login terlebih dahulu untuk menyimpan artikel", "warning");
      return;
    }
    if (!article) return;

    setBookmarkLoading(true);
    try {
      const res = await toggleBookmark(article.id);
      setBookmarked(res.data.data.bookmarked);
      showToast(
        res.data.data.bookmarked ? "Artikel disimpan" : "Artikel dihapus dari simpanan",
        "success",
      );
    } catch {
      showToast("Gagal menyimpan artikel", "error");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────────────

  if (loadingArticle) {
    return (
      <div className="w-full bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ArticleSkeleton />
        </div>
      </div>
    );
  }

  if (errorArticle || !article) {
    return (
      <div className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-lg">{errorArticle ?? "Artikel tidak ditemukan."}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline font-medium">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length ?? 0),
    0,
  );

  // Hero Image
  const heroImageUrl = article.featured_image_url;

  // Ambil semua gambar dari tabel media untuk disisipkan ke isi artikel
  const additionalImages = article.media?.filter(m => m.media_type === 'image') || [];

  // ── Fungsi Pembagi Konten (Content Parser) ─────────────────────────────
  const renderContentWithImages = (content: string, mediaImages: Media[]) => {
    if (!content) return null;

    // Pisahkan konten berdasarkan tag penutup paragraf
    const paragraphs = content.split('</p>').filter(p => p.trim() !== '');
    const numParagraphs = paragraphs.length;

    // Tentukan titik sisip berdasarkan jumlah gambar tambahan
    const insertPositions: number[] = [];
    if (mediaImages.length === 1) {
      insertPositions.push(Math.floor(numParagraphs * 0.5));
    } else if (mediaImages.length >= 2) {
      insertPositions.push(Math.floor(numParagraphs * 0.33));
      insertPositions.push(Math.floor(numParagraphs * 0.66));
    }

    return (
      <div className="text-gray-800 space-y-6 leading-relaxed text-lg mb-10 prose max-w-none">
        {paragraphs.map((p, index) => {
          // Cari apakah index ini adalah titik sisip
          const insertIndex = insertPositions.indexOf(index);
          const imageToInsert = insertIndex !== -1 ? mediaImages[insertIndex] : null;

          return (
            <React.Fragment key={index}>
              <div dangerouslySetInnerHTML={{ __html: p + '</p>' }} />

              {imageToInsert && (
                <figure id={imageToInsert.id} className="my-8">
                  <div className="relative w-full h-[300px] md:h-[450px] bg-gray-100 rounded-2xl overflow-hidden">
                    <Image
                      src={imageToInsert.file_url}
                      alt={imageToInsert.alt_text || article.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {imageToInsert.alt_text && (
                    <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                      {imageToInsert.alt_text}
                    </figcaption>
                  )}
                </figure>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ── Render utama ───────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer toasts={toasts} />

      <div className="w-full bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* BREADCRUMBS */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center text-sm text-gray-500 mb-8 space-x-2 overflow-x-auto whitespace-nowrap pb-2"
          >
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Beranda
            </Link>
            <span className="text-gray-400">/</span>
            {article.category && (
              <>
                <Link
                  href={`/kategori/${article.category.slug}`}
                  className="hover:text-gray-900 transition-colors"
                >
                  {article.category.name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-xs">{article.title}</span>
          </nav>

          {/* MAIN GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: MAIN ARTICLE */}
            <article className="lg:col-span-2 border border-gray-200 rounded-3xl p-6 md:p-10 bg-white">

              {/* Article Meta */}
              <div className="flex justify-between items-center mb-6">
                <time dateTime={article.published_at ?? article.created_at} className="text-gray-500 text-sm font-medium">
                  {formatDate(article.published_at ?? article.created_at)}
                </time>
                <button
                  onClick={handleToggleBookmark}
                  disabled={bookmarkLoading}
                  aria-label={bookmarked ? "Hapus dari simpanan" : "Simpan artikel"}
                  className={`border rounded-full px-5 py-2 flex items-center space-x-2 transition-colors ${bookmarked
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800"
                    } disabled:opacity-60`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={bookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  <span className="text-sm font-semibold">
                    {bookmarked ? "Tersimpan" : "Simpan"}
                  </span>
                </button>
              </div>

              {/* Category badge */}
              {article.category && (
                <Link
                  href={`/kategori/${article.category.slug}`}
                  className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4 hover:bg-blue-200 transition-colors"
                >
                  {article.category.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Author + View Count */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
                    {article.author.name.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-900">{article.author.name}</span>
                </div>
                <span className="text-xs text-gray-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{article.view_count.toLocaleString("id-ID")} kali dilihat</span>
                </span>
              </div>

              {/* Featured Image */}
              {heroImageUrl && (
                <figure className="mb-8">
                  <div className="relative w-full h-[300px] md:h-[450px] bg-gray-100 rounded-2xl overflow-hidden">
                    <Image
                      src={heroImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </figure>
              )}

              {/* Article Body — render HTML & Inline Images */}
              {renderContentWithImages(article.content, additionalImages)}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-10">
                  <span className="text-gray-500 font-medium text-sm mr-2">Tag :</span>
                  {article.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Share Options */}
              <div className="flex items-center space-x-4 mb-10">
                <span className="text-gray-500 font-medium text-sm">Bagikan Artikel ini :</span>
                <div className="flex space-x-3">
                  {/* Twitter / X */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(article.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bagikan ke Twitter"
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bagikan ke Facebook"
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:text-white transition-colors text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Bagikan ke WhatsApp"
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-500 hover:text-white transition-colors text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </div>
              </div>

              <hr className="border-gray-200 mb-10" />

              {/* COMMENTS SECTION */}
              <section>
                <h3 className="font-bold text-xl text-gray-900 mb-8">
                  Komentar ({totalComments})
                </h3>

                {/* Reply indicator */}
                {replyTo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mb-4 flex items-center justify-between text-sm">
                    <span className="text-blue-700">
                      Membalas <strong>{replyTo.name}</strong>
                    </span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-blue-500 hover:text-blue-700 font-medium ml-4"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {/* Input Comment */}
                {isAuthenticated ? (
                  <div className="flex space-x-4 mb-10">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
                      {user?.name?.charAt(0) ?? "?"}
                    </div>
                    <div className="relative flex-grow">
                      <input
                        id="comment-input"
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitComment()}
                        placeholder="Tuliskan Komentar Kamu..."
                        maxLength={1000}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-5 pr-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button
                        id="submit-comment-btn"
                        onClick={handleSubmitComment}
                        disabled={submittingComment}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                      >
                        {submittingComment ? "..." : "Kirim"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 mb-10 text-sm text-gray-600 text-center">
                    <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                      Login
                    </Link>{" "}
                    untuk berkomentar.
                  </div>
                )}

                {/* Character counter */}
                {commentText.length > 0 && (
                  <p className="text-xs text-gray-400 mb-4 text-right -mt-8">
                    {commentText.length}/1000
                  </p>
                )}

                {/* Comments List */}
                {loadingComments ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse flex space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-grow space-y-2 pt-1">
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">
                    Belum ada komentar. Jadilah yang pertama!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <CommentItem
                          comment={comment}
                          depth={0}
                          onReply={(id, name) => setReplyTo({ id, name })}
                          onDelete={handleDeleteComment}
                          canDelete={canDelete}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </article>

            {/* RIGHT COLUMN: SIDEBAR */}
            <aside className="lg:col-span-1">
              <div className="border border-gray-200 rounded-3xl p-6 bg-white sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-wide">
                  TERPOPULER MINGGU INI
                </h2>
                <PopularSidebar currentSlug={slug} />
              </div>
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sidebar: Artikel Populer ──────────────────────────────────────────────

function PopularSidebar({ currentSlug }: { currentSlug: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles({ status: "published", limit: 5 })
      .then((res) => {
        const filtered = res.data.data.articles.filter((a) => a.slug !== currentSlug);
        setArticles(filtered.slice(0, 4));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [currentSlug]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex space-x-3">
            <div className="w-24 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
            <div className="flex-grow space-y-2 pt-1">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return <p className="text-gray-400 text-sm">Tidak ada artikel lain.</p>;
  }

  return (
    <div className="space-y-6">
      {articles.map((news, index) => (
        <div key={news.id}>
          <Link href={`/${news.slug}`} className="flex space-x-4 group">
            <div className="relative w-24 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
              {news.featured_image_url ? (
                <Image
                  src={news.featured_image_url}
                  alt={news.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                {news.title}
              </h3>
              <span className="text-xs font-medium text-gray-500">
                {formatDate(news.published_at ?? news.created_at)}
              </span>
            </div>
          </Link>
          {index !== articles.length - 1 && <hr className="border-gray-100 mt-6" />}
        </div>
      ))}
    </div>
  );
}