import type { CSSProperties } from "react";
import type { PublicTool } from "../../lib/public-tools";
import { DecorLine, PageArrow } from "./PageChrome";

// Ukuran kartu (--w) di desktop dibatasi dua hal supaya semua tools muat SATU layar:
//  - tinggi: (tinggi layar - 208px) dibagi --k (tinggi grid dalam satuan lebar kartu)
//  - lebar : (lebar area - 560px) dibagi --kw (lebar grid dalam satuan lebar kartu)
// Angka 208px dan 560px = perkiraan ruang untuk elemen lain (belum diukur presisi).
// Di mobile ukurannya tetap dan halaman boleh di-scroll.
const SCALE_CSS = `.tools-scale{--w:150px}@media (min-width:1024px){.tools-scale{--w:clamp(56px,min(calc((min(1200px,100vw - 80px) - 560px) / var(--kw)),calc((100svh - 208px) / var(--k))),200px)}}`;

const ICON_STYLE: CSSProperties = {
  width: "calc(var(--w) * 0.36)",
  height: "calc(var(--w) * 0.36)",
};

const ROTATIONS = [-2, 1.5, -1, 2, -1.5, 1];

function columnsFor(count: number) {
  if (count <= 6) return 3;
  if (count <= 12) return 4;
  if (count <= 20) return 5;
  return 6;
}

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

function ToolCard({ tool, index }: { tool: PublicTool; index: number }) {
  const rotate = ROTATIONS[index % ROTATIONS.length];

  return (
    <div
      className="relative flex aspect-[1/1.05] flex-col items-center justify-center bg-surface shadow-[3px_5px_14px_rgba(0,0,0,0.18)]"
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
        className="max-w-full break-words px-2 text-center font-hand font-bold leading-none text-foreground"
        style={{ fontSize: "calc(var(--w) * 0.16)" }}
      >
        {tool.name}
      </div>
    </div>
  );
}

export default function ToolsSection({ tools }: { tools: PublicTool[] }) {
  const count = String(tools.length).padStart(2, "0");

  const cols = columnsFor(tools.length);
  const rows = Math.max(1, Math.ceil(tools.length / cols));
  const scale = {
    "--cols": cols,
    // tinggi grid dalam satuan lebar kartu: kartu 1.05 + jarak antarbaris 0.24 + ruang selotip
    "--k": rows * 1.05 + (rows - 1) * 0.24 + 0.1,
    // lebar grid dalam satuan lebar kartu: kolom + jarak antarkolom 0.2
    "--kw": cols + (cols - 1) * 0.2,
  } as CSSProperties;

  return (
    <div className="tools-scale relative flex flex-col gap-3" style={scale}>
      <style>{SCALE_CSS}</style>

      <DecorLine />

      <div className="mt-4 flex flex-col items-center justify-center gap-10 lg:flex-row lg:gap-16 lg:px-16">
        {/* Teks kiri */}
        <div className="flex w-full max-w-[420px] flex-col gap-[18px] lg:max-w-[340px] lg:flex-[0_1_340px]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            Tools · Stack
          </div>
          <h1 className="font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground [font-size:clamp(44px,min(6.5vw,calc((100svh_-_300px)_*_0.33)),92px)]">
            my{" "}
            <span className="font-serif font-normal italic tracking-normal [font-size:1.13em]">
              tools.
            </span>
          </h1>
          <p className="m-0 text-[16px] leading-[1.7] text-charcoal">
            Alat yang aku pakai untuk mengolah, menganalisis, dan menyajikan data.
          </p>
          <div className="font-serif text-[13px] italic leading-[1.4] text-muted">
            fig. 1 — {count} tools
          </div>
        </div>

        {/* Kartu tools */}
        {tools.length === 0 ? (
          <p className="text-muted">Belum ada tools untuk ditampilkan.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 p-3.5 sm:grid-cols-3 lg:[gap:calc(var(--w)_*_0.24)_calc(var(--w)_*_0.2)] lg:[grid-template-columns:repeat(var(--cols),var(--w))]">
            {tools.map((tool, i) => (
              <ToolCard key={tool.name} tool={tool} index={i} />
            ))}
          </div>
        )}
      </div>

      <PageArrow href="/project" label="Halaman sebelumnya" side="left" />
      <PageArrow href="/contact" label="Halaman berikutnya" side="right" />
    </div>
  );
}