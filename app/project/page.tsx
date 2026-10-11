import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteNav } from "../../components/public/SiteNav";
import { DecorLine } from "../../components/public/PageChrome";
import ProjectGallery from "../../components/public/ProjectGallery";
import { getPublicProjects } from "../../lib/public-projects";

export const metadata: Metadata = { title: "Project | Evi Fauziah" };

async function ProjectData() {
  await connection();
  const { data, error } = await getPublicProjects();

  if (error) {
    console.error("Gagal memuat project publik:", error);
    return (
      <>
        <DecorLine />
        <p className="py-24 text-center text-muted">
          Project belum bisa dimuat. Coba muat ulang halaman ini sebentar lagi.
        </p>
      </>
    );
  }

  return <ProjectGallery projects={data} />;
}

// Halaman ini boleh di-scroll ke bawah (pengecualian dari aturan satu layar).
export default function ProjectPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col justify-start gap-3 overflow-x-clip px-4 py-5 sm:px-10">
      <SiteNav active="project" />
      <Suspense
        fallback={
          <>
            <DecorLine />
            <p className="py-24 text-center text-muted">Memuat project…</p>
          </>
        }
      >
        <ProjectData />
      </Suspense>
    </main>
  );
}