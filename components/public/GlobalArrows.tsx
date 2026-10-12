"use client";

import { useEffect, useState } from "react";
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

// Halaman yang panahnya hanya tampil di section paling atas. Panah memudar
// kalau sudah scroll melewati 40% tinggi layar. Nilai ini harus sama dengan
// ScrollUpButton supaya salah satu selalu tampil. Halaman di sini harus
// memasang <ScrollUpButton /> (About dan Project).
const HALAMAN_PANJANG = new Set(["/about", "/project"]);
const AMBANG = 0.4;

function Panah({
  href,
  label,
  side,
  sembunyi,
}: {
  href: string;
  label: string;
  side: "left" | "right";
  sembunyi: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-hidden={sembunyi ? true : undefined}
      tabIndex={sembunyi ? -1 : undefined}
      onClick={() => catatArah(side === "right" ? "kanan" : "kiri")}
      className={`fixed top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-[opacity,filter,background-color] duration-500 hover:bg-surface lg:flex ${
        side === "left" ? "left-5" : "right-5"
      } ${sembunyi ? "pointer-events-none opacity-0 blur-[6px]" : "opacity-100"}`}
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
// Di halaman panjang (About, Project), panah memudar saat scroll ke bawah. Posisinya
// tidak berubah, hanya opacity dan blur.
export default function GlobalArrows() {
  const pathname = usePathname();
  const rantai = RANTAI[pathname];
  const panjang = HALAMAN_PANJANG.has(pathname);
  const [turun, setTurun] = useState(false);

  useEffect(() => {
    if (!panjang) return;
    const cek = () => setTurun(window.scrollY > window.innerHeight * AMBANG);
    cek();
    window.addEventListener("scroll", cek, { passive: true });
    window.addEventListener("resize", cek);
    return () => {
      window.removeEventListener("scroll", cek);
      window.removeEventListener("resize", cek);
    };
  }, [panjang, pathname]);

  if (!rantai) return null;

  const sembunyi = panjang && turun;

  return (
    <>
      <Panah href={rantai.kiri} label="Halaman sebelumnya" side="left" sembunyi={sembunyi} />
      <Panah href={rantai.kanan} label="Halaman berikutnya" side="right" sembunyi={sembunyi} />
    </>
  );
}