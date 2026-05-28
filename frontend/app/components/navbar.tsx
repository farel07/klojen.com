"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { clearRefreshToken } from "@/lib/auth";
import { getCategories, CategoryWithChildren } from "@/lib/api/categories";

// ─── AuthButton ───────────────────────────────────────────────────────────────

interface AuthButtonProps {
    mobile?: boolean;
    onClose?: () => void;
}

function AuthButton({ mobile = false, onClose }: AuthButtonProps) {
    const { isAuthenticated, user, logout } = useAuthStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        clearRefreshToken();
        setDropdownOpen(false);
        onClose?.();
        router.push("/");
    };

    // ── Guest ──
    if (!isAuthenticated) {
        if (mobile) {
            return (
                <Link
                    href="/login"
                    onClick={onClose}
                    className="bg-black text-white px-5 py-2 mt-2 rounded-full text-center text-sm font-medium hover:bg-neutral-800 transition-all duration-300"
                >
                    Masuk/Daftar
                </Link>
            );
        }
        return (
            <Link
                href="/login"
                className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all duration-300"
            >
                Masuk/Daftar
            </Link>
        );
    }

    // ── Logged in — mobile ──
    if (mobile) {
        return (
            <div className="flex flex-col gap-1 mt-2 border-t border-black/10 pt-4">
                <div className="flex items-center gap-3 px-4 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
                        {user?.name?.charAt(0) ?? "?"}
                    </div>
                    <span className="text-sm font-semibold text-black">{user?.name}</span>
                </div>
                <Link href="/profil" onClick={onClose} className="text-black/80 font-medium hover:text-black transition-colors px-4 py-2 text-sm">
                    Lihat Profil
                </Link>
                <Link href="/bookmark" onClick={onClose} className="text-black/80 font-medium hover:text-black transition-colors px-4 py-2 text-sm">
                    Di Simpan
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-left text-red-500 font-medium hover:text-red-700 transition-colors px-4 py-2 text-sm"
                >
                    Keluar
                </button>
            </div>
        );
    }

    // ── Logged in — desktop ──
    return (
        <div className="relative">
            <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200"
            >
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.charAt(0) ?? "?"}
                </div>
                <span className="text-sm font-semibold text-black max-w-[100px] truncate">
                    Hi, {user?.name?.split(" ")[0]}
                </span>
                <svg
                    className={`w-3.5 h-3.5 text-black/50 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {dropdownOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 bg-white border border-black/10 rounded-2xl shadow-xl py-2 overflow-hidden">
                        <Link
                            href="/profil"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-black/80 hover:bg-black/5 transition-colors"
                        >
                            <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Lihat Profil
                        </Link>
                        <Link
                            href="/bookmark"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-black/80 hover:bg-black/5 transition-colors"
                        >
                            <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Di Simpan
                        </Link>
                        <hr className="my-1 border-black/5" />
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Keluar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const STATIC_LINKS = [{ name: "Beranda", path: "/" }];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
    const pathname = usePathname();

    // Fetch parent categories from API
    useEffect(() => {
        getCategories()
            .then((res) => {
                // Hanya ambil parent kategori (parent_id === null)
                const parents = res.data.data.filter(
                    (c) => c.parent_id === null
                );
                setCategories(parents);
            })
            .catch(() => {
                // Fallback ke kategori statis jika gagal
                setCategories([
                    { id: "1", name: "Kuliner",    slug: "kuliner",    parent_id: null, children: [] },
                    { id: "2", name: "Wisata",     slug: "wisata",     parent_id: null, children: [] },
                    { id: "3", name: "Pendidikan", slug: "pendidikan", parent_id: null, children: [] },
                    { id: "4", name: "Hotel",      slug: "hotel",      parent_id: null, children: [] },
                ]);
            });
    }, []);

    // Build nav links: Beranda + semua parent categories
    const navLinks = [
        ...STATIC_LINKS,
        ...categories.map((cat) => ({
            name: cat.name,
            path: `/kategori/${cat.slug}`,
        })),
    ];

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname === path || pathname.startsWith(path);
    };

    return (
        <>
            {/* Navbar */}
            <section
                id="section-header"
                className="fixed top-4 left-0 w-full z-50 px-3"
            >
                <div className="max-w-7xl mx-auto bg-white/0 backdrop-blur-xl backdrop-saturate-150 border border-black/10 rounded-2xl px-5 py-3 flex justify-between items-center relative shadow-xl">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 cursor-pointer">
                        <img
                            src="/images/logo.png"
                            alt="Klojen Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-lg font-bold text-black tracking-tight">
                            Klojen
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    className={
                                        active
                                            ? "bg-white text-black px-5 py-2 rounded-full font-semibold text-sm shadow-md transition-all duration-300 hover:scale-105 border border-black/5"
                                            : "text-black/70 font-medium text-sm hover:text-black transition-colors"
                                    }
                                >
                                    {link.name}
                                </Link>
                            );
                        })}

                        {/* Auth area — desktop */}
                        <AuthButton />
                    </nav>

                    {/* Mobile Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden text-black p-2 rounded-lg hover:bg-black/5 transition-colors"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <div className="absolute top-[75px] left-0 w-full bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl shadow-xl p-6 flex flex-col gap-3 lg:hidden">
                            {navLinks.map((link) => {
                                const active = isActive(link.path);
                                return (
                                    <Link
                                        key={link.path}
                                        href={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={
                                            active
                                                ? "bg-black/5 text-black font-semibold px-4 py-2 rounded-xl text-sm"
                                                : "text-black/80 font-medium hover:text-black transition-colors px-4 py-2 text-sm"
                                        }
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Auth area — mobile */}
                            <AuthButton mobile onClose={() => setIsOpen(false)} />
                        </div>
                    )}
                </div>
            </section>

            {/* Spacer supaya page turun */}
            <div className="h-20" />
        </>
    );
};

export default Navbar;