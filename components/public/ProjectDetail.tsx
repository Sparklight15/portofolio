import Link from "next/link";
import type { ProjectDetailData } from "../../lib/public-projects";

function categoryLabel(category: string) {
  return category === "kuliah" ? "tugas kuliah" : category;
}

const TAG =
  "border-[1.5px] border-foreground px-[9px] py-[3px] text-[11px] font-semibold leading-[1.5]";

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
  const [mainImage, ...otherImages] = project.images;
  const hasText = project.summary || project.problem || project.insight;
  const detailRows = [
    { label: "Masalah", value: project.problem },
    { label: "Insight", value: project.insight },
  ].filter((row) => row.value);

  return (
    <div className="flex flex-col gap-7">
      <style>{`.detail-bob{animation:detail-bob 1.6s ease-in-out infinite}@keyframes detail-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}@media (prefers-reduced-motion:reduce){.detail-bob{animation:none}}`}</style>

      {/* Ajakan kembali (atas): hanya mobile dan tablet kecil, disembunyikan di desktop */}
      <Link
        href="/project"
        className="-mt-3.5 flex flex-col items-center gap-2.5 no-underline lg:hidden"
      >
        <span className="h-1.5 w-16 rounded-full bg-border" />
        <span className="flex items-center gap-2 font-serif text-[16px] italic text-muted">
          <Chevron size={20} />
          geser ke bawah untuk kembali ke project
        </span>
      </Link>

      {/* Breadcrumb */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-foreground pb-5">
        <div className="text-[14px] text-muted">
          <Link href="/" className="text-muted no-underline hover:text-foreground">
            home
          </Link>{" "}
          /{" "}
          <Link
            href="/project"
            className="text-muted no-underline hover:text-foreground"
          >
            projects
          </Link>{" "}
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
            {num}
          </div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            {label}
            {project.year ? ` · ${project.year}` : ""}
          </div>
          <h1 className="font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground [font-size:clamp(32px,4vw,48px)]">
            {project.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="bg-foreground px-3 py-[5px] text-[11px] font-semibold uppercase tracking-[0.08em] text-background">
              {label}
            </span>
            {project.tools.map((tool) => (
              <span key={tool.name} className={TAG}>
                {tool.name}
              </span>
            ))}
          </div>

          {hasText && (
            <div className="mt-2.5 flex flex-col gap-3.5">
              <Pill>Deskripsi</Pill>
              {project.summary && (
                <p className="m-0 whitespace-pre-line text-[16px] leading-[1.7] text-charcoal">
                  {project.summary}
                </p>
              )}
              {detailRows.length > 0 && (
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
                </div>
              )}
            </div>
          )}

          {project.tools.length > 0 && (
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
          )}

          {project.links.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-4">
              <Pill>Link Project</Pill>
              <div className="flex flex-wrap gap-3">
                {project.links.map((link, i) => (
                  <a
                    key={`${link.url}-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-[10px] text-[15px] font-semibold text-foreground no-underline ${
                      i === 0
                        ? "bg-foreground px-6 py-[13px] text-background"
                        : i === 1
                          ? "border-2 border-foreground bg-background px-[22px] py-[11px]"
                          : "bg-surface px-6 py-[13px]"
                    }`}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
              <div className="break-all text-[13px] text-muted">
                {project.links[0].url}
              </div>
            </div>
          )}
        </div>

        {/* Kolom kanan: galeri */}
        <div className="flex min-w-0 flex-1 basis-[520px] flex-col gap-6">
          {mainImage ? (
            <figure className="m-0 flex flex-col gap-2">
              <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[14px] border-2 border-foreground bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainImage.url}
                  alt={mainImage.alt ?? project.title}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <figcaption className="font-serif text-[13px] italic leading-[1.4] text-muted">
                fig. 1{mainImage.caption ? ` — ${mainImage.caption}` : ""}
              </figcaption>
            </figure>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-[14px] border-2 border-foreground bg-surface">
              <Placeholder label={num} size="text-[64px]" />
            </div>
          )}

          {otherImages.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
              {otherImages.map((img, i) => (
                <figure key={`${img.url}-${i}`} className="m-0 flex flex-col gap-2">
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[14px] border-2 border-foreground bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? project.title}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  </div>
                  <figcaption className="font-serif text-[13px] italic leading-[1.4] text-muted">
                    fig. {i + 2}
                    {img.caption ? ` — ${img.caption}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Penutup (bawah): judul, teks, panah, pegangan */}
      <Link
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
      </Link>
    </div>
  );
}