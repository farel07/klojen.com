import Link from "next/link";
import Image from "next/image";
import {
  FaTiktok,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-[#06152B] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-14 gap-x-10">
          
          {/* LEFT SECTION */}
          <div className="lg:col-span-4 flex flex-col">
            
            {/* LOGO */}
            <div className="flex items-center gap-3 mb-10">
              <Image
                src="/images/logo.png"
                alt="Klojen Logo"
                width={36}
                height={36}
                className="object-contain"
              />

              <span className="text-white text-[20px] font-semibold tracking-wide">
                Klojen
              </span>
            </div>

            {/* SOCIAL */}
            <div className="mb-16">
              <h3 className="text-[#94A3B8] text-[14px] font-semibold mb-5">
                Connect With Us
              </h3>

              <div className="flex items-center gap-5 text-[24px]">
                <Link
                  href="#"
                  className="text-white hover:text-[#00D084] transition"
                >
                  <FaTiktok />
                </Link>

                <Link
                  href="#"
                  className="text-white hover:text-[#00D084] transition"
                >
                  <FaInstagram />
                </Link>

                <Link
                  href="#"
                  className="text-white hover:text-[#00D084] transition"
                >
                  <FaFacebookF />
                </Link>

                <Link
                  href="#"
                  className="text-white hover:text-[#00D084] transition"
                >
                  <FaTwitter />
                </Link>
              </div>
            </div>

            {/* COPYRIGHT */}
            <div className="mt-auto">
              <p className="text-[#94A3B8] text-[14px] font-medium mb-1">
                Media Kolaborasi Indonesia
              </p>

              <p className="text-[#94A3B8] text-[13px]">
                © 2026 PT. Ketik Media Siber All Rights Reserved.
              </p>
            </div>
          </div>

          {/* KATEGORI */}
          <div className="lg:col-span-2 lg:col-start-5">
            <h3 className="text-[#00D084] uppercase tracking-[0.18em] text-[13px] font-bold mb-8">
              Kategori
            </h3>

            <ul className="space-y-5">
              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Kuliner
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Wisata
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Pendidikan
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Hotel
                </Link>
              </li>
            </ul>
          </div>

          {/* INFORMASI */}
          <div className="lg:col-span-4">
            <h3 className="text-[#00D084] uppercase tracking-[0.18em] text-[13px] font-bold mb-8">
              Informasi
            </h3>

            <ul className="space-y-5">
              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Redaksi
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Tentang Kami
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Verifikasi Dewan Pers
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Pedoman Media Siber dan Kode Perilaku
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="lg:col-span-2">
            <div className="hidden lg:block h-[29px] mb-8" />

            <ul className="space-y-5">
              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Disclaimer
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Privacy & Policy
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Terms of Service
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-white text-[15px] font-semibold hover:text-[#00D084] transition"
                >
                  Karier
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}