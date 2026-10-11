"use client";

import Link from "next/link";
import { useRef } from "react";

const MENU = [
  { key: "home", label: "Home", href: "/" },
  { key: "about", label: "About", href: "/about" },
  { key: "project", label: "Project", href: "/project" },
  { key: "tools", label: "Tools", href: "/tools" },
  { key: "contact", label: "Contact", href: "/contact" },
] as const;

export type NavKey = (typeof MENU)[number]["key"];

export function SiteNav({ active }: { active: NavKey }) {
  const itemRefs = useRef<Partial<Record<NavKey, HTMLLIElement | null>>>({});
  const pillRef = useRef<HTMLLIElement>(null);

  function sorot(key: NavKey) {
    const el = itemRefs.current[key];
    const pill = pillRef.current;
    if (!el || !pill) return;

    // Menu aktif sudah punya pill hitam sendiri.
    if (key === active) {
      redupkan();
      return;
    }

    // Kalau pill sedang tersembunyi, pindahkan langsung (tanpa meluncur
    // dari posisi lama), baru dimunculkan. Kalau sedang terlihat, meluncur.
    if (pill.dataset.on !== "1") {
      pill.style.transition = "none";
    }
    pill.style.left = `${el.offsetLeft}px`;
    pill.style.top = `${el.offsetTop}px`;
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.height = `${el.offsetHeight}px`;
    void pill.offsetWidth; // paksa reflow supaya perpindahan di atas tidak beranimasi
    pill.style.transition = "";
    pill.style.opacity = "0.55";
    pill.dataset.on = "1";
  }

  function redupkan() {
    const pill = pillRef.current;
    if (!pill) return;
    pill.style.opacity = "0";
    pill.dataset.on = "0";
  }

  return (
    <>
      {/* Pengganti di alur halaman: menahan tinggi navbar supaya letak konten
          tidak berubah. Tinggi harus sama dengan <ul> di bawah
          (tinggi tautan + padding p-1.5 atas-bawah). */}
      <div aria-hidden="true" className="h-[52px] shrink-0 sm:h-[49px]" />

      {/* Navbar sendiri dipasang absolut dari atas dokumen, sehingga posisinya
          sama di semua halaman, tidak ikut bergeser oleh justify-center. */}
      <nav
        aria-label="Navigasi utama"
        className="absolute inset-x-0 top-5 z-30 flex justify-center px-4 sm:px-10"
      >
        <ul
          onMouseLeave={redupkan}
          className="relative flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-surface p-1.5"
        >
          {/* Pill hover (dekoratif): meluncur mengikuti menu yang disorot. */}
          <li
            ref={pillRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-0 w-0 rounded-full bg-border opacity-0 transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [@media(hover:none)]:hidden"
          />

          {MENU.map((item) => {
            const aktif = item.key === active;
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
                  aria-current={aktif ? "page" : undefined}
                  onFocus={() => sorot(item.key)}
                  onBlur={redupkan}
                  className={`grid h-10 place-items-center whitespace-nowrap rounded-full px-3.5 text-[13px] no-underline transition-colors duration-300 motion-reduce:transition-none sm:h-[37px] sm:px-[26px] sm:text-[14px] ${
                    aktif
                      ? "bg-foreground text-background"
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
    </>
  );
}