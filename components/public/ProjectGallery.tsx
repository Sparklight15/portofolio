import Link from "next/link";
import { DecorLine, PageArrow } from "./PageChrome";

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

// Jumlah project yang tampil di /project (sisanya lewat "Lihat semua").
const TAMPIL_DEPAN = 4;

function categoryLabel(category: string) {
  return category === "kuliah" ? "tugas kuliah" : category;
}

function ProjectCard({ project, n }: { project: ProjectCardData; n: number }) {
  const featured = project.category === "capstone";
  const num = String(n).padStart(2, "0");
  const shownTools = project.tools.slice(0, MAX_TAGS);
  const extra = project.tools.length - shownTools.length;

  return (
    <article className="flex flex-col gap-3">
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        <span>
          {num} · {categoryLabel(project.category)}
        </span>
        <span>{project.year ?? ""}</span>
      </div>

      <div
        className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[14px] border-foreground bg-surface ${
          featured ? "border-[3px] shadow-hard" : "border-2"
        }`}
      >
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="text-[84px] font-extrabold leading-[0.9] tracking-[-0.03em] text-transparent [-webkit-text-stroke:2px_#111]">
            {num}
          </div>
        )}
        <Link
          href={`/project/${project.slug}`}
          aria-label={`Buka project ${project.title}`}
          className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-background text-[15px] text-foreground no-underline"
        >
          →
        </Link>
      </div>

      <div className="font-serif text-[13px] italic leading-[1.4] text-muted">
        fig. {n}
        {project.caption ? ` — ${project.caption}` : ""}
      </div>

      <h2 className="text-[20px] font-extrabold leading-[1.15] tracking-[-0.02em] text-foreground">
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

// mode "ringkas" (bawaan, dipakai /project): hanya TAMPIL_DEPAN project pertama
// + tombol "Lihat semua" kalau ada lebih. mode "semua" (dipakai /project/semua):
// semua project + link kembali.
export default function ProjectGallery({
  projects,
  mode = "ringkas",
}: {
  projects: ProjectCardData[];
  mode?: "ringkas" | "semua";
}) {
  const ringkas = mode === "ringkas";
  const tampil = ringkas ? projects.slice(0, TAMPIL_DEPAN) : projects;
  const adaLebih = ringkas && projects.length > TAMPIL_DEPAN;

  return (
    <div className="relative flex flex-col gap-3 pb-8">
      <DecorLine />

      <div className="mt-2 lg:px-16">
        <h1 className="font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground [font-size:clamp(40px,6vw,96px)]">
          {ringkas ? "selected" : "all"}{" "}
          <span className="font-serif font-normal italic tracking-normal [font-size:1.125em]">
            works.
          </span>
        </h1>
      </div>

      {tampil.length === 0 ? (
        <p className="mt-6 text-center text-muted lg:px-16">
          Belum ada project untuk ditampilkan.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-x-7 gap-y-11 lg:px-16">
          {tampil.map((project, i) => (
            <ProjectCard key={project.slug} project={project} n={i + 1} />
          ))}
        </div>
      )}

      {adaLebih ? (
        <div className="mt-2 flex justify-center lg:px-16">
          <Link
            href="/project/semua"
            className="inline-block rounded-xl bg-foreground px-6 py-3 text-[14px] font-semibold text-background no-underline"
          >
            Lihat semua ({projects.length})
          </Link>
        </div>
      ) : null}

      {!ringkas ? (
        <div className="mt-2 lg:px-16">
          <Link
            href="/project"
            className="text-[14px] font-semibold text-foreground underline underline-offset-4"
          >
            ← Kembali ke Project
          </Link>
        </div>
      ) : null}

      {ringkas ? (
        <>
          <PageArrow fixed href="/about" label="Halaman sebelumnya" side="left" />
          <PageArrow fixed href="/tools" label="Halaman berikutnya" side="right" />
        </>
      ) : null}
    </div>
  );
}