// Navbar sebenarnya ada di GlobalNav.tsx (dipasang sekali di app/layout.tsx).
// SiteNav di tiap halaman tinggal spacer yang menahan tinggi navbar supaya
// letak konten tidak berubah. Prop `active` dipertahankan agar pemanggil
// lama tidak perlu diubah; nilainya tidak dipakai lagi.

export const MENU = [
  { key: "home", label: "Home", href: "/" },
  { key: "about", label: "About", href: "/about" },
  { key: "project", label: "Project", href: "/project" },
  { key: "tools", label: "Tools", href: "/tools" },
  { key: "contact", label: "Contact", href: "/contact" },
] as const;

export type NavKey = (typeof MENU)[number]["key"];

export function SiteNav({ active }: { active: NavKey }) {
  void active;
  // Tinggi harus sama dengan <ul> di GlobalNav (tinggi tautan + padding p-1.5).
  return <div aria-hidden="true" className="h-[52px] shrink-0 sm:h-[49px]" />;
}