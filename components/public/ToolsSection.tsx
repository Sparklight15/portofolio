import type { CSSProperties } from "react";
import type { PublicTool } from "../../lib/public-tools";
import { DecorLine } from "./PageChrome";

// ---------------------------------------------------------------------------
// Ukuran kartu: SEMAKIN BANYAK tools, SEMAKIN KECIL kartunya, supaya semua
// tools selalu muat SATU layar di desktop (tanpa scroll).
//
// Satu angka --w (lebar kartu) dihitung CSS dari dua batas, diambil yang
// terkecil:
//  - tinggi: (tinggi layar - 208px) dibagi --k (tinggi grid dalam satuan --w)
//  - lebar : (lebar area - 560px)   dibagi --kw (lebar grid dalam satuan --w)
// Karena diambil yang terkecil, grid TIDAK PERNAH lebih besar dari ruangnya.
// Batas bawah --w = 18px (hanya untuk jumlah tools yang sangat ekstrem).
//
// Jumlah KOLOM dipilih di server supaya kartu sebesar mungkin. Ada dua profil:
//  - a (bawaan)        : layar pendek, kira-kira 1280 x 585
//  - b (tinggi >= 760px): layar yang lebih tinggi
// Angka 208px dan 560px = perkiraan ruang elemen lain (belum diukur presisi).
// Di mobile ukuran kartu tetap dan halaman boleh di-scroll.
// ---------------------------------------------------------------------------
const RASIO_KARTU = 1.05; // tinggi kartu = 1.05 x lebar
const JARAK_Y = 0.24; // jarak antarbaris (satuan lebar kartu)
const JARAK_X = 0.2; // jarak antarkolom (satuan lebar kartu)
const RUANG_SELOTIP = 0.1; // ruang ekstra di atas untuk selotip
const W_MAKS = 200; // lebar kartu maksimum (px), sama seperti sebelumnya

type Susunan = { cols: number; k: number; kw: number };

function susunan(cols: number, jumlah: number): Susunan {
  const rows = Math.max(1, Math.ceil(jumlah / cols));
  return {
    cols,
    // tinggi grid dalam satuan lebar kartu
    k: rows * RASIO_KARTU + (rows - 1) * JARAK_Y + RUANG_SELOTIP,
    // lebar grid dalam satuan lebar kartu
    kw: cols + (cols - 1) * JARAK_X,
  };
}

// Pilih jumlah kolom yang membuat kartu terbesar untuk ruang (lebar x tinggi, px)
// tertentu. Kalau seri, pilih yang paling sedikit sel kosongnya.
function pilihKolom(jumlah: number, ruangLebar: number, ruangTinggi: number): Susunan {
  let terbaik = susunan(1, jumlah);
  let ukuranTerbaik = -1;
  let kosongTerbaik = Infinity;
  const batas = Math.max(1, Math.min(jumlah, 16));
  for (let cols = 1; cols <= batas; cols++) {
    const s = susunan(cols, jumlah);
    const ukuran = Math.min(W_MAKS, ruangLebar / s.kw, ruangTinggi / s.k);
    const kosong = cols * Math.ceil(jumlah / cols) - jumlah;
    if (
      ukuran > ukuranTerbaik + 0.5 ||
      (Math.abs(ukuran - ukuranTerbaik) <= 0.5 && kosong < kosongTerbaik)
    ) {
      terbaik = s;
      ukuranTerbaik = ukuran;
      kosongTerbaik = kosong;
    }
  }
  return terbaik;
}

// Ruang grid (px CSS): lebar = 1200 - 560, tinggi = tinggi layar - 208.
const PROFIL_A = { lebar: 640, tinggi: 377 }; // layar sekitar 1280 x 585
const PROFIL_B = { lebar: 640, tinggi: 700 }; // layar tinggi (>= 760px)

const SCALE_CSS = `.tools-scale{--w:150px}
@media (min-width:1024px){
.tools-scale{--cols:var(--ca);--k:var(--ka);--kw:var(--kwa);--w:clamp(18px,min(calc((min(1200px,100vw - 80px) - 560px) / var(--kw)),calc((100svh - 208px) / var(--k))),${W_MAKS}px)}
}
@media (min-width:1024px) and (min-height:760px){
.tools-scale{--cols:var(--cb);--k:var(--kb);--kw:var(--kwb)}
}`;

// ---------------------------------------------------------------------------
// Animasi masuk (gaya sama dengan Home, About, Project, Detail). CSS murni,
// awalan tl-. Jalan saat komponen dipasang, termasuk lewat tombol panah.
// prefers-reduced-motion mematikan semua.
//  - label "Tools · Stack": per huruf dari atas        (mulai 0,1s)
//  - "my": per huruf dari kiri                         (mulai 0,25s)
//  - "tools.": per huruf dari kanan-atas               (mulai 0,55s)
//  - paragraf, keterangan fig.: naik + blur            (1,0s dan 1,2s)
//  - kartu: naik dari bawah, blur ke tajam, berurutan  (mulai 0,8s)
// Animasi kartu dipasang di PEMBUNGKUS kartu, bukan di kartunya, supaya
// putaran miring kartu (transform) tidak tertimpa.
// ---------------------------------------------------------------------------
const MULAI_KARTU = 0.8;
const JEDA_KARTU_MAKS = 0.09;
const TOTAL_JEDA_KARTU_MAKS = 1.1; // detik, supaya jumlah tools besar tidak terasa lama

const ANIMASI_CSS = `
@keyframes tl-huruf{
  0%{opacity:0;transform:translate3d(var(--ax,0px),var(--ay,0px),0);filter:blur(10px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes tl-naik{
  0%{opacity:0;transform:translate3d(0,18px,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes tl-kartu{
  0%{opacity:0;transform:translate3d(0,56px,0) scale(.96);filter:blur(12px)}
  100%{opacity:1;transform:none;filter:none}
}
.tl-h{display:inline-block;animation:tl-huruf 1.8s cubic-bezier(.22,1,.36,1) both}
.tl-naik{animation:tl-naik 1.5s cubic-bezier(.22,1,.36,1) both}
.tl-k{animation:tl-kartu 1.6s cubic-bezier(.22,1,.36,1) both}
@keyframes tl-geser-kedip{
  0%,100%{opacity:.5}
  50%{opacity:1}
}
.tl-geser{animation:tl-geser-kedip 2.5s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){
  .tl-h,.tl-naik,.tl-k,.tl-geser{animation:none}
}
`;

// Ikon panah ganda tipis (<< atau >>) untuk petunjuk swipe (sama dengan Home).
function PanahGanda({
  arah,
  className,
}: {
  arah: "kiri" | "kanan";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {arah === "kanan" ? (
        <>
          <path d="M5 6l6 6-6 6" />
          <path d="M12 6l6 6-6 6" />
        </>
      ) : (
        <>
          <path d="M19 6l-6 6 6 6" />
          <path d="M12 6l-6 6 6 6" />
        </>
      )}
    </svg>
  );
}

function tunda(detik: number) {
  return { animationDelay: `${detik.toFixed(2)}s` } as CSSProperties;
}

// Pecah teks jadi huruf-huruf animasi (per kata tidak terpotong).
// ax/ay = arah datang huruf (px).
function Huruf({
  teks,
  mulai,
  jeda,
  durasi,
  ax,
  ay,
}: {
  teks: string;
  mulai: number;
  jeda: number;
  durasi: number;
  ax: number;
  ay: number;
}) {
  let n = 0;
  const kata = teks.split(" ");
  return (
    <>
      <span className="sr-only">{teks}</span>
      <span
        aria-hidden="true"
        style={{ "--ax": `${ax}px`, "--ay": `${ay}px` } as CSSProperties}
      >
        {kata.map((k, ki) => (
          <span key={ki}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(k).map((h, hi) => {
                const delay = mulai + n * jeda;
                n += 1;
                return (
                  <span
                    key={hi}
                    className="tl-h"
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

const ICON_STYLE: CSSProperties = {
  width: "calc(var(--w) * 0.36)",
  height: "calc(var(--w) * 0.36)",
};

const ROTATIONS = [-2, 1.5, -1, 2, -1.5, 1];

type BuiltIn = "sql" | "python" | "pandas" | "excel" | "git";

function builtInKind(name: string): BuiltIn | null {
  const key = name.trim().toLowerCase();
  if (key === "sql") return "sql";
  if (key === "python") return "python";
  if (key === "pandas") return "pandas";
  if (key === "excel" || key === "microsoft excel") return "excel";
  if (key === "git") return "git";
  return null;
}

function BuiltInIcon({ kind }: { kind: BuiltIn | null }) {
  switch (kind) {
    case "sql":
      return (
        <svg viewBox="0 0 24 24" style={ICON_STYLE} aria-hidden="true">
          <g fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round">
            <ellipse cx="12" cy="6" rx="7" ry="3" />
            <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
          </g>
        </svg>
      );
    case "python":
      return (
        <svg viewBox="0 0 24 24" style={ICON_STYLE} aria-hidden="true">
          <g fill="#111111">
            <path d="M11.5 2C7.5 2 7 3.7 7 5v2h5v1H5C3 8 2 9.5 2 12s1 4 3 4h2v-2.5C7 12 8.5 11 10 11h4c1.4 0 2.5-1.1 2.5-2.5V5C16.5 3 15 2 11.5 2z" />
            <path d="M12.5 22c4 0 4.5-1.7 4.5-3v-2h-5v-1h7c2 0 3-1.5 3-4s-1-4-3-4h-2v2.5C17 12 15.5 13 14 13h-4c-1.4 0-2.5 1.1-2.5 2.5V19c0 2 1.5 3 5 3z" />
          </g>
          <circle cx="9.5" cy="4.8" r="1" fill="#EBEBEB" />
          <circle cx="14.5" cy="19.2" r="1" fill="#EBEBEB" />
        </svg>
      );
    case "pandas":
      return (
        <svg viewBox="0 0 24 24" style={ICON_STYLE} aria-hidden="true">
          <g fill="#111111">
            <rect x="3" y="9" width="4" height="12" />
            <rect x="10" y="3" width="4" height="18" />
            <rect x="17" y="12" width="4" height="9" />
            <rect x="3" y="3" width="4" height="4" />
            <rect x="17" y="3" width="4" height="7" />
          </g>
        </svg>
      );
    case "excel":
      return (
        <svg viewBox="0 0 24 24" style={ICON_STYLE} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#111111" />
          <path
            d="M8 8l8 8M16 8l-8 8"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="butt"
          />
        </svg>
      );
    case "git":
      return (
        <svg viewBox="0 0 24 24" style={ICON_STYLE} aria-hidden="true">
          <path d="M12 2l10 10-10 10L2 12z" fill="#111111" />
          <g fill="#FFFFFF">
            <circle cx="9.5" cy="14.5" r="1.5" />
            <circle cx="9.5" cy="7.8" r="1.5" />
            <circle cx="14.5" cy="10.8" r="1.5" />
          </g>
          <path
            d="M9.5 9.3v4M9.5 12.2C9.5 10.8 11.5 10.8 13 10.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.3"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" style={ICON_STYLE} aria-hidden="true">
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            fill="none"
            stroke="#111111"
            strokeWidth="1.8"
            strokeDasharray="3 3"
          />
        </svg>
      );
  }
}

function ToolCard({
  tool,
  index,
  delay,
}: {
  tool: PublicTool;
  index: number;
  delay: number;
}) {
  const rotate = ROTATIONS[index % ROTATIONS.length];

  return (
    // Pembungkus membawa animasi masuk; kartu di dalamnya membawa putaran miring.
    <div className="tl-k" style={tunda(delay)}>
      <div
        className="relative flex aspect-[1/1.05] w-full flex-col items-center justify-center bg-surface shadow-[3px_5px_14px_rgba(0,0,0,0.18)]"
        style={{
          transform: `rotate(${rotate}deg)`,
          gap: "calc(var(--w) * 0.09)",
        }}
      >
        {/* Selotip */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-border opacity-[0.85]"
          style={{
            top: "calc(var(--w) * -0.065)",
            width: "calc(var(--w) * 0.42)",
            height: "calc(var(--w) * 0.13)",
          }}
        />

        {tool.iconUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.iconUrl}
              alt=""
              className="object-contain"
              style={ICON_STYLE}
            />
          </>
        ) : (
          <BuiltInIcon kind={builtInKind(tool.name)} />
        )}

        <div
          className="max-w-full break-words text-center font-hand font-bold leading-none text-foreground"
          style={{
            fontSize: "calc(var(--w) * 0.16)",
            paddingLeft: "calc(var(--w) * 0.05)",
            paddingRight: "calc(var(--w) * 0.05)",
          }}
        >
          {tool.name}
        </div>
      </div>
    </div>
  );
}

export default function ToolsSection({ tools }: { tools: PublicTool[] }) {
  const count = String(tools.length).padStart(2, "0");

  const a = pilihKolom(tools.length, PROFIL_A.lebar, PROFIL_A.tinggi);
  const b = pilihKolom(tools.length, PROFIL_B.lebar, PROFIL_B.tinggi);
  const scale = {
    "--ca": a.cols,
    "--ka": a.k,
    "--kwa": a.kw,
    "--cb": b.cols,
    "--kb": b.k,
    "--kwb": b.kw,
  } as CSSProperties;

  // Jeda antarkartu mengecil kalau tools banyak, supaya total tetap singkat.
  const jedaKartu =
    tools.length > 1
      ? Math.min(JEDA_KARTU_MAKS, TOTAL_JEDA_KARTU_MAKS / (tools.length - 1))
      : 0;

  return (
    <div className="tools-scale relative flex flex-col gap-3" style={scale}>
      <style>{SCALE_CSS + ANIMASI_CSS}</style>

      <DecorLine />

      <div className="mt-4 flex flex-col items-center justify-center gap-10 lg:flex-row lg:gap-16 lg:px-16">
        {/* Teks kiri */}
        <div className="flex w-full max-w-[420px] flex-col gap-[18px] lg:max-w-[340px] lg:flex-[0_1_340px]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            <Huruf teks="Tools · Stack" mulai={0.1} jeda={0.035} durasi={1.4} ax={0} ay={-16} />
          </div>
          <h1 className="font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground [font-size:clamp(44px,min(6.5vw,calc((100svh_-_300px)_*_0.33)),92px)]">
            <Huruf teks="my" mulai={0.25} jeda={0.1} durasi={1.8} ax={-60} ay={0} />{" "}
            <span className="font-serif font-normal italic tracking-normal [font-size:1.13em]">
              <Huruf teks="tools." mulai={0.55} jeda={0.12} durasi={1.8} ax={60} ay={-30} />
            </span>
          </h1>
          <p className="tl-naik m-0 text-[16px] leading-[1.7] text-charcoal" style={tunda(1)}>
            Alat yang aku pakai untuk mengolah, menganalisis, dan menyajikan data.
          </p>
          <div
            className="tl-naik font-serif text-[13px] italic leading-[1.4] text-muted"
            style={tunda(1.2)}
          >
            fig. 1 — {count} tools
          </div>
        </div>

        {/* Kartu tools */}
        {tools.length === 0 ? (
          <p className="tl-naik text-muted" style={tunda(0.8)}>
            Belum ada tools untuk ditampilkan.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 p-3.5 sm:grid-cols-3 lg:[gap:calc(var(--w)_*_0.24)_calc(var(--w)_*_0.2)] lg:[grid-template-columns:repeat(var(--cols),var(--w))]">
            {tools.map((tool, i) => (
              <ToolCard
                key={tool.name}
                tool={tool}
                index={i}
                delay={MULAI_KARTU + i * jedaKartu}
              />
            ))}
          </div>
        )}
      </div>

      {/* Petunjuk swipe (mobile saja), gaya sama dengan Home: << teks >> berkedip lembut */}
      <div
        aria-hidden="true"
        className="pointer-events-none flex items-center justify-center pb-4 pt-6 sm:hidden"
      >
        <div className="tl-geser flex items-center gap-2">
          <PanahGanda arah="kiri" className="h-4 w-4 shrink-0 text-border" />
          <p className="whitespace-nowrap text-label uppercase text-muted">
            swipe right · swipe left
          </p>
          <PanahGanda arah="kanan" className="h-4 w-4 shrink-0 text-border" />
        </div>
      </div>
    </div>
  );
}