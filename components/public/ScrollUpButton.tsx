"use client";

import { useEffect, useState } from "react";

// Tombol "kembali ke atas": muncul setelah scroll melewati 40% tinggi layar
// (ambang sama dengan panah halaman di GlobalArrows, yang saat itu memudar).
const AMBANG = 0.4;

export default function ScrollUpButton() {
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const cek = () => setTampil(window.scrollY > window.innerHeight * AMBANG);
    cek();
    window.addEventListener("scroll", cek, { passive: true });
    window.addEventListener("resize", cek);
    return () => {
      window.removeEventListener("scroll", cek);
      window.removeEventListener("resize", cek);
    };
  }, []);

  function keAtas() {
    const kurangiGerak = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: kurangiGerak ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={keAtas}
      aria-label="Kembali ke atas"
      aria-hidden={tampil ? undefined : true}
      tabIndex={tampil ? 0 : -1}
      className={`fixed bottom-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-[opacity,filter,background-color] duration-500 hover:bg-surface ${
        tampil ? "opacity-100" : "pointer-events-none opacity-0 blur-[6px]"
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
        <path d="M4.5 15L12 7.5L19.5 15" />
      </svg>
    </button>
  );
}