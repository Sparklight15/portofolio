import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import ProjectDetail from "../../../components/public/ProjectDetail";
import { getPublicProjectDetail } from "../../../lib/public-projects";

export const metadata: Metadata = { title: "Detail Project | Evi Fauziah" };

type Params = Promise<{ slug: string }>;

async function DetailData({ params }: { params: Params }) {
  const { slug } = await params;
  await connection();
  const { data, error } = await getPublicProjectDetail(slug);

  if (error) {
    console.error("Gagal memuat detail project:", error);
    return (
      <p className="py-24 text-center text-muted">
        Project belum bisa dimuat. Coba muat ulang halaman ini sebentar lagi.
      </p>
    );
  }

  if (!data) notFound();

  return <ProjectDetail project={data} />;
}

// Halaman ini boleh di-scroll ke bawah (seperti halaman Project).
export default function ProjectDetailPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col overflow-x-clip px-4 py-5 sm:px-10">
      <Suspense
        fallback={<p className="py-24 text-center text-muted">Memuat project…</p>}
      >
        <DetailData params={params} />
      </Suspense>
    </main>
  );
}