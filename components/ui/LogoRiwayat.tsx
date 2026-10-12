import type { CSSProperties } from "react";

// Logo satu entri Experience/Education.
// Ada url = tampilkan gambar unggahan (berwarna).
// Tidak ada url = logo bawaan: ikon koper (Experience) atau topi wisuda
// (Education), garis abu-abu tipis di kotak putih membulat.
export type JenisRiwayat = "experience" | "education";

export default function LogoRiwayat({
  jenis,
  url,
  ukuran,
  alt = "",
  className = "",
}: {
  jenis: JenisRiwayat;
  url?: string | null;
  ukuran: number | string;
  alt?: string;
  className?: string;
}) {
  const aman = url && /^https?:\/\//i.test(url) ? url : null;
  const gaya = { width: ukuran, height: ukuran } as CSSProperties;

  if (aman) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] border border-border bg-background ${className}`}
        style={gaya}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={aman}
          alt={alt}
          loading="lazy"
          className="block h-full w-full object-contain p-[8%]"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-[22%] border border-border bg-background text-muted ${className}`}
      style={gaya}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[56%] w-[56%]"
      >
        {jenis === "experience" ? (
          <>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
            <path d="M3 13h18" />
            <path d="M10.5 13v2h3v-2" />
          </>
        ) : (
          <>
            <path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z" />
            <path d="M6 11.8V16c0 1.3 2.7 3 6 3s6-1.7 6-3v-4.2" />
            <path d="M22 9.5V15" />
          </>
        )}
      </svg>
    </span>
  );
}