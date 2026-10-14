"use client";

import { useRef } from "react";
import type { MouseEvent, PointerEvent, ReactNode } from "react";

// Penutup halaman detail: "tarik ke atas untuk kembali ke project".
// Pegangan (ikon panah + garis) bisa ditarik ke atas lewat jari. Seluruh halaman
// (elemen dengan atribut data-halaman-detail) ikut terangkat mengikuti jari.
// Kalau ditarik cukup jauh (atau dilempar cepat), halaman terangkat keluar layar
// lalu pindah ke href. Kalau kurang jauh, halaman turun kembali ke tempatnya.
// Ketuk/klik biasa tetap berfungsi: halaman terangkat otomatis lalu pindah.
// Pindah halaman pakai navigasi penuh (location.assign), sama seperti <a> biasa,
// supaya iframe video ikut dibuang.

const JARAK_LEPAS = 100; // px tarikan minimum
const JARAK_CEPAT = 40; // px tarikan minimum kalau gerakannya cepat
const KECEPATAN_CEPAT = 0.5; // px per ms
const DURASI_TERBANG = 500; // ms

export default function TarikKembali({
  href,
  ikon,
  children,
  className,
}: {
  href: string;
  ikon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const jangkar = useRef<HTMLAnchorElement>(null);
  const awal = useRef<{ y: number; t: number } | null>(null);
  const jarak = useRef(0);
  const sudahGeser = useRef(false);
  const selesai = useRef(false);

  const halaman = () =>
    jangkar.current?.closest<HTMLElement>("[data-halaman-detail]") ?? null;

  const kurangiGerak = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function angkatLaluPindah() {
    if (selesai.current) return;
    selesai.current = true;
    const el = halaman();
    if (!el || kurangiGerak()) {
      window.location.assign(href);
      return;
    }
    el.style.willChange = "transform, opacity";
    el.style.transition = `transform ${DURASI_TERBANG}ms cubic-bezier(.4,0,.2,1), opacity ${DURASI_TERBANG}ms ease-in`;
    el.style.transform = `translate3d(0,${-window.innerHeight}px,0)`;
    el.style.opacity = "0";
    window.setTimeout(() => window.location.assign(href), DURASI_TERBANG - 20);
  }

  function turunKembali() {
    const el = halaman();
    if (!el) return;
    el.style.transition = "transform 350ms cubic-bezier(.22,1,.36,1)";
    el.style.transform = "translate3d(0,0,0)";
    window.setTimeout(() => {
      el.style.transition = "";
      el.style.transform = "";
      el.style.willChange = "";
    }, 360);
  }

  function onDown(e: PointerEvent<HTMLDivElement>) {
    if (selesai.current) return;
    awal.current = { y: e.clientY, t: e.timeStamp };
    jarak.current = 0;
    sudahGeser.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    const el = halaman();
    if (el) {
      el.style.transition = "none";
      el.style.willChange = "transform";
    }
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!awal.current || selesai.current) return;
    const dy = Math.min(0, e.clientY - awal.current.y); // hanya ke atas
    jarak.current = dy;
    if (Math.abs(dy) > 8) sudahGeser.current = true;
    const el = halaman();
    if (el) el.style.transform = `translate3d(0,${dy}px,0)`;
  }

  function onUp(e: PointerEvent<HTMLDivElement>) {
    if (!awal.current || selesai.current) return;
    const dy = jarak.current;
    const dt = Math.max(1, e.timeStamp - awal.current.t);
    const cepat = Math.abs(dy) / dt > KECEPATAN_CEPAT;
    awal.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (dy < -JARAK_LEPAS || (dy < -JARAK_CEPAT && cepat)) {
      angkatLaluPindah();
    } else if (sudahGeser.current) {
      turunKembali();
    } else {
      // Ketukan biasa tanpa geser: biarkan onClick yang menangani.
      const el = halaman();
      if (el) {
        el.style.transition = "";
        el.style.willChange = "";
      }
    }
  }

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    // Buka di tab baru (ctrl/cmd/shift/klik tengah): biarkan perilaku bawaan.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    // Habis menarik: jangan dihitung sebagai ketukan.
    if (sudahGeser.current) {
      sudahGeser.current = false;
      return;
    }
    angkatLaluPindah();
  }

  return (
    <a ref={jangkar} href={href} onClick={onClick} className={className}>
      {children}
      {/* Pegangan tarik: area sentuh dibuat lebar supaya mudah dipegang jempol.
          touch-action none agar gerakan ke atas tidak dibaca sebagai scroll. */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="-mb-2 flex cursor-grab select-none flex-col items-center gap-3 px-16 pb-3 pt-2 active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        {ikon}
        <span className="h-1.5 w-16 rounded-full bg-border" />
      </div>
    </a>
  );
}