// Layout ini sengaja KOSONG agar halaman preview tidak dibungkus
// oleh CMS layout (sidebar + topbar). Halaman preview tampil full-screen
// seperti halaman publik sesungguhnya.
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
