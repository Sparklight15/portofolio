import type { CSSProperties } from "react";
import Link from "next/link";
import Muncul from "./Muncul";
import { DecorLine } from "./PageChrome";
import ScrollUpButton from "./ScrollUpButton";

export type ProjectCardData = {
  slug: string;
  title: string;
  category: string;
  year: number | null;
  tools: string[];
  imageUrl?: string | null;
  caption?: string | null;
};

const MAX_TAGS = 3;

// Animasi masuk halaman Project (gaya sama dengan Home dan About).
// Judul: per huruf dengan blur ke tajam (CSS di bawah). Kartu: muncul dari
// bawah lewat komponen Muncul (keyframe CSS pg-kartu; kartu baris pertama
// langsung jalan dari HTML server tanpa menunggu JavaScript). Efek hover
// kartu ada di kelas Tailwind pada ProjectCard. Animasi dipasang di pembungkus
// kartu (bukan di kartu) supaya tidak menimpa efek hover.
// prefers-reduced-motion mematikan semua.
// Kartu yang sudah terlihat saat halaman dibuka mulai bersamaan dengan judul
// ("all" mulai 0,3 detik), dengan kecepatan dan easing yang sama (1,8 detik).
const KARTU_MULAI = 0.3; // detik
const KARTU_JEDA = 0.1; // detik antarkartu pada baris pertama

const ANIMASI_CSS = `
@keyframes pg-huruf{
  0%{opacity:0;transform:translate3d(var(--ax,0px),var(--ay,0px),0);filter:blur(10px)}
  100%{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}
}
.pg-h{display:inline-block;animation:pg-huruf 1.8s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){
  .pg-h{animation:none}
}
@keyframes pg-kartu{
  0%{opacity:0;transform:translate3d(0,100px,0) scale(.97);filter:blur(12px)}
  100%{opacity:1;transform:none;filter:none}
}
.pg-k{opacity:0}
.pg-k-tampil,.pg-k-c0{animation-name:pg-kartu;animation-duration:1.8s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both;animation-delay:var(--d,0s)}
@media (min-width:560px){.pg-k-c1{animation-name:pg-kartu;animation-duration:1.8s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both;animation-delay:var(--d,0s)}}
@media (min-width:826px){.pg-k-c2{animation-name:pg-kartu;animation-duration:1.8s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both;animation-delay:var(--d,0s)}}
@media (min-width:1212px){.pg-k-c3{animation-name:pg-kartu;animation-duration:1.8s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both;animation-delay:var(--d,0s)}}
@media (prefers-reduced-motion:reduce){
  .pg-k{opacity:1;animation:none!important}
}
`;

// Pecah teks jadi huruf-huruf animasi. ax/ay = arah datang huruf (px).
function Huruf({
  teks,
  mulai,
  jeda,
  ax,
  ay,
  kelas,
}: {
  teks: string;
  mulai: number;
  jeda: number;
  ax: number;
  ay: number;
  kelas?: string;
}) {
  return (
    <>
      <span className="sr-only">{teks}</span>
      <span
        aria-hidden="true"
        className={kelas}
        style={{ "--ax": `${ax}px`, "--ay": `${ay}px` } as CSSProperties}
      >
        {Array.from(teks).map((h, i) => (
          <span
            key={i}
            className="pg-h"
            style={{ animationDelay: `${(mulai + i * jeda).toFixed(2)}s` }}
          >
            {h}
          </span>
        ))}
      </span>
    </>
  );
}

function categoryLabel(category: string) {
  return category === "kuliah" ? "tugas kuliah" : category;
}

function ProjectCard({ project, n }: { project: ProjectCardData; n: number }) {
  const featured = project.category === "capstone";
  const num = String(n).padStart(2, "0");
  const shownTools = project.tools.slice(0, MAX_TAGS);
  const extra = project.tools.length - shownTools.length;

  return (
    <article className="group/kartu flex flex-col gap-3">
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        <span>
          {num} · {categoryLabel(project.category)}
        </span>
        <span>{project.year ?? ""}</span>
      </div>

      <div
        className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[14px] border-foreground bg-surface transition-[transform,box-shadow] duration-500 ease-out group-hover/kartu:shadow-[6px_6px_0_#111] motion-safe:group-hover/kartu:-translate-x-1 motion-safe:group-hover/kartu:-translate-y-1 ${
          featured ? "border-[3px] shadow-hard" : "border-2"
        }`}
      >
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover/kartu:scale-105"
          />
        ) : (
          <div className="text-[84px] font-extrabold leading-[0.9] tracking-[-0.03em] text-transparent transition-transform duration-700 ease-out [-webkit-text-stroke:2px_#111] motion-safe:group-hover/kartu:scale-110">
            {num}
          </div>
        )}
        <Link
          href={`/project/${project.slug}`}
          aria-label={`Buka project ${project.title}`}
          className="group/btn absolute bottom-3 right-3 inline-flex items-center rounded-full bg-background/90 p-1 text-[12px] font-semibold leading-none text-foreground no-underline backdrop-blur-md transition-colors duration-500 focus-visible:bg-foreground focus-visible:text-background group-hover/kartu:bg-foreground group-hover/kartu:text-background motion-reduce:transition-none"
        >
          <span className="max-w-0 overflow-hidden whitespace-nowrap pl-0 pr-0 opacity-0 transition-[max-width,padding,opacity] duration-500 ease-out group-hover/kartu:max-w-[110px] group-hover/kartu:pl-3 group-hover/kartu:pr-2.5 group-hover/kartu:opacity-100 group-focus-visible/btn:max-w-[110px] group-focus-visible/btn:pl-3 group-focus-visible/btn:pr-2.5 group-focus-visible/btn:opacity-100 motion-reduce:transition-none">
            Lihat detail
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors duration-500 group-hover/kartu:bg-background group-hover/kartu:text-foreground group-focus-visible/btn:bg-background group-focus-visible/btn:text-foreground motion-reduce:transition-none">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4 -rotate-45 transition-transform duration-500 ease-out group-hover/kartu:rotate-0 group-focus-visible/btn:rotate-0 motion-reduce:transition-none"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </Link>
      </div>

      <div className="font-serif text-[13px] italic leading-[1.4] text-muted">
        fig. {n}
        {project.caption ? ` — ${project.caption}` : ""}
      </div>

      <h2 className="text-[20px] font-extrabold leading-[1.15] tracking-[-0.02em] text-foreground transition-transform duration-500 ease-out motion-safe:group-hover/kartu:translate-x-1">
        {project.title}
      </h2>

      <div className="flex flex-wrap gap-1.5">
        {shownTools.map((tool) => (
          <span
            key={tool}
            className="border-[1.5px] border-foreground px-[9px] py-[3px] text-[11px] font-semibold leading-[1.3]"
          >
            {tool}
          </span>
        ))}
        {extra > 0 && (
          <span className="border-[1.5px] border-foreground px-[9px] py-[3px] text-[11px] font-semibold leading-[1.3]">
            +{extra}
          </span>
        )}
      </div>
    </article>
  );
}

// Semua project tampil langsung di /project (halaman boleh di-scroll ke bawah).
export default function ProjectGallery({
  projects,
}: {
  projects: ProjectCardData[];
}) {
  return (
    <div className="relative flex flex-col gap-3 pb-8">
      <style>{ANIMASI_CSS}</style>
      <noscript>
        <style>{`.pg-k{opacity:1!important;animation:none!important}`}</style>
      </noscript>
      <DecorLine />

      <div className="mt-2 lg:px-16">
        <h1 className="font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground [font-size:clamp(40px,6vw,96px)]">
          <Huruf teks="all" mulai={0.3} jeda={0.1} ax={-22} ay={0} />{" "}
          <Huruf
            teks="works."
            mulai={0.7}
            jeda={0.12}
            ax={18}
            ay={-16}
            kelas="font-serif font-normal italic tracking-normal [font-size:1.125em]"
          />
        </h1>
      </div>

      {projects.length === 0 ? (
        <p className="mt-6 text-center text-muted lg:px-16">
          Belum ada project untuk ditampilkan.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-x-7 gap-y-11 lg:px-16">
          {projects.map((project, i) => (
            <Muncul
              key={project.slug}
              urutan={i}
              awalMulai={KARTU_MULAI}
              awalJeda={KARTU_JEDA}
            >
              <ProjectCard project={project} n={i + 1} />
            </Muncul>
          ))}
        </div>
      )}

      {/* Panah halaman hanya tampil di bagian atas (diatur GlobalArrows);
          setelah scroll, panah memudar dan tombol ini muncul. */}
      <ScrollUpButton />
    </div>
  );
}