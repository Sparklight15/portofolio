import { Fragment } from "react";
import type { CSSProperties } from "react";
import { HOME_DEFAULT } from "../../lib/home-defaults";
import { DecorLine, PageArrow } from "./PageChrome";

// Konten Home yang bisa diatur admin. null/kosong = pakai nilai bawaan.
export type HomeKonten = {
  kicker1?: string | null;
  kicker2?: string | null;
  greeting?: string | null;
  label1?: string | null;
  label2?: string | null;
  label3?: string | null;
  imageUrl?: string | null;
};

// Ukuran dasar teks raksasa.
const heroVars = {
  "--hero": "clamp(96px, min(33vw, calc((100svh - 221px) / 1.657)), 350px)",
} as CSSProperties;

const ANIMASI_CSS = `
@keyframes hero-huruf-kiri{
  0%{opacity:0;transform:translate3d(-0.6em,-0.18em,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes hero-huruf-kanan{
  0%{opacity:0;transform:translate3d(0.7em,-0.18em,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes hero-label-kiri{
  0%{opacity:0;transform:translate3d(-1.2em,-0.3em,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes hero-label-atas{
  0%{opacity:0;transform:translate3d(0,-1.2em,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes hero-label-kanan{
  0%{opacity:0;transform:translate3d(1.2em,-0.3em,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes hero-sapaan-pop{
  0%{opacity:0;scale:0.6}
  100%{opacity:1;scale:1}
}
@keyframes hero-bingkai-masuk{
  0%{opacity:0;transform:scale(0.96);filter:blur(18px)}
  60%{opacity:1}
  100%{opacity:1;transform:scale(1);filter:blur(0)}
}
@keyframes hero-karakter-naik{
  0%{opacity:0;transform:translate3d(0,70%,0);filter:blur(12px) contrast(0.35) brightness(1.6)}
  35%{opacity:1}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0) contrast(1) brightness(1)}
}
@keyframes hero-goyang{
  0%{transform:translateY(0) rotate(0deg);animation-timing-function:cubic-bezier(.61,1,.88,1)}
  25%{transform:translateY(-0.6%) rotate(-2.5deg);animation-timing-function:cubic-bezier(.37,0,.63,1)}
  75%{transform:translateY(-0.6%) rotate(2.5deg);animation-timing-function:cubic-bezier(.12,0,.39,0)}
  100%{transform:translateY(0) rotate(0deg)}
}
@keyframes hero-bintang-masuk{
  0%{opacity:0;transform:scale(0.3) rotate(-60deg);filter:blur(10px)}
  60%{opacity:1}
  100%{opacity:1;transform:scale(1) rotate(0deg);filter:blur(0)}
}
@keyframes hero-bintang-melayang{
  0%{transform:translateY(0) rotate(0deg) scale(1);animation-timing-function:cubic-bezier(.37,0,.63,1)}
  50%{transform:translateY(-8%) rotate(var(--rot)) scale(1.1);animation-timing-function:cubic-bezier(.37,0,.63,1)}
  100%{transform:translateY(0) rotate(0deg) scale(1)}
}
/* Petunjuk swipe: berkedip lembut (opacity saja) */
@keyframes hero-geser-kedip{
  0%, 100% {opacity:0.5;}
  50% {opacity:1;}
}
.hero-geser-petunjuk{
  animation: hero-geser-kedip 2.5s ease-in-out infinite;
}
.hero-huruf{display:inline-block}
.hero-kiri,.hero-kanan{will-change:transform,opacity,filter;backface-visibility:hidden}
.hero-kiri{animation:hero-huruf-kiri 2.2s cubic-bezier(.33,1,.68,1) both;animation-delay:calc(.3s + var(--i) * .14s)}
.hero-kanan{animation:hero-huruf-kanan 2.2s cubic-bezier(.33,1,.68,1) both;animation-delay:calc(.5s + var(--i) * .11s)}
.hero-lb-kiri{animation:hero-label-kiri 1.6s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--d) + var(--i) * .04s)}
.hero-lb-atas{animation:hero-label-atas 1.6s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--d) + var(--i) * .04s)}
.hero-lb-kanan{animation:hero-label-kanan 1.6s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--d) + var(--i) * .04s)}
.hero-sapaan{animation:hero-sapaan-pop 1s cubic-bezier(.22,1,.36,1) 1.6s both}
.hero-bingkai{animation:hero-bingkai-masuk 1.8s cubic-bezier(.33,1,.68,1) .6s both}
.hero-karakter{animation:hero-karakter-naik 2.6s cubic-bezier(.22,1,.36,1) 1.2s both}
.hero-goyang{transform-origin:50% 100%;animation:hero-goyang 3.4s linear 3s infinite}
.hero-bintang{transform-box:fill-box;transform-origin:center;will-change:transform,opacity,filter;animation:hero-bintang-masuk 1.4s cubic-bezier(.22,1,.36,1) var(--b) both,hero-bintang-melayang var(--dur) linear calc(var(--b) + 1.4s) infinite}
.hero-bintang-a{--dur:5s;--rot:18deg}
.hero-bintang-b{--dur:6.2s;--rot:-14deg}
@media (prefers-reduced-motion:reduce){
  .hero-kiri,.hero-kanan,.hero-lb-kiri,.hero-lb-atas,.hero-lb-kanan,.hero-sapaan,.hero-bingkai,.hero-karakter,.hero-goyang,.hero-bintang,.hero-geser-petunjuk{animation:none}
}
`;

function Huruf({ teks, arah }: { teks: string; arah: "kiri" | "kanan" }) {
  return (
    <>
      {Array.from(teks).map((h, i) => (
        <span
          key={i}
          className={`hero-huruf ${arah === "kiri" ? "hero-kiri" : "hero-kanan"}`}
          style={{ "--i": i } as CSSProperties}
        >
          {h}
        </span>
      ))}
    </>
  );
}

function HurufLabel({
  teks,
  arah,
  mulai,
}: {
  teks: string;
  arah: "kiri" | "atas" | "kanan";
  mulai: string;
}) {
  const kelas =
    arah === "kiri"
      ? "hero-lb-kiri"
      : arah === "atas"
        ? "hero-lb-atas"
        : "hero-lb-kanan";
  return (
    <span className="whitespace-nowrap">
      {Array.from(teks).map((h, i) => (
        <span
          key={i}
          className={`hero-huruf ${kelas}`}
          style={
            { "--i": i, "--d": mulai, whiteSpace: "pre" } as CSSProperties
          }
        >
          {h}
        </span>
      ))}
    </span>
  );
}

// Animasi huruf untuk teks kicker di atas hero. Huruf dikelompokkan per
// kata (nowrap per kata) supaya teks tetap bisa turun baris di layar sempit
// tanpa terpotong di tengah kata.
function HurufKicker({
  teks,
  arah,
  mulai,
}: {
  teks: string;
  arah: "kiri" | "kanan";
  mulai: string;
}) {
  const kelas = arah === "kiri" ? "hero-lb-kiri" : "hero-lb-kanan";
  const kata = teks.split(" ").filter(Boolean);
  let nomor = 0;
  return (
    <span aria-label={teks}>
      <span aria-hidden="true">
        {kata.map((k, ki) => (
          <Fragment key={ki}>
            {ki > 0 ? " " : null}
            <span className="whitespace-nowrap">
              {Array.from(k).map((h, hi) => {
                const i = nomor++;
                return (
                  <span
                    key={hi}
                    className={`hero-huruf ${kelas}`}
                    style={{ "--i": i, "--d": mulai } as CSSProperties}
                  >
                    {h}
                  </span>
                );
              })}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}

// BARU: ikon panah ganda tipis (<< atau >>) untuk petunjuk swipe.
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

function Bintang({
  className,
  mulai,
  varian = "a",
}: {
  className?: string;
  mulai: string;
  varian?: "a" | "b";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`hero-bintang hero-bintang-${varian} ${className ?? ""}`}
      style={{ "--b": mulai } as CSSProperties}
    >
      <path
        d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function teksAtauBawaan(nilai: string | null | undefined, bawaan: string) {
  return nilai && nilai.trim() ? nilai : bawaan;
}

export function HomeHero({ konten }: { konten?: HomeKonten }) {
  const kicker1 = teksAtauBawaan(konten?.kicker1, HOME_DEFAULT.kicker1);
  const kicker2 = teksAtauBawaan(konten?.kicker2, HOME_DEFAULT.kicker2);
  const sapaan = teksAtauBawaan(konten?.greeting, HOME_DEFAULT.greeting);
  const label1 = teksAtauBawaan(konten?.label1, HOME_DEFAULT.label1);
  const label2 = teksAtauBawaan(konten?.label2, HOME_DEFAULT.label2);
  const label3 = teksAtauBawaan(konten?.label3, HOME_DEFAULT.label3);

  const gambarKustom =
    konten?.imageUrl && /^https?:\/\//i.test(konten.imageUrl)
      ? konten.imageUrl
      : null;
  const gambarSrc = gambarKustom ?? HOME_DEFAULT.image;

  return (
    <section className="flex flex-col flex-1 relative w-full">
      <style>{ANIMASI_CSS}</style>

      {/* Garis dekoratif tetap di posisinya (paling atas) */}
      <DecorLine />

      {/* Pembungkus relatif agar elemen absolute di dalamnya menempel ke area ini */}
      <div className="relative flex flex-col flex-1 w-full pt-4 sm:pt-6">
        
        {/* Teks kicker: di mobile ikut alur layout dengan jarak bawah (mb-10)
            supaya kepala karakter dan bubble sapaan tidak menyentuhnya;
            di sm ke atas melayang absolute di atas seperti sebelumnya.
            Beranimasi: kicker1 dari kiri, kicker2 dari kanan. */}
        <div className="relative z-10 mb-10 flex flex-col items-center gap-2 text-center text-label uppercase text-muted sm:absolute sm:inset-x-0 sm:top-10 sm:mb-0 sm:flex-row sm:justify-between sm:gap-1 sm:text-left">
          <HurufKicker teks={kicker1} arah="kiri" mulai="0.2s" />
          <HurufKicker teks={kicker2} arah="kanan" mulai="0.4s" />
        </div>

        {/* Pembungkus Hero Utama */}
        <div className="flex flex-col flex-1 items-center justify-center w-full pb-[12vh] sm:pb-0">
          
          {/* Area hero */}
          <div
            style={heroVars}
            className="relative flex w-full h-[calc(var(--hero)*1.657)] flex-col items-center justify-center"
          >
            <h1 className="sr-only">Portofolio Evi Fauziah</h1>

            <div
              aria-hidden="true"
              className="relative z-[1] text-[length:var(--hero)] font-extrabold leading-[0.86] tracking-[-0.03em] text-foreground"
            >
              <Huruf teks="port" arah="kiri" />
              <div className="hero-sapaan absolute left-[calc(var(--hero)*0.357)] top-[calc(var(--hero)*0.01)] -rotate-[8deg] whitespace-nowrap rounded-full border-2 border-foreground bg-background px-3 sm:px-[18px] pb-1 pt-0.5 sm:pb-1.5 sm:pt-0.5 font-hand text-[length:clamp(14px,calc(var(--hero)*0.0914),32px)] font-bold leading-[1.1] tracking-normal text-foreground">
                {sapaan}
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative z-[4] mt-1 h-[calc(var(--hero)*1.057)] font-serif text-[length:var(--hero)] font-normal italic leading-[0.86] text-foreground"
            >
              <Huruf teks="folio." arah="kanan" />
            </div>

            <div className="absolute left-1/2 top-1/2 z-[2] aspect-[336/440] w-[calc(var(--hero)*0.96)] -translate-x-1/2 -translate-y-1/2">
              <div className="hero-bingkai absolute inset-0 rounded-[calc(var(--hero)*0.08)] border-[3px] border-foreground bg-surface shadow-[6px_6px_0_0_#111111] md:shadow-[10px_10px_0_0_#111111]" />

              <div className="absolute inset-0 [clip-path:inset(-300px_3px_3px_3px)]">
                <div className="hero-karakter absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gambarSrc}
                    width={gambarKustom ? undefined : 768}
                    height={gambarKustom ? undefined : 1129}
                    alt={
                      gambarKustom
                        ? "Ilustrasi karakter Evi Fauziah"
                        : "Ilustrasi tinta hitam-putih perempuan berambut panjang melambaikan tangan"
                    }
                    fetchPriority="high"
                    decoding="async"
                    className="hero-goyang absolute left-0 top-[-13.6%] block h-auto w-[101.2%]"
                  />
                </div>
              </div>
            </div>

            {/* Posisi bintang */}
            <Bintang
              mulai="2s"
              varian="a"
              className="absolute right-[2%] top-[26%] z-[3] h-6 w-6 text-foreground md:h-14 md:w-14 md:right-[12.5%]"
            />
            <Bintang
              mulai="2.3s"
              varian="b"
              className="absolute bottom-[14%] left-[2%] z-[3] h-4 w-4 text-muted md:h-7 md:w-7 md:left-[10%]"
            />
          </div>

          {/* Baris identitas */}
          <div className="mt-14 sm:mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-serif text-[length:clamp(14px,2vw,24px)] italic leading-tight text-charcoal">
            <HurufLabel teks={label1} arah="kiri" mulai="0.9s" />
            <Bintang mulai="1.1s" varian="a" className="h-4 w-4 text-foreground" />
            <HurufLabel teks={label2} arah="atas" mulai="1.2s" />
            <Bintang mulai="1.4s" varian="b" className="h-4 w-4 text-foreground" />
            <HurufLabel teks={label3} arah="kanan" mulai="1.5s" />
          </div>
        </div>
        
        {/* Petunjuk swipe (dekoratif). Teks tampil di mobile dan desktop;
            ikon << >> abu-abu tipis hanya di sm ke atas. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-6 z-20 flex items-center justify-center sm:bottom-3"
        >
          <div className="hero-geser-petunjuk flex items-center gap-3">
            <PanahGanda
              arah="kiri"
              className="hidden h-5 w-5 text-border sm:block"
            />
            <p className="text-label uppercase text-muted">
              swipe right · swipe left
            </p>
            <PanahGanda
              arah="kanan"
              className="hidden h-5 w-5 text-border sm:block"
            />
          </div>
        </div>

      </div>

      {/* Panah halaman (bawaan untuk desktop) */}
      <PageArrow href="/contact" label="Halaman sebelumnya" side="left" />
      <PageArrow href="/about" label="Halaman berikutnya" side="right" />
    </section>
  );
}