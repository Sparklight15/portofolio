import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SiteNav } from "../../../components/public/SiteNav";
import { DecorLine } from "../../../components/public/PageChrome";
import { ABOUT_DEFAULT } from "../../../lib/about-defaults";
import { getProfile } from "../../../lib/profile";
import type { AboutEntri } from "../../../lib/profile";

export const metadata: Metadata = { title: "Riwayat | Evi Fauziah" };

function Blok({ judul, daftar }: { judul: string; daftar: AboutEntri[] }) {
  return (
    <section className="flex min-w-0 flex-col gap-4 border-t-2 border-foreground pt-4">
      <h2 className="text-[28px] font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground">
        {judul}
      </h2>

      {daftar.length === 0 ? (
        <p className="text-[14px] leading-[1.65] text-muted">Belum ada entri.</p>
      ) : (
        <ul className="flex flex-col">
          {daftar.map((item, i) => (
            <li
              key={i}
              className={`grid grid-cols-[110px_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[140px_minmax(0,1fr)] ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="break-words text-[14px] font-semibold leading-[1.65] text-foreground">
                {item.year}
              </div>
              <div className="min-w-0 text-[14px] leading-[1.65] text-charcoal">
                <div className="break-words font-semibold text-foreground">
                  {item.title}
                </div>
                {item.detail ? (
                  <div className="break-words">{item.detail}</div>
                ) : null}

                {item.photos && item.photos.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {item.photos.map((url, n) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka foto ${n + 1} untuk ${item.title}`}
                          className="block h-20 w-20 overflow-hidden border border-border bg-surface"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Foto ${n + 1}: ${item.title}`}
                            loading="lazy"
                            className="block h-full w-full object-cover [filter:grayscale(1)]"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function RiwayatData() {
  await connection();

  let experience: AboutEntri[] = ABOUT_DEFAULT.experience;
  let education: AboutEntri[] = ABOUT_DEFAULT.education;
  try {
    const profil = await getProfile();
    experience = profil.aboutExperience ?? ABOUT_DEFAULT.experience;
    education = profil.aboutEducation ?? ABOUT_DEFAULT.education;
  } catch (e) {
    console.error("Gagal membaca profil untuk halaman riwayat:", e);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <Blok judul="Experience" daftar={experience} />
      <Blok judul="Education" daftar={education} />
    </div>
  );
}

// Halaman ini boleh di-scroll. Garis dekoratif tetap di posisi yang sama dengan
// halaman lain (main gap-3), sisa isi diberi jarak sendiri di dalam pembungkus.
export default function RiwayatPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col justify-start gap-3 overflow-x-clip px-4 py-5 sm:px-10">
      <SiteNav active="about" />

      <DecorLine />

      <div className="mt-3 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            Experience &amp; Education
          </div>
          <h1 className="font-serif text-[64px] italic leading-none text-foreground sm:text-[88px]">
            riwayat.
          </h1>
        </div>

        <Suspense fallback={<div className="min-h-[50svh]" aria-busy="true" />}>
          <RiwayatData />
        </Suspense>

        <div className="pb-6">
          <Link
            href="/about"
            className="text-[14px] font-semibold text-foreground underline underline-offset-4"
          >
            ← Kembali ke About
          </Link>
        </div>
      </div>
    </main>
  );
}