"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

// Swipe: jarak minimal (px) dan rasio horizontal terhadap vertikal.
const SWIPE_JARAK = 60;
const SWIPE_RASIO = 1.5;

// True kalau jari mulai dari elemen yang punya urusan sendiri dengan gerakan
// horizontal (input, atau area yang bisa di-scroll ke samping).
function sentuhanDiabaikan(target: EventTarget | null) {
  let el = target instanceof Element ? target : null;
  while (el && el !== document.body) {
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el instanceof HTMLElement && el.isContentEditable) return true;
    const ox = getComputedStyle(el).overflowX;
    if ((ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

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
// Di layar sentuh, geser kiri/kanan juga memindahkan halaman mengikuti rantai.
export default function GlobalArrows() {
  const pathname = usePathname();
  const router = useRouter();
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

  // Swipe kiri/kanan untuk pindah halaman (layar sentuh).
  useEffect(() => {
    const tujuan = RANTAI[pathname];
    if (!tujuan) return;

    let awal: { x: number; y: number } | null = null;

    const mulai = (e: TouchEvent) => {
      if (e.touches.length !== 1 || sentuhanDiabaikan(e.target)) {
        awal = null;
        return;
      }
      awal = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const selesai = (e: TouchEvent) => {
      if (!awal) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - awal.x;
      const dy = t.clientY - awal.y;
      awal = null;

      if (Math.abs(dx) < SWIPE_JARAK) return;
      if (Math.abs(dx) < Math.abs(dy) * SWIPE_RASIO) return;

      // Jari bergerak ke kiri = halaman berikutnya; ke kanan = sebelumnya.
      if (dx < 0) {
        catatArah("kanan");
        router.push(tujuan.kanan);
      } else {
        catatArah("kiri");
        router.push(tujuan.kiri);
      }
    };

    const batal = () => {
      awal = null;
    };

    window.addEventListener("touchstart", mulai, { passive: true });
    window.addEventListener("touchend", selesai, { passive: true });
    window.addEventListener("touchcancel", batal, { passive: true });
    return () => {
      window.removeEventListener("touchstart", mulai);
      window.removeEventListener("touchend", selesai);
      window.removeEventListener("touchcancel", batal);
    };
  }, [pathname, router]);

  if (!rantai) return null;

  const sembunyi = panjang && turun;

  return (
    <>
      <Panah href={rantai.kiri} label="Halaman sebelumnya" side="left" sembunyi={sembunyi} />
      <Panah href={rantai.kanan} label="Halaman berikutnya" side="right" sembunyi={sembunyi} />
    </>
  );
}