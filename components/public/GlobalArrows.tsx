"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { catatArah } from "./PageSlide";

// Rantai halaman: Home -> About -> Project -> Tools -> Contact -> Home.
// Path yang tidak ada di sini (admin, riwayat, detail project, /project/semua)
// tidak menampilkan panah.
const RANTAI: Record<string, { kiri: string; kanan: string }> = {
  "/": { kiri: "/contact", kanan: "/about" },
  "/about": { kiri: "/", kanan: "/project" },
  "/project": { kiri: "/about", kanan: "/tools" },
  "/tools": { kiri: "/project", kanan: "/contact" },
  "/contact": { kiri: "/tools", kanan: "/" },
};

function Panah({
  href,
  label,
  side,
}: {
  href: string;
  label: string;
  side: "left" | "right";
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      onClick={() => catatArah(side === "right" ? "kanan" : "kiri")}
      className={`fixed top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors hover:bg-surface lg:flex ${
        side === "left" ? "left-5" : "right-5"
      }`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        aria-hidden="true"
      >
        <path
          d={side === "left" ? "M15 4.5L7.5 12L15 19.5" : "M9 4.5L16.5 12L9 19.5"}
        />
      </svg>
    </Link>
  );
}

// Dipasang SEKALI di app/layout.tsx. Layout tidak dirender ulang saat pindah
// halaman, jadi elemen tombol tidak pernah hilang dan muncul lagi: hanya
// tujuan link yang berganti. Klik panah mencatat arah untuk PageSlide.
export default function GlobalArrows() {
  const pathname = usePathname();
  const rantai = RANTAI[pathname];
  if (!rantai) return null;

  return (
    <>
      <Panah href={rantai.kiri} label="Halaman sebelumnya" side="left" />
      <Panah href={rantai.kanan} label="Halaman berikutnya" side="right" />
    </>
  );
}