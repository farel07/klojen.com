"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section
            id="section-header"
            className="fixed top-0 left-0 w-full z-50 px-4 py-8"
        >
            {/* Navbar Container */}
            <div className="max-w-7xl mx-auto bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 flex justify-between items-center relative shadow-lg shadow-black/5">

                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer">
                    <img
                        src="/images/logo.png"
                        alt="Klojen Logo"
                        className="w-8 h-8 object-contain"
                    />

                    <span className="text-lg font-bold text-white tracking-tight">
                        Klojen
                    </span>
                </div>

                {/* Desktop Menu */}
                <nav className="hidden lg:flex items-center gap-8">

                    {/* Active Menu */}
                    <a
                        href="#"
                        className="bg-white text-black px-5 py-2 rounded-full font-semibold text-sm shadow-md transition-all duration-300 hover:scale-105"
                    >
                        Beranda
                    </a>

                    {/* Menu */}
                    <a
                        href="#"
                        className="text-white/80 font-medium text-sm hover:text-white transition-colors"
                    >
                        Kuliner
                    </a>

                    <a
                        href="#"
                        className="text-white/80 font-medium text-sm hover:text-white transition-colors"
                    >
                        Wisata
                    </a>

                    <a
                        href="#"
                        className="text-white/80 font-medium text-sm hover:text-white transition-colors"
                    >
                        Pendidikan
                    </a>

                    <a
                        href="#"
                        className="text-white/80 font-medium text-sm hover:text-white transition-colors"
                    >
                        Hotel
                    </a>

                    {/* Button */}
                    <a
                        href="#"
                        className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white hover:text-black transition-all duration-300"
                    >
                        Masuk/Daftar
                    </a>
                </nav>

                {/* Mobile Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="absolute top-[75px] left-0 w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 flex flex-col gap-5 lg:hidden">

                        <a
                            href="#"
                            className="text-white font-medium hover:text-gray-300 transition-colors"
                        >
                            Beranda
                        </a>

                        <a
                            href="#"
                            className="text-white font-medium hover:text-gray-300 transition-colors"
                        >
                            Kuliner
                        </a>

                        <a
                            href="#"
                            className="text-white font-medium hover:text-gray-300 transition-colors"
                        >
                            Wisata
                        </a>

                        <a
                            href="#"
                            className="text-white font-medium hover:text-gray-300 transition-colors"
                        >
                            Pendidikan
                        </a>

                        <a
                            href="#"
                            className="text-white font-medium hover:text-gray-300 transition-colors"
                        >
                            Hotel
                        </a>

                        <a
                            href="#"
                            className="bg-white text-black px-5 py-2 rounded-full text-center font-medium hover:bg-black hover:text-white transition-all duration-300"
                        >
                            Masuk/Daftar
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Navbar;