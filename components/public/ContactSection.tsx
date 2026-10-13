import type { CSSProperties } from "react";
import { DecorLine } from "./PageChrome";
import type { ContactLink } from "../../lib/contact-links";

// Satuan skala: --u = 1px pada skala mockup / 10. Di desktop mengecil mengikuti
// tinggi layar supaya muat satu layar. Angka 185px = perkiraan tinggi elemen
// lain (belum diukur presisi). Pembagi (tinggi amplop dalam satuan --u) dihitung
// dari jumlah baris link, lihat tinggiKartu().
function buatScaleCss(tinggiKartu: number) {
  return `.contact-scale{--u:8px}@media (min-width:1024px){.contact-scale{--u:clamp(4px,calc((100svh - 185px) / ${tinggiKartu}),10px)}}`;
}

// Perkiraan tinggi amplop (satuan --u), BELUM diukur:
//   ujung tutup 5 + padding atas kertas 3 + kop surat 12,8 + dua jarak 3,2
//   + padding bawah kertas (jarak 1,6 + saku 8) 9,6 - jarak baris terakhir 1,2
//   = sekitar 32,4, dibulatkan jadi 33, ditambah 8,4 per baris link.
// Mulai 4 link tampil dua kolom, jadi baris = ceil(n / 2).
function tinggiKartu(jumlahLink: number) {
  const baris = jumlahLink <= 3 ? jumlahLink : Math.ceil(jumlahLink / 2);
  return Math.max(48, Math.round(33 + 8.4 * baris));
}

const u = (n: number) => `calc(var(--u) * ${n})`;
// Ukuran dengan batas minimum supaya teks kecil tetap terbaca.
const sz = (min: number, n: number) => `max(${min}px, ${u(n)})`;

// Warna garis/amplop (token Tailwind: border #BDBDBD, surface #EBEBEB, foreground #111).
const GARIS = "#BDBDBD";

// ---------------------------------------------------------------------------
// Animasi masuk (gaya sama dengan Home, About, Project, Tools, Detail). CSS
// murni, awalan ct-. Jalan saat komponen dipasang, termasuk lewat tombol panah.
// prefers-reduced-motion mematikan semua.
//  - label: per huruf dari atas                          (mulai 0,1s)
//  - "let's": per huruf dari kiri                        (mulai 0,25s)
//  - "connect.": per huruf dari kanan-atas               (mulai 0,6s)
//  - paragraf: naik + blur                               (1,0s)
//  - amplop: naik dari bawah, blur ke tajam              (0,6s)
//  - kertas surat: terangkat keluar dari amplop          (1,1s)
//  - sticky note: ditempel dari atas sambil berputar     (1,35s)
//  - konfeti: pop satu per satu, lalu melayang pelan     (1,9s dst)
// Animasi amplop dipasang di pembungkus; kertas dan sticky punya transform
// sendiri, jadi keyframe-nya menyertakan putaran akhirnya.
// ---------------------------------------------------------------------------
const ANIMASI_CSS = `
@keyframes ct-huruf{
  0%{opacity:0;transform:translate3d(var(--ax,0px),var(--ay,0px),0);filter:blur(10px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes ct-naik{
  0%{opacity:0;transform:translate3d(0,18px,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes ct-amplop{
  0%{opacity:0;transform:translate3d(0,56px,0) scale(.96);filter:blur(12px)}
  100%{opacity:1;transform:none;filter:none}
}
@keyframes ct-kertas{
  0%{opacity:0;transform:translate3d(0,calc(var(--u) * 6),0);filter:blur(6px)}
  100%{opacity:1;transform:none;filter:none}
}
@keyframes ct-tempel{
  0%{opacity:0;transform:translate3d(0,-18px,0) rotate(-14deg) scale(.85);filter:blur(8px)}
  100%{opacity:1;transform:rotate(-4deg);filter:none}
}
@keyframes ct-pop{
  0%{opacity:0;transform:scale(.2)}
  60%{opacity:1;transform:scale(1.15)}
  100%{opacity:1;transform:scale(1)}
}
@keyframes ct-melayang{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(calc(var(--u) * -0.7))}
}
.ct-h{display:inline-block;animation:ct-huruf 1.8s cubic-bezier(.22,1,.36,1) both}
.ct-naik{animation:ct-naik 1.5s cubic-bezier(.22,1,.36,1) both}
.ct-amplop{animation:ct-amplop 1.8s cubic-bezier(.22,1,.36,1) both}
.ct-kertas{animation:ct-kertas 1.6s cubic-bezier(.22,1,.36,1) both}
.ct-tempel{animation:ct-tempel 1.3s cubic-bezier(.22,1,.36,1) both}
.ct-c{animation:ct-pop .9s cubic-bezier(.34,1.56,.64,1) both}
.ct-f{animation:ct-melayang 5s ease-in-out infinite}
@keyframes ct-geser-kedip{
  0%,100%{opacity:.5}
  50%{opacity:1}
}
.ct-geser{animation:ct-geser-kedip 2.5s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){
  .ct-h,.ct-naik,.ct-amplop,.ct-kertas,.ct-tempel,.ct-c,.ct-f,.ct-geser{animation:none}
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
                    className="ct-h"
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

// Konfeti di sekitar amplop (monokrom). x/y = posisi dalam persen terhadap
// pembungkus amplop; ukuran dalam satuan --u; rot dalam derajat.
type Konfeti = {
  x: string;
  y: string;
  bentuk: "kotak" | "bulat" | "bintang";
  ukuran: number;
  rot: number;
  warna: string;
};

const KONFETI: Konfeti[] = [
  { x: "-4%", y: "14%", bentuk: "kotak", ukuran: 1.8, rot: 28, warna: "#111111" },
  { x: "97%", y: "9%", bentuk: "kotak", ukuran: 1.6, rot: -35, warna: GARIS },
  { x: "-6%", y: "44%", bentuk: "bintang", ukuran: 3, rot: 0, warna: "#111111" },
  { x: "101%", y: "34%", bentuk: "bulat", ukuran: 1, rot: 0, warna: GARIS },
  { x: "-2%", y: "78%", bentuk: "kotak", ukuran: 1.6, rot: 62, warna: GARIS },
  { x: "99%", y: "68%", bentuk: "kotak", ukuran: 1.8, rot: -20, warna: "#111111" },
  { x: "90%", y: "-3%", bentuk: "bintang", ukuran: 2.2, rot: 0, warna: GARIS },
  { x: "9%", y: "3%", bentuk: "bulat", ukuran: 1.2, rot: 0, warna: "#111111" },
  { x: "52%", y: "-6%", bentuk: "kotak", ukuran: 1.5, rot: 70, warna: "#111111" },
  { x: "103%", y: "88%", bentuk: "bulat", ukuran: 1.4, rot: 0, warna: "#111111" },
];

function BentukKonfeti({ c }: { c: Konfeti }) {
  if (c.bentuk === "kotak") {
    return (
      <span
        className="block"
        style={{
          width: u(c.ukuran),
          height: u(c.ukuran * 0.42),
          background: c.warna,
          transform: `rotate(${c.rot}deg)`,
        }}
      />
    );
  }
  if (c.bentuk === "bulat") {
    return (
      <span
        className="block rounded-full"
        style={{ width: u(c.ukuran), height: u(c.ukuran), background: c.warna }}
      />
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ width: u(c.ukuran), height: u(c.ukuran), display: "block" }}
    >
      <path
        d="M12 2C12.8 8.5 15.5 11.2 22 12C15.5 12.8 12.8 15.5 12 22C11.2 15.5 8.5 12.8 2 12C8.5 11.2 11.2 8.5 12 2Z"
        fill={c.warna}
      />
    </svg>
  );
}

type Jenis = "github" | "linkedin" | "email" | "lain";

// Hanya http, https, dan mailto yang dirender sebagai tautan.
const urlAman = (url: string) => /^(https?:\/\/|mailto:)/i.test(url);
const urlGambarAman = (url: string | null) =>
  !!url && /^https?:\/\//i.test(url);

function jenisLink(l: ContactLink): Jenis {
  const nama = l.appName.toLowerCase();
  if (nama.includes("github")) return "github";
  if (nama.includes("linkedin")) return "linkedin";
  if (/^mailto:/i.test(l.url) || nama.includes("mail")) return "email";
  return "lain";
}

function teksLink(url: string) {
  if (/^mailto:/i.test(url)) return url.replace(/^mailto:/i, "");
  return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

const ext = (l: ContactLink) =>
  /^https?:\/\//i.test(l.url)
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

function IconBox({ link, box }: { link: ContactLink; box: number }) {
  const jenis = jenisLink(link);
  const adaLogo = urlGambarAman(link.iconUrl);

  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden bg-background shadow-[0_2px_10px_rgba(0,0,0,0.14)]"
      style={{ width: u(box), height: u(box), borderRadius: u(1.2) }}
    >
      {adaLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={link.iconUrl as string}
          alt=""
          className="block h-full w-full object-contain grayscale"
          style={{ padding: u(0.7) }}
        />
      ) : jenis === "email" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#111111"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          aria-hidden="true"
          style={{ width: sz(14, 2.2), height: sz(14, 2.2) }}
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      ) : (
        <span
          className="font-extrabold tracking-[-0.02em] text-foreground"
          style={{ fontSize: sz(11, jenis === "github" ? 1.5 : 1.7) }}
        >
          {jenis === "github"
            ? "GH"
            : jenis === "linkedin"
              ? "in"
              : link.appName.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

// Tinggi tutup amplop (satuan --u) dan tinggi saku depan.
const TUTUP = 9;
const SAKU = 8;
const RADIUS = 1.6;

export default function ContactSection({
  links,
  fotoUrl,
}: {
  links: ContactLink[];
  fotoUrl: string;
}) {
  const daftar = links.filter((l) => urlAman(l.url));
  const dua = daftar.length > 3;

  return (
    <div className="contact-scale relative flex flex-col gap-3">
      <style>{buatScaleCss(tinggiKartu(daftar.length)) + ANIMASI_CSS}</style>

      <DecorLine />

      <div
        className="mt-4 flex flex-col items-center justify-center lg:mt-2 lg:flex-row lg:px-16"
        style={{ gap: u(7.2) }}
      >
        {/* Kolom kiri */}
        <div
          className="flex w-full max-w-[420px] flex-col lg:min-w-0 lg:max-w-none lg:[flex:0_1_calc(var(--u)_*_40)]"
          style={{ gap: u(1.8) }}
        >
          <div
            className="font-semibold uppercase tracking-[0.08em] text-muted"
            style={{ fontSize: sz(10, 1.2) }}
          >
            <Huruf
              teks="Contact · Say hi"
              mulai={0.1}
              jeda={0.035}
              durasi={1.4}
              ax={0}
              ay={-16}
            />
          </div>
          <h1
            className="m-0 font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground"
            style={{ fontSize: sz(40, 9.2) }}
          >
            <Huruf
              teks="let's"
              mulai={0.25}
              jeda={0.1}
              durasi={1.8}
              ax={-60}
              ay={0}
            />{" "}
            <span
              className="font-serif font-normal italic tracking-normal"
              style={{ fontSize: "1.13em" }}
            >
              <Huruf
                teks="connect."
                mulai={0.6}
                jeda={0.1}
                durasi={1.8}
                ax={60}
                ay={-30}
              />
            </span>
          </h1>
          <p
            className="ct-naik m-0 leading-[1.7] text-charcoal"
            style={{ fontSize: sz(12, 1.6), ...tunda(1) }}
          >
            Terbuka untuk berkenalan, berdiskusi, dan berkolaborasi.
          </p>

          {/* Sticky note */}
          <div
            className="ct-tempel relative flex items-center justify-center self-start bg-surface text-center font-hand font-bold leading-none text-foreground shadow-[3px_5px_12px_rgba(0,0,0,0.18)]"
            style={{
              width: u(17),
              height: u(12),
              marginTop: u(1.6),
              transform: "rotate(-4deg)",
              fontSize: sz(16, 3),
              ...tunda(1.35),
            }}
          >
            <div
              className="absolute bg-border opacity-[0.85]"
              style={{
                top: u(-1.2),
                left: u(6),
                width: u(5),
                height: u(2),
              }}
            />
            <span>
              Open
              <br />
              to work!
            </span>
          </div>
        </div>

        {/* Amplop kanan */}
        <div
          className="ct-amplop relative w-full lg:min-w-0 lg:[flex:1_1_calc(var(--u)_*_48)]"
          style={{ maxWidth: u(62), paddingTop: u(TUTUP), ...tunda(0.6) }}
        >
          {/* Konfeti */}
          {KONFETI.map((c, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="ct-c pointer-events-none absolute"
              style={{
                left: c.x,
                top: c.y,
                animationDelay: `${(1.9 + i * 0.08).toFixed(2)}s`,
              }}
            >
              <span
                className="ct-f block"
                style={{
                  animationDelay: `${(3 + i * 0.35).toFixed(2)}s`,
                  animationDuration: `${(4.5 + (i % 3) * 0.8).toFixed(1)}s`,
                }}
              >
                <BentukKonfeti c={c} />
              </span>
            </span>
          ))}

          {/* Tutup amplop (terbuka, menghadap atas) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            className="absolute left-0 top-0 w-full"
            style={{ height: u(TUTUP) }}
          >
            <polygon
              points="0,30 50,0 100,30"
              fill="#D9D9D9"
              stroke={GARIS}
              strokeWidth="1"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Badan amplop (bagian belakang) */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 shadow-[3px_5px_14px_rgba(0,0,0,0.16)]"
            style={{
              top: u(TUTUP),
              background: "#E6E6E6",
              border: `1px solid ${GARIS}`,
              borderRadius: `0 0 ${u(RADIUS)} ${u(RADIUS)}`,
            }}
          />

          {/* Kertas surat: terangkat keluar dari amplop. Pembungkusnya memotong
              bagian bawah supaya kertas tidak muncul di luar amplop saat animasi. */}
          <div
            className="relative z-10 mx-auto"
            style={{
              width: "86%",
              marginTop: u(-4),
              clipPath: "inset(-80px -80px 0 -80px)",
            }}
          >
            <div
              className="ct-kertas flex flex-col bg-background"
              style={{
                padding: `${u(3)} ${u(2.6)} ${u(SAKU + 1.6)}`,
                gap: u(1.6),
                border: `1px solid ${GARIS}`,
                borderRadius: `${u(0.6)} ${u(0.6)} 0 0`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                ...tunda(1.1),
              }}
            >
              {/* Kop surat: foto + nama + ikon kecil */}
              <div className="flex items-center" style={{ gap: u(2.4) }}>
                {/* Foto (berwarna, tanpa filter hitam-putih) */}
                <div
                  className="relative shrink-0"
                  style={{ width: u(12), height: u(12) }}
                >
                  <div className="h-full w-full overflow-hidden rounded-full border-[3px] border-foreground bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fotoUrl}
                      alt="Foto Evi Fauziah"
                      className="block h-full w-full object-cover [object-position:50%_26%]"
                    />
                  </div>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground font-extrabold uppercase tracking-[0.08em] text-background"
                    style={{
                      bottom: u(-0.8),
                      fontSize: sz(8, 0.9),
                      padding: `${sz(3, 0.5)} ${sz(8, 1.2)}`,
                    }}
                  >
                    Open to work
                  </div>
                </div>

                <div
                  className="flex min-w-0 flex-col"
                  style={{ gap: u(0.8) }}
                >
                  <div
                    className="font-extrabold tracking-[-0.02em] text-foreground"
                    style={{ fontSize: sz(16, 2.2) }}
                  >
                    Evi Fauziah
                  </div>
                  {/* Ikon kecil */}
                  <div className="flex flex-wrap" style={{ gap: u(0.8) }}>
                    {daftar.map((l) => (
                      <a
                        key={l.id}
                        href={l.url}
                        aria-label={l.appName}
                        {...ext(l)}
                      >
                        <IconBox link={l} box={3.6} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {daftar.length > 0 ? (
                <>
                  {/* Garis pemisah tipis */}
                  <div
                    aria-hidden="true"
                    style={{ borderTop: `1px dashed ${GARIS}` }}
                  />

                  {/* Baris link: satu kolom sampai 3 link, dua kolom mulai 4 link */}
                  <div
                    className={
                      dua ? "grid w-full grid-cols-2" : "flex w-full flex-col"
                    }
                    style={{ gap: u(1.2) }}
                  >
                    {daftar.map((l) => (
                      <a
                        key={l.id}
                        href={l.url}
                        {...ext(l)}
                        className="group/baris flex min-w-0 items-center border border-border bg-background text-foreground no-underline motion-safe:transition-colors hover:bg-surface"
                        style={{
                          gap: u(dua ? 1.2 : 1.6),
                          borderRadius: u(1.4),
                          padding: `${u(1.4)} ${u(1.8)}`,
                        }}
                      >
                        <IconBox link={l} box={4.4} />
                        <div
                          className="flex min-w-0 flex-1 flex-col"
                          style={{ gap: u(0.2) }}
                        >
                          <div
                            className="truncate font-semibold uppercase tracking-[0.08em] text-muted"
                            style={{ fontSize: sz(9, 1.1) }}
                          >
                            {l.appName}
                          </div>
                          <div
                            className="truncate font-semibold leading-[1.3] text-foreground"
                            style={{ fontSize: sz(12, 1.6) }}
                          >
                            {teksLink(l.url)}
                          </div>
                        </div>
                        {dua ? null : (
                          <div
                            aria-hidden="true"
                            className="flex shrink-0 items-center justify-center rounded-full bg-foreground text-background"
                            style={{
                              width: u(3.6),
                              height: u(3.6),
                              minWidth: 22,
                              minHeight: 22,
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="-rotate-45 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(.22,1,.36,1)] group-hover/baris:rotate-0 group-focus-visible/baris:rotate-0"
                              style={{ width: "52%", height: "52%" }}
                            >
                              <path d="M5 12h14" />
                              <path d="M13 6l6 6-6 6" />
                            </svg>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Saku depan amplop: tepi atasnya berbentuk V, menutupi bagian bawah kertas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 overflow-hidden"
            style={{
              height: u(SAKU),
              borderRadius: `0 0 ${u(RADIUS)} ${u(RADIUS)}`,
              border: `1px solid ${GARIS}`,
              borderTop: "none",
            }}
          >
            <svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <polygon points="0,0 50,22 100,0 100,40 0,40" fill="#EBEBEB" />
              <polyline
                points="0,0 50,22 100,0"
                fill="none"
                stroke={GARIS}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* Cap pos kecil di saku (gelombang + lingkaran) */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={GARIS}
              strokeWidth="1"
              strokeLinecap="round"
              className="absolute"
              style={{
                right: u(6),
                bottom: u(0.6),
                width: u(5),
                height: u(5),
                transform: "rotate(-12deg)",
              }}
            >
              <circle cx="16" cy="12" r="7" />
              <path d="M1 8q2-2 4 0t4 0t4 0" />
              <path d="M1 12q2-2 4 0t4 0t4 0" />
              <path d="M1 16q2-2 4 0t4 0t4 0" />
            </svg>
          </div>
        </div>
      </div>

      {/* Petunjuk swipe (mobile saja), gaya sama dengan Home: << teks >> berkedip lembut */}
      <div
        aria-hidden="true"
        className="pointer-events-none flex items-center justify-center pb-4 pt-6 sm:hidden"
      >
        <div className="ct-geser flex items-center gap-2">
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