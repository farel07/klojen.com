"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Helper to check active status
    const isActive = (path: string) => pathname === path;

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
                        {[
                            { name: "Beranda", path: "/" },
                            { name: "Kuliner", path: "/kuliner" },
                            { name: "Wisata", path: "/wisata" },
                            { name: "Pendidikan", path: "/pendidikan" },
                            { name: "Hotel", path: "/hotel" },
                        ].map((link) => {
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

                        <Link
                            href="/login"
                            className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all duration-300"
                        >
                            Masuk/Daftar
                        </Link>
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
                            {[
                                { name: "Beranda", path: "/" },
                                { name: "Kuliner", path: "/kuliner" },
                                { name: "Wisata", path: "/wisata" },
                                { name: "Pendidikan", path: "/pendidikan" },
                                { name: "Hotel", path: "/hotel" },
                            ].map((link) => {
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

                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="bg-black text-white px-5 py-2 mt-2 rounded-full text-center text-sm font-medium hover:bg-neutral-800 transition-all duration-300"
                            >
                                Masuk/Daftar
                            </Link>
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