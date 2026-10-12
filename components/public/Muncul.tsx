"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

// Pembungkus animasi kartu muncul dari bawah (keyframe CSS `pg-kartu`, ada di
// ANIMASI_CSS milik ProjectGallery). Memakai keyframe, bukan transisi, supaya:
// - blur ke tajam terinterpolasi halus,
// - animasi selalu jalan saat komponen dipasang, termasuk navigasi klien
//   lewat tombol panah (tidak bergantung pada frame pertama yang sempat dicat).
//
// Dua jalur:
// 1. Kartu baris pertama (urutan < 4): kelas pg-k-c0..c3 dari HTML server.
//    Animasi dimulai oleh CSS sendiri (media query lebar layar menentukan
//    kartu mana yang sudah terlihat), tanpa menunggu hidrasi React.
//    Jeda = awalMulai + kolom * awalJeda lewat variabel --d.
// 2. Kartu lain (atau kartu baris pertama yang tidak dijalankan CSS di lebar
//    layar itu): IntersectionObserver menambah kelas pg-k-tampil saat pertama
//    kali terlihat, hanya sekali.
// prefers-reduced-motion: langsung tampil (diatur CSS).
export default function Muncul({
  children,
  urutan,
  kolom = 4,
  awalMulai = 0.3,
  awalJeda = 0.1,
  scrollJeda = 0.1,
}: {
  children: ReactNode;
  urutan: number;
  kolom?: number;
  awalMulai?: number;
  awalJeda?: number;
  scrollJeda?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mod = urutan % kolom;
  const barisPertama = urutan < kolom;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Kalau CSS sudah menjalankan animasi (kartu baris pertama yang terlihat
    // di lebar layar ini), tidak perlu apa-apa lagi.
    const sudahJalan = () => getComputedStyle(el).animationName !== "none";
    if (sudahJalan()) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tampilkan = (jeda: number) => {
      el.style.setProperty("--d", `${jeda.toFixed(2)}s`);
      el.classList.add("pg-k-tampil");
    };

    if (typeof IntersectionObserver === "undefined") {
      tampilkan(0);
      return;
    }

    let pertama = true;
    const io = new IntersectionObserver(
      (entries) => {
        const awal = pertama;
        pertama = false;
        if (!entries.some((e) => e.isIntersecting)) return;
        // Panggilan pertama = kondisi saat halaman dibuka.
        tampilkan(awal ? awalMulai + mod * awalJeda : mod * scrollJeda);
        io.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mod, awalMulai, awalJeda, scrollJeda]);

  const style = barisPertama
    ? ({ "--d": `${(awalMulai + mod * awalJeda).toFixed(2)}s` } as CSSProperties)
    : undefined;

  return (
    <div
      ref={ref}
      style={style}
      className={`pg-k${barisPertama ? ` pg-k-c${urutan}` : ""}`}
    >
      {children}
    </div>
  );
}