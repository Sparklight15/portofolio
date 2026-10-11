import { DecorLine, PageArrow } from "./PageChrome";
import type { ContactLink } from "../../lib/contact-links";

// Satuan skala: --u = 1px pada skala mockup / 10. Di desktop mengecil mengikuti
// tinggi layar supaya muat satu layar. Angka 185px = perkiraan tinggi elemen
// lain (belum diukur presisi). Pembagi (tinggi kartu dalam satuan --u) dihitung
// dari jumlah baris link, lihat tinggiKartu().
function buatScaleCss(tinggiKartu: number) {
  return `.contact-scale{--u:8px}@media (min-width:1024px){.contact-scale{--u:clamp(4px,calc((100svh - 185px) / ${tinggiKartu}),10px)}}`;
}

// Perkiraan tinggi kartu (satuan --u): bagian tetap sekitar 39,7 ditambah
// 8,4 per baris link. Mulai 4 link tampil dua kolom, jadi baris = ceil(n / 2).
function tinggiKartu(jumlahLink: number) {
  const baris = jumlahLink <= 3 ? jumlahLink : Math.ceil(jumlahLink / 2);
  return Math.max(48, Math.round(39.7 + 8.4 * baris));
}

const u = (n: number) => `calc(var(--u) * ${n})`;
// Ukuran dengan batas minimum supaya teks kecil tetap terbaca.
const sz = (min: number, n: number) => `max(${min}px, ${u(n)})`;

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
      <style>{buatScaleCss(tinggiKartu(daftar.length))}</style>

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
            Contact · Say hi
          </div>
          <h1
            className="m-0 font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground"
            style={{ fontSize: sz(40, 9.2) }}
          >
            {"let's "}
            <span
              className="font-serif font-normal italic tracking-normal"
              style={{ fontSize: "1.13em" }}
            >
              connect.
            </span>
          </h1>
          <p
            className="m-0 leading-[1.7] text-charcoal"
            style={{ fontSize: sz(12, 1.6) }}
          >
            Terbuka untuk berkenalan, berdiskusi, dan berkolaborasi.
          </p>

          {/* Sticky note */}
          <div
            className="relative flex items-center justify-center self-start bg-surface text-center font-hand font-bold leading-none text-foreground shadow-[3px_5px_12px_rgba(0,0,0,0.18)]"
            style={{
              width: u(17),
              height: u(12),
              marginTop: u(1.6),
              transform: "rotate(-4deg)",
              fontSize: sz(16, 3),
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

        {/* Kartu kanan */}
        <div
          className="flex w-full flex-col items-center bg-surface lg:min-w-0 lg:[flex:1_1_calc(var(--u)_*_48)]"
          style={{
            maxWidth: u(62),
            borderRadius: u(2.8),
            padding: u(4),
            gap: u(1.8),
          }}
        >
          {/* Foto (berwarna, tanpa filter hitam-putih) */}
          <div
            className="relative shrink-0"
            style={{ width: u(15.6), height: u(15.6) }}
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

          {/* Nama */}
          <div className="text-center" style={{ marginTop: u(0.6) }}>
            <div
              className="font-extrabold tracking-[-0.02em] text-foreground"
              style={{ fontSize: sz(16, 2.2) }}
            >
              Evi Fauziah
            </div>
            <div
              className="font-serif italic text-muted"
              style={{ fontSize: sz(12, 1.6) }}
            >
              Fresh Graduate · Data Analysis
            </div>
          </div>

          {/* Ikon kecil */}
          <div className="flex flex-wrap justify-center" style={{ gap: u(1.2) }}>
            {daftar.map((l) => (
              <a key={l.id} href={l.url} aria-label={l.appName} {...ext(l)}>
                <IconBox link={l} box={4.8} />
              </a>
            ))}
          </div>

          {/* Baris link: satu kolom sampai 3 link, dua kolom mulai 4 link */}
          <div
            className={
              dua ? "grid w-full grid-cols-2" : "flex w-full flex-col"
            }
            style={{ gap: u(1.2), marginTop: u(0.8) }}
          >
            {daftar.map((l) => (
              <a
                key={l.id}
                href={l.url}
                {...ext(l)}
                className="flex min-w-0 items-center border-2 border-foreground bg-background text-foreground no-underline"
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
                    className="flex shrink-0 items-center justify-center rounded-full bg-surface"
                    style={{
                      width: u(3.6),
                      height: u(3.6),
                      fontSize: sz(11, 1.6),
                    }}
                  >
                    →
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      <PageArrow href="/tools" label="Halaman sebelumnya" side="left" />
      <PageArrow href="/" label="Kembali ke Home" side="right" />
    </div>
  );
}