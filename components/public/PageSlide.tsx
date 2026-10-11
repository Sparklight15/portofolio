"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export type ArahGeser = "kanan" | "kiri";

// Catatan arah dari panah yang baru diklik. Hangus setelah 3 detik supaya
// tidak terbawa ke kunjungan berikutnya.
let catatan: { arah: ArahGeser; waktu: number } | null = null;

export function catatArah(arah: ArahGeser) {
  catatan = { arah, waktu: Date.now() };
}

function ambilArah(): ArahGeser | null {
  const c = catatan;
  catatan = null;
  if (!c) return null;
  return Date.now() - c.waktu < 3000 ? c.arah : null;
}

// Animasi masuk per elemen. Elemen halaman memberi kelas gs-* (lihat
// AboutSection). Animasi hanya aktif kalau pembungkus punya atribut
// data-arah (diisi saat halaman dibuka lewat panah). --dx = +1 kalau panah
// kanan (datang dari kanan), -1 kalau panah kiri. --gd = jeda mulai tiap elemen.
// Blur sengaja kecil (6-10px) dan hanya di elemen kecil supaya ringan.
const CSS = `
@keyframes gs-foto{
  0%{opacity:0;transform:translate3d(calc(var(--dx) * 90px),0,0) scale(.96);filter:blur(10px)}
  100%{opacity:1;transform:translate3d(0,0,0) scale(1);filter:blur(0)}
}
@keyframes gs-label{
  0%{opacity:0;transform:translate3d(calc(var(--dx) * 40px),0,0);filter:blur(6px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes gs-halo{
  0%{opacity:0;transform:translate3d(0,-30%,0);filter:blur(10px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes gs-judul{
  0%{opacity:0;transform:translate3d(calc(var(--dx) * 60px),0,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes gs-teks{
  0%{opacity:0;transform:translate3d(0,24px,0);filter:blur(6px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes gs-tombol{
  0%{opacity:0;transform:scale(.8);filter:blur(6px)}
  100%{opacity:1;transform:scale(1);filter:blur(0)}
}
@keyframes gs-blok{
  0%{opacity:0;transform:translate3d(calc(var(--dx) * -60px),0,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
[data-arah] .gs-foto{animation:gs-foto 1.3s cubic-bezier(.22,1,.36,1) var(--gd,0s) both}
[data-arah] .gs-label{animation:gs-label 1.1s cubic-bezier(.22,1,.36,1) var(--gd,0s) both}
[data-arah] .gs-halo{animation:gs-halo 1.2s cubic-bezier(.22,1,.36,1) var(--gd,0s) both}
[data-arah] .gs-judul{animation:gs-judul 1.2s cubic-bezier(.22,1,.36,1) var(--gd,0s) both}
[data-arah] .gs-teks{animation:gs-teks 1.1s cubic-bezier(.22,1,.36,1) var(--gd,0s) both}
[data-arah] .gs-tombol{animation:gs-tombol .9s cubic-bezier(.22,1,.36,1) var(--gd,0s) both}
[data-arah] .gs-blok{animation:gs-blok 1.2s cubic-bezier(.22,1,.36,1) var(--gd,0s) both}
@media (prefers-reduced-motion:reduce){
  [data-arah] .gs-foto,[data-arah] .gs-label,[data-arah] .gs-halo,[data-arah] .gs-judul,[data-arah] .gs-teks,[data-arah] .gs-tombol,[data-arah] .gs-blok{animation:none}
}
`;

// Membungkus isi halaman (di bawah navbar dan garis separator). Tidak
// menganimasikan dirinya sendiri: hanya menyalakan animasi elemen di
// dalamnya. Atribut dilepas lalu dipasang lagi (dengan reflow) supaya
// animasi mengulang tiap kunjungan, termasuk halaman yang disimpan cache.
export function PageSlide({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const arah = ambilArah();
    el.removeAttribute("data-arah");
    if (!arah) return;
    el.style.setProperty("--dx", arah === "kanan" ? "1" : "-1");
    void el.offsetWidth;
    el.setAttribute("data-arah", arah);
  }, [pathname]);

  return (
    <>
      <style>{CSS}</style>
      <div ref={ref}>{children}</div>
    </>
  );
}