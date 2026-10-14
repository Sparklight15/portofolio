/* eslint-disable @next/next/no-html-link-for-pages -- sengaja <a> biasa: pindah halaman penuh supaya iframe video ikut dibuang */
import type { CSSProperties } from "react";
import type { ProjectDetailData } from "../../lib/public-projects";
import Muncul from "./Muncul";
import VideoYoutube from "./VideoYoutube";

function categoryLabel(category: string) {
  return category === "kuliah" ? "tugas kuliah" : category;
}

const TAG =
  "border-[1.5px] border-foreground px-[9px] py-[3px] text-[11px] font-semibold leading-[1.5]";

// Animasi masuk halaman detail project (gaya sama dengan Home, About, Project).
// CSS murni, tanpa library. prefers-reduced-motion mematikan semua.
// - Bagian atas (breadcrumb, nomor, label, judul, chip): langsung jalan dari
//   HTML server lewat keyframe pd-* (per huruf, blur ke tajam, arah berbeda).
// - Bagian yang bisa berada di bawah layar (deskripsi, tools, link, galeri,
//   penutup): dibungkus Muncul (keyframe pg-kartu, jalan saat pertama kali
//   terlihat). Aturan .pg-k di bawah sama persis dengan yang di ProjectGallery.
// - Foto utama di desktop (layar >= 1120px, kolom berdampingan) langsung jalan
//   lewat CSS (.pd-g0) tanpa menunggu hidrasi, dimulai sesudah judul.
const ANIMASI_CSS = `
.detail-bob{animation:detail-bob 1.6s ease-in-out infinite}
@keyframes detail-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
@keyframes pd-huruf{
  0%{opacity:0;transform:translate3d(var(--ax,0px),var(--ay,0px),0);filter:blur(10px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes pd-naik{
  0%{opacity:0;transform:translate3d(0,18px,0);filter:blur(8px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
@keyframes pd-pop{
  0%{opacity:0;transform:scale(.85);filter:blur(8px)}
  100%{opacity:1;transform:scale(1);filter:blur(0)}
}
.pd-h{display:inline-block;animation:pd-huruf 1.8s cubic-bezier(.22,1,.36,1) both}
.pd-naik{animation:pd-naik 1.5s cubic-bezier(.22,1,.36,1) both}
.pd-pop{animation:pd-pop 1.1s cubic-bezier(.22,1,.36,1) both}
@keyframes pg-kartu{
  0%{opacity:0;transform:translate3d(0,100px,0) scale(.97);filter:blur(12px)}
  100%{opacity:1;transform:none;filter:none}
}
.pg-k{opacity:0}
.pg-k-tampil{animation-name:pg-kartu;animation-duration:1.8s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both;animation-delay:var(--d,0s)}
.pd-g0{--d:1s}
@media (min-width:1120px){.pd-g0>.pg-k{animation-name:pg-kartu;animation-duration:1.8s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both;animation-delay:var(--d,0s)}}
@media (prefers-reduced-motion:reduce){
  .detail-bob,.pd-h,.pd-naik,.pd-pop{animation:none}
  .pg-k{opacity:1;animation:none!important}
}
`;

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
                    className="pd-h"
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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block self-start rounded-full border-2 border-foreground bg-background px-[18px] py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground shadow-[3px_3px_0_#111]">
      {children}
    </span>
  );
}

function Chevron({ size }: { size: number }) {
  return (
    <svg
      className="detail-bob"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#111111"
      strokeWidth="2.6"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M4.5 9L12 16.5L19.5 9" />
    </svg>
  );
}

function Placeholder({ label, size }: { label: string; size: string }) {
  return (
    <div
      className={`font-extrabold leading-[0.9] tracking-[-0.03em] text-transparent [-webkit-text-stroke:2px_#111] ${size}`}
    >
      {label}
    </div>
  );
}

export default function ProjectDetail({ project }: { project: ProjectDetailData }) {
  const num = String(project.position).padStart(2, "0");
  const total = String(project.total).padStart(2, "0");
  const label = categoryLabel(project.category);
  const hasText =
    project.summary ||
    project.problem ||
    project.insight ||
    project.productName;
  const detailRows = [
    { label: "Masalah", value: project.problem },
    { label: "Insight", value: project.insight },
  ].filter((row) => row.value);
  // Link produk ikut berjejer bersama link project (paling akhir).
  const semuaLink = [
    ...project.links,
    ...(project.productUrl
      ? [{ label: "Apps", url: project.productUrl }]
      : []),
  ];
  const adaVideo = project.videos.length > 0;
  const labelTeks = `${label}${project.year ? ` · ${project.year}` : ""}`;
  // Judul panjang: jeda antarhuruf dikecilkan supaya total waktunya tetap wajar.
  const jedaJudul = Math.min(
    0.045,
    1.4 / Math.max(1, Array.from(project.title).length)
  );

  return (
    <div className="flex flex-col gap-7">
      <style>{ANIMASI_CSS}</style>
      <noscript>
        <style>{`.pg-k{opacity:1!important;animation:none!important}`}</style>
      </noscript>

      {/* Ajakan kembali (atas): hanya mobile dan tablet kecil, disembunyikan di desktop */}
      <a
        href="/project"
        className="pd-naik -mt-3.5 flex flex-col items-center gap-2.5 no-underline lg:hidden [@media(hover:hover)_and_(pointer:fine)]:hidden"
        style={tunda(0.1)}
      >
        <span className="h-1.5 w-16 rounded-full bg-border" />
        <span className="flex items-center gap-2 font-serif text-[16px] italic text-muted">
          <Chevron size={20} />
          geser ke bawah untuk kembali ke project
        </span>
      </a>

      {/* Breadcrumb */}
      <header
        className="pd-naik flex flex-wrap items-center justify-between gap-4 border-b-2 border-foreground pb-5"
        style={tunda(0.15)}
      >
        <div className="text-[14px] text-muted">
          <a href="/" className="text-muted no-underline hover:text-foreground">
            home
          </a>{" "}
          /{" "}
          <a
            href="/project"
            className="text-muted no-underline hover:text-foreground"
          >
            projects
          </a>{" "}
          / <span className="font-semibold text-foreground">{num} {label}</span>
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Project {num} / {total}
        </div>
      </header>

      <div className="flex flex-wrap items-start gap-14">
        {/* Kolom kiri */}
        <div className="flex w-[440px] max-w-full shrink-0 flex-col gap-[22px]">
          <div className="text-[132px] font-extrabold leading-[0.85] tracking-[-0.03em] text-transparent [-webkit-text-stroke:2.5px_#111]">
            <Huruf teks={num} mulai={0.25} jeda={0.12} durasi={1.8} ax={-24} ay={0} />
          </div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            <Huruf teks={labelTeks} mulai={0.55} jeda={0.03} durasi={1.4} ax={0} ay={-14} />
          </div>
          <h1 className="font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground [font-size:clamp(32px,4vw,48px)]">
            <Huruf
              teks={project.title}
              mulai={0.8}
              jeda={jedaJudul}
              durasi={1.8}
              ax={18}
              ay={0}
            />
          </h1>
          <div className="flex flex-wrap gap-2">
            <span
              className="pd-pop bg-foreground px-3 py-[5px] text-[11px] font-semibold uppercase tracking-[0.08em] text-background"
              style={tunda(1.1)}
            >
              {label}
            </span>
            {project.tools.map((tool, i) => (
              <span
                key={tool.name}
                className={`pd-pop ${TAG}`}
                style={tunda(1.18 + i * 0.07)}
              >
                {tool.name}
              </span>
            ))}
          </div>

          {hasText && (
            <Muncul urutan={4} awalMulai={1.4} awalJeda={0.12}>
              <div className="mt-2.5 flex flex-col gap-3.5">
                <Pill>Deskripsi</Pill>
                {project.summary && (
                  <p className="m-0 whitespace-pre-line text-[16px] leading-[1.7] text-charcoal">
                    {project.summary}
                  </p>
                )}
                {(detailRows.length > 0 || project.productName) && (
                  <div className="mt-1 flex flex-col border-b border-border">
                    {detailRows.map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[96px_1fr] gap-3 border-t border-border py-3"
                      >
                        <div className="pt-[3px] text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
                          {row.label}
                        </div>
                        <div className="whitespace-pre-line text-[15px] leading-[1.6] text-charcoal">
                          {row.value}
                        </div>
                      </div>
                    ))}
                    {project.productName && (
                      <div className="grid grid-cols-[96px_1fr] gap-3 border-t border-border py-3">
                        <div className="pt-[3px] text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
                          Produk
                        </div>
                        <div className="flex flex-col gap-2 text-charcoal">
                          <div className="text-[15px] font-bold leading-[1.4] text-foreground">
                            {project.productName}
                          </div>
                          {project.productDescription && (
                            <p className="m-0 whitespace-pre-line text-[15px] leading-[1.6]">
                              {project.productDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Muncul>
          )}

          {project.tools.length > 0 && (
            <Muncul urutan={5} awalMulai={1.4} awalJeda={0.12}>
              <div className="mt-2.5 flex flex-col gap-4">
                <Pill>Tools</Pill>
                <div className="flex flex-wrap gap-[18px]">
                  {project.tools.map((tool) => (
                    <div key={tool.name} className="flex flex-col items-center gap-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-background shadow-[0_2px_10px_rgba(0,0,0,0.14)]">
                        {tool.iconUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={tool.iconUrl}
                              alt=""
                              className="h-7 w-7 object-contain"
                            />
                          </>
                        ) : (
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#111111"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect
                              x="4"
                              y="4"
                              width="16"
                              height="16"
                              rx="3"
                              strokeDasharray="3 3"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold tracking-[0.04em] text-charcoal">
                        {tool.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Muncul>
          )}

          {semuaLink.length > 0 && (
            <Muncul urutan={6} awalMulai={1.4} awalJeda={0.12}>
              <div className="mt-2.5 flex flex-col gap-4">
                <Pill>Link Project</Pill>
                <div className="flex flex-wrap gap-3">
                  {semuaLink.map((link, i) => (
                    <a
                      key={`${link.url}-${i}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-[10px] text-[15px] font-semibold no-underline ${
                        i === 0
                          ? "bg-foreground px-6 py-[13px] text-background"
                          : i === 1
                            ? "border-2 border-foreground bg-background px-[22px] py-[11px] text-foreground"
                            : "bg-surface px-6 py-[13px] text-foreground"
                      }`}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            </Muncul>
          )}
        </div>

        {/* Kolom kanan: galeri */}
        <div className="flex min-w-0 flex-1 basis-[520px] flex-col gap-6">
          {adaVideo && (
            <div className="pd-g0">
              <Muncul urutan={8} awalMulai={1}>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                  {project.videos.map((v, i) => (
                    <VideoYoutube
                      key={v.youtubeId}
                      youtubeId={v.youtubeId}
                      judul={`Video ${i + 1}: ${project.title}`}
                    />
                  ))}
                </div>
              </Muncul>
            </div>
          )}

          <div className={adaVideo ? undefined : "pd-g0"}>
            <Muncul
              urutan={adaVideo ? 9 : 8}
              awalMulai={adaVideo ? 1.4 : 1}
              awalJeda={0.12}
            >
              {project.images.length === 0 ? (
                <div className="flex aspect-[16/10] items-center justify-center rounded-[14px] border-2 border-foreground bg-surface">
                  <Placeholder label={num} size="text-[64px]" />
                </div>
              ) : (
                <div
                  className={`grid gap-3 ${
                    project.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}
                >
                  {project.images.map((img, i) => (
                    <figure
                      key={`${img.url}-${i}`}
                      className="m-0 flex min-w-0 flex-col gap-1.5"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-[10px] border-2 border-foreground bg-surface">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.alt ?? project.title}
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                      </div>
                      <figcaption
                        title={`fig. ${i + 1}${img.caption ? ` — ${img.caption}` : ""}`}
                        className="truncate font-serif text-[12px] italic leading-[1.4] text-muted"
                      >
                        fig. {i + 1}
                        {img.caption ? ` — ${img.caption}` : ""}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </Muncul>
          </div>
        </div>
      </div>

      {/* Penutup (bawah): judul, teks, panah, pegangan */}
      <Muncul urutan={20} awalMulai={1.8}>
        <a
          href="/project"
          className="mt-3 flex flex-col items-center gap-4 border-t-2 border-foreground pt-8 no-underline"
        >
          <span className="font-serif text-[34px] italic leading-[1.1] text-foreground">
            akhir dari project {num}.
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            ketuk untuk kembali ke project
          </span>
          <Chevron size={26} />
          <span className="mt-1 h-1.5 w-16 rounded-full bg-border" />
        </a>
      </Muncul>
    </div>
  );
}