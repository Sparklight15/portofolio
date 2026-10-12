"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MENU, type NavKey } from "./SiteNav";

// Navbar global: dirender SEKALI di app/layout.tsx, jadi tidak ikut diganti
// saat pindah halaman. Pill hitam (menu aktif) adalah satu elemen yang
// meluncur ke menu yang dipilih. Perpindahan memakai transform (translateX +
// scaleX, teknik FLIP) supaya jalan di compositor dan tetap halus walau
// halaman baru sedang dirender. Pill mulai bergerak saat menu diklik, tidak
// menunggu halaman selesai dimuat.

const PATH_KE_KEY: Record<string, NavKey> = {
  "/": "home",
  "/about": "about",
  "/project": "project",
  "/tools": "tools",
  "/contact": "contact",
};

const DURASI = 550;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function GlobalNav() {
  const pathname = usePathname();
  const key = PATH_KE_KEY[pathname.replace(/\/$/, "") || "/"];
  // Di luar lima halaman utama (admin, detail project, riwayat) tidak tampil.
  // Bar dipasang ulang saat kembali, jadi pill tidak meluncur dari posisi lama.
  if (!key) return null;
  return <Bar active={key} />;
}

function Bar({ active }: { active: NavKey }) {
  const ulRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Partial<Record<NavKey, HTMLLIElement | null>>>({});
  const hoverRef = useRef<HTMLLIElement>(null);
  const aktifRef = useRef<HTMLLIElement>(null);
  const pertama = useRef(true);

  // Menu yang sedang dipilih (langsung berubah saat diklik, sebelum halaman
  // selesai berpindah). Disinkronkan ke `active` kalau route berubah.
  const [pilih, setPilih] = useState<NavKey>(active);
  const pilihRef = useRef<NavKey>(active);

  useEffect(() => {
    pilihRef.current = active;
    setPilih(active);
  }, [active]);

  // Taruh pill hitam di menu k. animasi=false: langsung di tempat.
  function taruh(k: NavKey, animasi: boolean) {
    const ul = ulRef.current;
    const p = aktifRef.current;
    const el = itemRefs.current[k];
    if (!ul || !p || !el) return;

    const x = el.offsetLeft;
    const y = el.offsetTop;
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    // Posisi visual saat ini (kalau sedang meluncur, lanjut dari situ).
    let dari: { x: number; w: number } | null = null;
    if (animasi && ul.dataset.siap === "1" && p.offsetWidth > 0) {
      const m = new DOMMatrix(getComputedStyle(p).transform);
      dari = { x: m.m41, w: p.offsetWidth * m.a };
    }

    p.getAnimations().forEach((a) => a.cancel());
    p.style.width = `${w}px`;
    p.style.height = `${h}px`;
    p.style.top = `${y}px`;
    p.style.transform = `translateX(${x}px)`;
    p.style.opacity = "1";
    ul.dataset.siap = "1";

    if (dari && (Math.abs(dari.x - x) > 0.5 || Math.abs(dari.w - w) > 0.5)) {
      p.animate(
        [
          { transform: `translateX(${dari.x}px) scaleX(${dari.w / w})` },
          { transform: `translateX(${x}px) scaleX(1)` },
        ],
        { duration: DURASI, easing: EASING }
      );
    }
  }

  // Route berubah: kalau pill belum ada di sana (mis. tombol back), geser.
  // Pemasangan pertama: langsung di tempat.
  useLayoutEffect(() => {
    taruh(active, !pertama.current);
    pertama.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Ukuran navbar berubah (resize, font selesai dimuat): taruh ulang tanpa animasi.
  useLayoutEffect(() => {
    const ul = ulRef.current;
    if (!ul || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => taruh(pilihRef.current, false));
    ro.observe(ul);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Klik menu: pill langsung berangkat, tidak menunggu halaman baru.
  function pilihMenu(k: NavKey) {
    if (pilihRef.current === k) return;
    pilihRef.current = k;
    setPilih(k);
    redupkan();
    taruh(k, true);
  }

  function sorot(k: NavKey) {
    const el = itemRefs.current[k];
    const pill = hoverRef.current;
    if (!el || !pill) return;

    // Menu terpilih sudah punya pill hitam sendiri.
    if (k === pilihRef.current) {
      redupkan();
      return;
    }

    // Kalau pill hover sedang tersembunyi, pindahkan langsung, baru dimunculkan.
    if (pill.dataset.on !== "1") {
      pill.style.transition = "none";
    }
    pill.style.left = `${el.offsetLeft}px`;
    pill.style.top = `${el.offsetTop}px`;
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.height = `${el.offsetHeight}px`;
    void pill.offsetWidth;
    pill.style.transition = "";
    pill.style.opacity = "0.55";
    pill.dataset.on = "1";
  }

  function redupkan() {
    const pill = hoverRef.current;
    if (!pill) return;
    pill.style.opacity = "0";
    pill.dataset.on = "0";
  }

  return (
    // Mengambang: `fixed` dari tepi atas layar, jadi tetap terlihat saat halaman
    // (About, Project) di-scroll. Di posisi paling atas letaknya sama persis
    // dengan versi `absolute` sebelumnya (top-5), jadi posisinya identik di
    // semua halaman. Tinggi tetap ditahan oleh spacer di SiteNav.
    // Pembungkus `pointer-events-none` supaya area kosong di kiri-kanan pill
    // tidak menghalangi klik ke konten di bawahnya; hanya pill yang menerima klik.
    <nav
      aria-label="Navigasi utama"
      className="pointer-events-none fixed inset-x-0 top-5 z-30 flex justify-center px-4 sm:px-10"
    >
      <ul
        ref={ulRef}
        data-siap="0"
        onMouseLeave={redupkan}
        className="group/nav pointer-events-auto relative flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-surface/95 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
      >
        {/* Pill hover (abu-abu): meluncur mengikuti menu yang disorot. */}
        <li
          ref={hoverRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-0 w-0 rounded-full bg-border opacity-0 transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [@media(hover:none)]:hidden"
        />

        {/* Pill terpilih (hitam): meluncur lewat transform ke menu yang dipilih. */}
        <li
          ref={aktifRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-0 w-0 origin-left rounded-full bg-foreground opacity-0 will-change-transform"
        />

        {MENU.map((item) => {
          const aktif = item.key === pilih;
          return (
            <li
              key={item.key}
              ref={(el) => {
                itemRefs.current[item.key] = el;
              }}
              onMouseEnter={() => sorot(item.key)}
              className="relative z-10"
            >
              <Link
                href={item.href}
                aria-current={item.key === active ? "page" : undefined}
                onClick={() => pilihMenu(item.key)}
                onFocus={() => sorot(item.key)}
                onBlur={redupkan}
                className={`grid h-10 place-items-center whitespace-nowrap rounded-full px-3.5 text-[13px] no-underline transition-colors duration-500 motion-reduce:transition-none sm:h-[37px] sm:px-[26px] sm:text-[14px] ${
                  aktif
                    ? "text-foreground group-data-[siap=1]/nav:text-background"
                    : "text-muted hover:text-foreground focus-visible:text-foreground"
                }`}
              >
                {/* Salinan tak terlihat berbobot tebal: menyisakan lebar versi
                    tebal supaya lebar bar sama di semua halaman. */}
                <span
                  aria-hidden="true"
                  className="invisible col-start-1 row-start-1 font-semibold"
                >
                  {item.label}
                </span>
                <span
                  className={`col-start-1 row-start-1 ${
                    aktif ? "font-semibold" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}