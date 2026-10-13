import type { CSSProperties } from "react";
import { ABOUT_DEFAULT } from "../../lib/about-defaults";
import type { AboutEntri } from "../../lib/profile";
import LogoRiwayat from "../ui/LogoRiwayat";
import type { JenisRiwayat } from "../ui/LogoRiwayat";
import { PageArrow } from "./PageChrome";
import ScrollUpButton from "./ScrollUpButton";

const STAR =
  "M0 -1C0.12 -0.3 0.3 -0.12 1 0C0.3 0.12 0.12 0.3 0 1C-0.12 0.3 -0.3 0.12 -1 0C-0.3 -0.12 -0.12 -0.3 0 -1Z";

const FOTO_BAWAAN = "/images/about-evi.jpg";

// Maksimal entri yang tampil di bagian atas About per blok (sama dengan batas di admin).
// Semua entri tampil di bagian detail di bawahnya.
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
// --h = tinggi kolom foto di desktop. Kolom teks (2 dan 3) memakai tinggi yang
// sama supaya tepi atas dan bawahnya bisa disejajarkan dengan frame foto.
const SCALE = {
  "--u": "clamp(5.5px, calc((100svh - 165px) / 55), 10px)",
  "--h": "clamp(280px, calc(100svh - 165px), 760px)",
} as CSSProperties;

// GESER = seluruh jadwal animasi masuk digeser lebih awal sekian detik (supaya
// halaman tidak terasa telat). Urutan antarelemen tetap sama; semua jeda di
// bawah (tunda, Huruf) dikurangi GESER, minimal 0.
// Foto masuk bareng "halo!" (jadwal asli mulai 0,7s, selesai sekitar 3,3s;
// setelah GESER selesai sekitar 3,0s).
// Gerak hiasan berulang baru mulai setelah foto selesai: jeda tambahan OFF_DEKOR.
const GESER = 0.3;
const OFF_DEKOR = 1.3 - GESER;

// Animasi halaman About (CSS murni, gaya sama dengan Home).
// Bagian masuk: sekali saat halaman dibuka. Bagian gerak hiasan (ab-orbit,
// ab-bintang, ab-melayang, ab-turun): berulang terus.
// Bagian detail (ab-gulir): muncul saat di-scroll (scroll-driven animation,
// Chrome). Browser yang belum mendukung langsung menampilkannya tanpa animasi.
// Scroll halus ke detail hanya aktif selama halaman yang punya #detail-about ada.
const ANIMASI_CSS = `
@keyframes ab-huruf{
  0%{opacity:0;transform:translate3d(var(--ax,0px),var(--ay,0px),0);filter:blur(10px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes ab-foto{
  0%{opacity:0;transform:translate3d(-40px,0,0) scale(.96);filter:blur(16px)}
  100%{opacity:1;transform:translate3d(0,0,0) scale(1);filter:blur(0)}
}
@keyframes ab-kanan{
  0%{opacity:0;transform:translate3d(40px,0,0);filter:blur(10px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes ab-naik{
  0%{opacity:0;transform:translate3d(0,18px,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes ab-pop{
  0%{opacity:0;transform:scale(.85);filter:blur(8px)}
  100%{opacity:1;transform:scale(1);filter:blur(0)}
}
@keyframes ab-orbit{
  to{stroke-dashoffset:-95}
}
@keyframes ab-kedip{
  0%,100%{transform:scale(1) rotate(0deg)}
  50%{transform:scale(1.35) rotate(45deg)}
}
@keyframes ab-melayang{
  0%,100%{transform:translate3d(0,0,0)}
  50%{transform:translate3d(var(--mx,0px),var(--my,-6px),0)}
}
@keyframes ab-turun{
  0%,100%{transform:translate3d(0,-2px,0)}
  50%{transform:translate3d(0,3px,0)}
}
.ab-h{display:inline-block;animation:ab-huruf 1.6s cubic-bezier(.22,1,.36,1) both}
.ab-foto{animation:ab-foto 2.6s cubic-bezier(.22,1,.36,1) both}
.ab-kanan{animation:ab-kanan 1.6s cubic-bezier(.22,1,.36,1) both}
.ab-naik{animation:ab-naik 1.5s cubic-bezier(.22,1,.36,1) both}
.ab-pop{animation:ab-pop 1.1s cubic-bezier(.22,1,.36,1) both}
.ab-orbit{animation:ab-orbit 14s linear ${(3.3 - GESER).toFixed(1)}s infinite}
.ab-bintang{transform-box:fill-box;transform-origin:center;animation:ab-kedip 3.6s ease-in-out ${(3.3 - GESER).toFixed(1)}s infinite}
.ab-melayang{transform-box:fill-box;transform-origin:center;animation:ab-melayang 5s ease-in-out ${(3.3 - GESER).toFixed(1)}s infinite}
.ab-turun{display:inline-block;animation:ab-turun 1.6s ease-in-out infinite}
html:has(#detail-about){scroll-behavior:smooth}
@supports (animation-timeline:view()){
  .ab-gulir{animation:ab-naik 1s ease-out both;animation-timeline:view();animation-range:entry 0% entry 70%}
}
@media (prefers-reduced-motion:reduce){
  .ab-h,.ab-foto,.ab-kanan,.ab-naik,.ab-pop,.ab-orbit,.ab-bintang,.ab-melayang,.ab-turun,.ab-gulir{animation:none}
  html:has(#detail-about){scroll-behavior:auto}
}
`;

function tunda(detik: number) {
  return {
    animationDelay: `${Math.max(0, detik - GESER).toFixed(2)}s`,
  } as CSSProperties;
}

// Gerak hiasan berulang: durasi, jarak geser (x, y dalam satuan viewBox), jeda mulai.
function gerak(dur: number, mx = 0, my = -6, del = 2) {
  return {
    animationDuration: `${dur}s`,
    animationDelay: `${(del + OFF_DEKOR).toFixed(2)}s`,
    "--mx": `${mx}px`,
    "--my": `${my}px`,
  } as CSSProperties;
}

// Bintang: <g> memegang posisi dan ukuran (atribut transform), <path> di dalamnya
// yang dianimasikan supaya animasi tidak menimpa posisi.
function Bintang({
  x,
  y,
  s,
  dur,
  del,
}: {
  x: number;
  y: number;
  s: number;
  dur: number;
  del: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={STAR}
        fill="#111111"
        className="ab-bintang"
        style={{
          animationDuration: `${dur}s`,
          animationDelay: `${(del + OFF_DEKOR).toFixed(2)}s`,
        }}
      />
    </g>
  );
}

// Pecah teks jadi huruf-huruf animasi. Kata dibungkus nowrap supaya
// kata tidak terpotong di tengah saat teks turun baris.
function Huruf({
  teks,
  mulai,
  jeda,
  durasi,
  kelas,
}: {
  teks: string;
  mulai: number;
  jeda: number;
  durasi: number;
  kelas?: string;
}) {
  let n = 0;
  const kata = teks.split(" ");
  return (
    <>
      <span className="sr-only">{teks}</span>
      <span aria-hidden="true" className={kelas}>
        {kata.map((k, ki) => (
          <span key={ki}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(k).map((h, hi) => {
                const delay = Math.max(0, mulai + n * jeda - GESER);
                n += 1;
                return (
                  <span
                    key={hi}
                    className="ab-h"
                    style={
                      {
                        animationDelay: `${delay.toFixed(2)}s`,
                        animationDuration: `${durasi}s`,
                      } as CSSProperties
                    }
                  >
                    {h}
                  </span>
                );
              })}
            </span>
            {ki < kata.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>
  );
}

function teksAtauBawaan(nilai: string | null | undefined, bawaan: string) {
  return nilai && nilai.trim() ? nilai : bawaan;
}

// show kosong (data lama) dianggap true.
function pilihTampil(semua: AboutEntri[]): AboutEntri[] {
  return semua.filter((e) => e.show !== false).slice(0, TAMPIL_MAX);
}

// Satu blok di bagian detail: semua entri (termasuk yang tidak tampil di atas).
// Layout padat: dua blok berdampingan di desktop. Tiap entri = teks, lalu
// deretan thumbnail kecil tepat di bawahnya (tanpa kolom kosong di samping).
// Entri tanpa foto tampil teks saja. Klik foto membuka ukuran penuh di tab baru.
function BlokDetail({
  judul,
  jenis,
  daftar,
}: {
  judul: string;
  jenis: JenisRiwayat;
  daftar: AboutEntri[];
}) {
  return (
    <section className="flex min-w-0 flex-col border-t-2 border-foreground pt-3">
      <h2 className="ab-gulir text-[26px] font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground">
        {judul}
      </h2>

      {daftar.length === 0 ? (
        <p className="pt-3 text-[14px] leading-[1.65] text-muted">Belum ada entri.</p>
      ) : (
        <ul className="mt-2 flex flex-col">
          {daftar.map((item, i) => {
            const foto = item.photos ?? [];
            return (
              <li
                key={i}
                className={`ab-gulir flex min-w-0 flex-col gap-3 py-4 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <LogoRiwayat
                    jenis={jenis}
                    url={item.logo}
                    ukuran={56}
                    alt={`Logo ${item.title}`}
                    className="mt-0.5"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 text-[14px] leading-[1.6] text-charcoal">
                    {item.year ? (
                      <div className="break-words text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                        {item.year}
                      </div>
                    ) : null}
                    <div className="break-words text-[18px] font-bold leading-[1.25] text-foreground">
                      {item.title}
                    </div>
                    {item.detail ? (
                      <div className="break-words">{item.detail}</div>
                    ) : null}
                  </div>
                </div>

                {foto.length > 0 ? (
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(88px,112px))] gap-2">
                    {foto.map((url, n) => (
                      <li key={`${url}-${n}`}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka foto ${n + 1} untuk ${item.title}`}
                          className="block aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-surface"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Foto ${n + 1}: ${item.title}`}
                            loading="lazy"
                            className="block h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Judul: "aku," tipis, lalu nama tebal.
const SAPA = "aku,";
const JEDA_HURUF = 0.045;
const MULAI_JUDUL = 1.2;

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
    {
      title: "Experience",
      jenis: "experience" as JenisRiwayat,
      semua: experience ?? ABOUT_DEFAULT.experience,
    },
    {
      title: "Education",
      jenis: "education" as JenisRiwayat,
      semua: education ?? ABOUT_DEFAULT.education,
    },
  ].map((b) => ({
    title: b.title,
    jenis: b.jenis,
    semua: b.semua,
    tampil: pilihTampil(b.semua),
  }));

  // Blok dengan nol entri tampil disembunyikan (di bagian atas saja).
  const blok = semuaBlok.filter((b) => b.tampil.length > 0);

  const mulaiNama = MULAI_JUDUL + Array.from(SAPA).length * JEDA_HURUF;

  return (
    <div className="relative flex flex-col gap-3" style={SCALE}>
      <style>{ANIMASI_CSS}</style>

      {/* Garis dekoratif dirender di app/about/page.tsx (di luar PageSlide)
          supaya tetap diam saat halaman masuk. */}

      {/* Urutan tampil: di mobile = perkenalan (order-1), foto (order-2),
          experience/education (order-3). Di desktop (lg) = foto, perkenalan,
          experience/education, sama seperti urutan di kode. */}
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:px-16">
        {/* Kolom 1: foto */}
        <div
          className="ab-foto relative order-2 aspect-[520/760] w-full max-w-[520px] shrink-0 lg:order-1 lg:h-[var(--h)] lg:w-auto lg:max-w-none"
          style={tunda(0.7)}
        >
          <svg
            className="absolute inset-0 z-0 h-full w-full"
            viewBox="0 0 520 760"
            fill="none"
            aria-hidden="true"
          >
            <g stroke="#111111" strokeLinecap="round">
              <path
                className="ab-melayang"
                style={gerak(7, 5, 4)}
                d="M330 0C470 20 520 140 440 240C340 340 40 380 20 520C5 640 120 740 260 760"
                strokeWidth="1.2"
              />
              <path
                className="ab-melayang"
                style={gerak(8.5, -5, -4)}
                d="M344 -6C486 18 540 146 456 250C354 352 56 390 36 526C22 644 130 744 270 764"
                strokeWidth="0.7"
                opacity="0.5"
              />
              <ellipse
                className="ab-orbit"
                cx="250"
                cy="360"
                rx="246"
                ry="372"
                strokeWidth="1"
                strokeDasharray="1.5 8"
              />
            </g>
            <g fill="#111111">
              <Bintang x={24} y={90} s={12} dur={3.6} del={2} />
              <Bintang x={500} y={170} s={22} dur={4.4} del={2.6} />
              <Bintang x={16} y={600} s={10} dur={3.2} del={3.1} />
              <Bintang x={505} y={640} s={13} dur={4} del={2.3} />
              <Bintang x={400} y={14} s={8} dur={3.4} del={3.4} />
              <circle className="ab-melayang" style={gerak(5, 4, -8, 2.2)} cx="150" cy="22" r="2.5" />
              <circle className="ab-melayang" style={gerak(6, -5, 7, 2.8)} cx="512" cy="400" r="2" />
              <circle className="ab-melayang" style={gerak(4.6, 6, 6, 3.2)} cx="12" cy="330" r="2" />
              <circle className="ab-melayang" style={gerak(5.4, -6, -7, 2.5)} cx="340" cy="748" r="2.5" />
            </g>
            <circle
              className="ab-melayang"
              style={gerak(6.2, 7, -8, 2.4)}
              cx="30"
              cy="250"
              r="6"
              stroke="#111111"
              strokeWidth="1.2"
            />
            <circle
              className="ab-melayang"
              style={gerak(5.6, -7, 8, 3)}
              cx="490"
              cy="78"
              r="5"
              stroke="#111111"
              strokeWidth="1.2"
            />
          </svg>

          <div className="absolute left-[7.69%] top-[3.95%] z-[1] h-[86.84%] w-[80.77%] overflow-hidden rounded-[28px] border-[3px] border-foreground bg-surface shadow-[6px_6px_0_#111] lg:shadow-[10px_10px_0_#111]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoSrc}
              alt={`Foto ${nama}`}
              className="block h-full w-full object-cover [object-position:50%_35%]"
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
                className="ab-melayang"
                style={gerak(7.5, -4, 5, 2.2)}
                d="M64 580C24 670 130 742 256 726C376 712 446 650 414 600"
                strokeWidth="1.2"
              />
              <path
                className="ab-melayang"
                style={gerak(9, 4, -5, 2.6)}
                d="M76 574C42 658 140 728 258 714C366 702 432 648 404 604"
                strokeWidth="0.7"
                opacity="0.6"
              />
            </g>
            <Bintang x={414} y={598} s={10} dur={3.8} del={2.4} />
            <circle
              className="ab-melayang"
              style={gerak(5, 4, -5, 2.7)}
              cx="64"
              cy="580"
              r="3"
              fill="#111111"
            />
            <circle
              className="ab-melayang"
              style={gerak(6.4, -6, -7, 3.1)}
              cx="446"
              cy="700"
              r="4.5"
              stroke="#111111"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Kolom 2: perkenalan */}
        {/* Mobile: tampil paling atas (order-1), di atas foto. */}
        {/* Desktop: tinggi = tinggi foto. Isi dibagi dari atas frame (padding atas 3,95%
            tinggi) sampai tepi bawah bayangan frame (9,21% tinggi dikurangi bayangan
            10px). "About me" rata dengan tepi atas frame, tombol rata dengan tepi
            bawah bayangan frame. */}
        <div className="order-1 flex w-full max-w-[460px] min-w-0 flex-col [gap:calc(var(--u)_*_2.2)] lg:order-2 lg:h-[var(--h)] lg:flex-1 lg:basis-[360px] lg:justify-between lg:pt-[calc(var(--h)_*_0.0395)] lg:pb-[calc(var(--h)_*_0.0921_-_10px)] lg:[gap:calc(var(--u)_*_1.2)]">
          <div
            className="font-semibold uppercase leading-none tracking-[0.08em] text-muted [font-size:max(11px,calc(var(--u)_*_1.2))]"
            style={{ "--ax": "-16px", "--ay": "0px" } as CSSProperties}
          >
            <Huruf teks="About me" mulai={0.4} jeda={0.06} durasi={1.4} />
          </div>
          <p
            className="font-serif italic leading-none text-foreground [font-size:calc(var(--u)_*_10.4)] [margin-top:calc(var(--u)_*_-0.8)]"
            style={{ "--ax": "0px", "--ay": "-22px" } as CSSProperties}
          >
            <Huruf teks="halo!" mulai={0.7} jeda={0.14} durasi={2} />
          </p>
          <h1
            className="break-words font-normal leading-[1.08] tracking-[-0.02em] text-foreground [font-size:max(22px,calc(var(--u)_*_3.6))]"
            style={{ "--ax": "18px", "--ay": "0px" } as CSSProperties}
          >
            <Huruf
              teks={SAPA}
              mulai={MULAI_JUDUL}
              jeda={JEDA_HURUF}
              durasi={1.6}
              kelas="font-normal"
            />{" "}
            <Huruf
              teks={nama}
              mulai={mulaiNama}
              jeda={JEDA_HURUF}
              durasi={1.6}
              kelas="font-extrabold"
            />
          </h1>
          <p
            className="ab-naik m-0 font-normal leading-[1.7] text-charcoal [font-size:max(13px,calc(var(--u)_*_1.8))]"
            style={tunda(1.9)}
          >
            {deskripsi}
          </p>
          <div className="flex flex-wrap items-center [gap:calc(var(--u)_*_1.2)] [margin-top:calc(var(--u)_*_1.4)] lg:[margin-top:0]">
            {cvAman ? (
              <a
                href={cvAman}
                target="_blank"
                rel="noopener noreferrer"
                className="ab-pop inline-block whitespace-nowrap rounded-xl border-2 border-foreground bg-foreground font-semibold text-background no-underline [font-size:max(13px,calc(var(--u)_*_1.7))] [padding:calc(var(--u)_*_1.4)_calc(var(--u)_*_3)]"
                style={tunda(2.4)}
              >
                Download CV
              </a>
            ) : null}
            <a
              href="#detail-about"
              className="ab-pop inline-flex items-center whitespace-nowrap rounded-xl border-2 border-foreground bg-transparent font-semibold text-foreground no-underline [gap:calc(var(--u)_*_0.8)] [font-size:max(13px,calc(var(--u)_*_1.7))] [padding:calc(var(--u)_*_1.4)_calc(var(--u)_*_2.4)]"
              style={tunda(2.55)}
            >
              Scroll untuk detail
              <span className="ab-turun" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>
        </div>

        {/* Kolom 3: experience dan education (maksimal 1 entri tampil per blok).
            Mobile: paling bawah (order-3), setelah foto.
            Desktop: kedua blok berdekatan dan diletakkan di tengah tinggi
            frame (dari tepi atas frame sampai tepi bawah bayangannya). */}
        {blok.length > 0 ? (
          <div className="order-3 flex w-full max-w-[460px] min-w-0 flex-col [gap:calc(var(--u)_*_3.2)] lg:h-[var(--h)] lg:max-w-[300px] lg:flex-1 lg:basis-[250px] lg:justify-center lg:pt-[calc(var(--h)_*_0.0395)] lg:pb-[calc(var(--h)_*_0.0921_-_10px)]">
            {blok.map((b, bi) => (
              <section
                key={b.title}
                className={`ab-kanan flex flex-col [gap:calc(var(--u)_*_1.2)] ${
                  bi === 0
                    ? ""
                    : "border-t-2 border-foreground [padding-top:calc(var(--u)_*_2)]"
                }`}
                style={tunda(bi === 0 ? 1.4 : 1.8)}
              >
                <h2 className="font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground [font-size:max(20px,calc(var(--u)_*_3.4))]">
                  {b.title}
                </h2>
                {b.tampil.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start leading-[1.65] text-charcoal [gap:calc(var(--u)_*_1.2)] [font-size:max(13px,calc(var(--u)_*_1.7))] ${
                      i > 0
                        ? "border-t border-border [padding-top:calc(var(--u)_*_1.2)]"
                        : ""
                    }`}
                  >
                    <LogoRiwayat
                      jenis={b.jenis}
                      url={item.logo}
                      ukuran="max(32px, calc(var(--u) * 4.4))"
                      alt={`Logo ${item.title}`}
                    />
                    <div className="min-w-0 flex-1">
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
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : null}
      </div>

      {/* Bagian detail (di bawah satu layar pertama): semua entri + foto bukti */}
      <div
        id="detail-about"
        className="flex scroll-mt-4 flex-col gap-5 pb-10 pt-12 lg:px-16"
      >
        <div className="ab-gulir flex flex-col gap-2">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            Experience &amp; Education
          </div>
          <h2 className="font-serif text-[64px] italic leading-none text-foreground sm:text-[88px]">
            riwayat.
          </h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {semuaBlok.map((b) => (
            <BlokDetail
              key={b.title}
              judul={b.title}
              jenis={b.jenis}
              daftar={b.semua}
            />
          ))}
        </div>
      </div>

      {/* Tombol kembali ke atas: muncul setelah scroll ke bagian detail */}
      <ScrollUpButton />

      {/* Panah halaman (fixed, posisi sama di semua halaman) */}
      <PageArrow href="/" label="Halaman sebelumnya" side="left" />
      <PageArrow href="/project" label="Halaman berikutnya" side="right" />
    </div>
  );
}