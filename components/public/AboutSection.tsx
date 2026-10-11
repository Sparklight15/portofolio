import type { CSSProperties } from "react";
import Link from "next/link";
import { ABOUT_DEFAULT } from "../../lib/about-defaults";
import type { AboutEntri } from "../../lib/profile";
import { PageArrow } from "./PageChrome";

const STAR =
  "M0 -1C0.12 -0.3 0.3 -0.12 1 0C0.3 0.12 0.12 0.3 0 1C-0.12 0.3 -0.3 0.12 -1 0C-0.3 -0.12 -0.12 -0.3 0 -1Z";

const FOTO_BAWAAN = "/images/about-evi.jpg";

// Maksimal entri yang tampil di About per blok (sama dengan batas di admin).
const TAMPIL_MAX = 1;

// Konten About yang bisa diatur admin.
// null/undefined = pakai bawaan. Untuk experience/education, [] = blok disembunyikan.
export type AboutKonten = {
  cvUrl?: string | null;
  photoUrl?: string | null;
  name?: string | null;
  description?: string | null;
  experience?: AboutEntri[] | null;
  education?: AboutEntri[] | null;
};

// Satuan --u = 1px pada skala mockup (maks 10px => ukuran persis mockup).
// Di layar pendek, --u mengecil mengikuti tinggi layar supaya muat satu layar.
// Angka 165px = perkiraan tinggi elemen lain (nav, garis dekoratif, padding).
const SCALE = {
  "--u": "clamp(5.5px, calc((100svh - 165px) / 55), 10px)",
} as CSSProperties;

// Jeda mulai animasi masuk (kelas gs-* didefinisikan di PageSlide).
function jeda(d: string) {
  return { "--gd": d } as CSSProperties;
}

function teksAtauBawaan(nilai: string | null | undefined, bawaan: string) {
  return nilai && nilai.trim() ? nilai : bawaan;
}

// show kosong (data lama) dianggap true.
function pilihTampil(semua: AboutEntri[]): AboutEntri[] {
  return semua.filter((e) => e.show !== false).slice(0, TAMPIL_MAX);
}

export default function AboutSection({
  cvUrl = null,
  photoUrl = null,
  name = null,
  description = null,
  experience = null,
  education = null,
}: AboutKonten) {
  const cvAman = cvUrl && /^https?:\/\//i.test(cvUrl) ? cvUrl : null;
  const fotoSrc =
    photoUrl && /^https?:\/\//i.test(photoUrl) ? photoUrl : FOTO_BAWAAN;

  const nama = teksAtauBawaan(name, ABOUT_DEFAULT.name);
  const deskripsi = teksAtauBawaan(description, ABOUT_DEFAULT.description);

  const semuaBlok = [
    { title: "Experience", semua: experience ?? ABOUT_DEFAULT.experience },
    { title: "Education", semua: education ?? ABOUT_DEFAULT.education },
  ].map((b) => ({ title: b.title, semua: b.semua, tampil: pilihTampil(b.semua) }));

  // Blok dengan nol entri tampil disembunyikan.
  const blok = semuaBlok.filter((b) => b.tampil.length > 0);

  // Ada entri yang tidak tampil di About => tawarkan halaman riwayat lengkap.
  const adaTersembunyi = semuaBlok.some((b) => b.semua.length > b.tampil.length);

  return (
    <div className="relative flex flex-col gap-3" style={SCALE}>
      {/* Garis dekoratif dirender di app/about/page.tsx (di luar PageSlide)
          supaya tetap diam saat halaman masuk. */}

      <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:px-16">
        {/* Kolom 1: foto */}
        <div
          className="gs-foto relative aspect-[520/760] w-full max-w-[520px] shrink-0 lg:h-[clamp(280px,calc(100svh_-_165px),760px)] lg:w-auto lg:max-w-none"
          style={jeda("0.05s")}
        >
          <svg
            className="absolute inset-0 z-0 h-full w-full"
            viewBox="0 0 520 760"
            fill="none"
            aria-hidden="true"
          >
            <g stroke="#111111" strokeLinecap="round">
              <path
                d="M330 0C470 20 520 140 440 240C340 340 40 380 20 520C5 640 120 740 260 760"
                strokeWidth="1.2"
              />
              <path
                d="M344 -6C486 18 540 146 456 250C354 352 56 390 36 526C22 644 130 744 270 764"
                strokeWidth="0.7"
                opacity="0.5"
              />
              <ellipse
                cx="250"
                cy="360"
                rx="246"
                ry="372"
                strokeWidth="1"
                strokeDasharray="1.5 8"
              />
            </g>
            <g fill="#111111">
              <path d={STAR} transform="translate(24 90) scale(12)" />
              <path d={STAR} transform="translate(500 170) scale(22)" />
              <path d={STAR} transform="translate(16 600) scale(10)" />
              <path d={STAR} transform="translate(505 640) scale(13)" />
              <path d={STAR} transform="translate(400 14) scale(8)" />
              <circle cx="150" cy="22" r="2.5" />
              <circle cx="512" cy="400" r="2" />
              <circle cx="12" cy="330" r="2" />
              <circle cx="340" cy="748" r="2.5" />
            </g>
            <circle cx="30" cy="250" r="6" stroke="#111111" strokeWidth="1.2" />
            <circle cx="490" cy="78" r="5" stroke="#111111" strokeWidth="1.2" />
          </svg>

          <div className="absolute left-[7.69%] top-[3.95%] z-[1] h-[86.84%] w-[80.77%] overflow-hidden rounded-[28px] border-[3px] border-foreground bg-surface shadow-[6px_6px_0_#111] lg:shadow-[10px_10px_0_#111]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoSrc}
              alt={`Foto ${nama}`}
              className="block h-full w-full object-cover [filter:grayscale(1)_contrast(1.05)] [object-position:50%_35%]"
            />
          </div>

          <svg
            className="absolute inset-x-0 top-0 z-[2] h-[89.34%] w-full"
            viewBox="0 0 520 760"
            fill="none"
            aria-hidden="true"
          >
            <g stroke="#111111" strokeLinecap="round">
              <path
                d="M64 580C24 670 130 742 256 726C376 712 446 650 414 600"
                strokeWidth="1.2"
              />
              <path
                d="M76 574C42 658 140 728 258 714C366 702 432 648 404 604"
                strokeWidth="0.7"
                opacity="0.6"
              />
            </g>
            <path d={STAR} transform="translate(414 598) scale(10)" fill="#111111" />
            <circle cx="64" cy="580" r="3" fill="#111111" />
            <circle cx="446" cy="700" r="4.5" stroke="#111111" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Kolom 2: perkenalan */}
        <div className="flex w-full max-w-[460px] min-w-0 flex-col [gap:calc(var(--u)_*_2.2)] lg:flex-1 lg:basis-[360px]">
          <div
            className="gs-label font-semibold uppercase tracking-[0.08em] text-muted [font-size:max(11px,calc(var(--u)_*_1.2))]"
            style={jeda("0.3s")}
          >
            About me
          </div>
          <p
            className="gs-halo font-serif italic leading-none text-foreground [font-size:calc(var(--u)_*_10.4)] [margin-top:calc(var(--u)_*_-0.8)]"
            style={jeda("0.4s")}
          >
            halo!
          </p>
          <h1
            className="gs-judul break-words font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground [font-size:max(22px,calc(var(--u)_*_3.6))]"
            style={jeda("0.6s")}
          >
            Aku {nama}.
          </h1>
          <p
            className="gs-teks m-0 font-normal leading-[1.7] text-charcoal [font-size:max(13px,calc(var(--u)_*_1.8))]"
            style={jeda("0.8s")}
          >
            {deskripsi}
          </p>
          {cvAman ? (
            <div className="[margin-top:calc(var(--u)_*_1.4)]">
              <a
                href={cvAman}
                target="_blank"
                rel="noopener noreferrer"
                className="gs-tombol inline-block rounded-xl bg-foreground font-semibold text-background no-underline [font-size:max(13px,calc(var(--u)_*_1.7))] [padding:calc(var(--u)_*_1.6)_calc(var(--u)_*_3)]"
                style={jeda("1s")}
              >
                Download CV
              </a>
            </div>
          ) : null}
        </div>

        {/* Kolom 3: experience dan education (maksimal 1 entri tampil per blok) */}
        {blok.length > 0 || adaTersembunyi ? (
          <div className="flex w-full max-w-[460px] min-w-0 flex-col [gap:calc(var(--u)_*_3.2)] lg:max-w-[300px] lg:flex-1 lg:basis-[250px]">
            {blok.map((b, bi) => (
              <section
                key={b.title}
                className="gs-blok flex flex-col border-t-2 border-foreground [gap:calc(var(--u)_*_1.2)] [padding-top:calc(var(--u)_*_2)]"
                style={jeda(bi === 0 ? "0.9s" : "1.15s")}
              >
                <h2 className="font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground [font-size:max(20px,calc(var(--u)_*_3.4))]">
                  {b.title}
                </h2>
                {b.tampil.map((item, i) => (
                  <div
                    key={i}
                    className={`leading-[1.65] text-charcoal [font-size:max(13px,calc(var(--u)_*_1.7))] ${
                      i > 0
                        ? "border-t border-border [padding-top:calc(var(--u)_*_1.2)]"
                        : ""
                    }`}
                  >
                    {item.year ? (
                      <div className="truncate font-semibold text-foreground">
                        {item.year}
                      </div>
                    ) : null}
                    <div className="line-clamp-2 font-semibold text-foreground">
                      {item.title}
                    </div>
                    {item.detail ? (
                      <div className="line-clamp-2">{item.detail}</div>
                    ) : null}
                  </div>
                ))}
              </section>
            ))}

            {adaTersembunyi ? (
              <div className="gs-teks" style={jeda("1.3s")}>
                <Link
                  href="/about/riwayat"
                  className="font-semibold text-foreground underline underline-offset-4 [font-size:max(13px,calc(var(--u)_*_1.7))]"
                >
                  Lihat semua →
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Panah halaman (fixed, posisi sama di semua halaman) */}
      <PageArrow href="/" label="Halaman sebelumnya" side="left" />
      <PageArrow href="/project" label="Halaman berikutnya" side="right" />
    </div>
  );
}