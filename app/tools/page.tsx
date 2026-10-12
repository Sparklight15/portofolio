import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteNav } from "../../components/public/SiteNav";
import { DecorLine } from "../../components/public/PageChrome";
import ToolsSection from "../../components/public/ToolsSection";
import { getPublicTools } from "../../lib/public-tools";

export const metadata: Metadata = { title: "Tools | Evi Fauziah" };

async function ToolsData() {
  await connection();
  const { data, error } = await getPublicTools();

  if (error) {
    console.error("Gagal memuat tools:", error);
    return (
      <>
        <DecorLine />
        <p className="py-24 text-center text-muted">
          Tools belum bisa dimuat. Coba muat ulang halaman ini sebentar lagi.
        </p>
      </>
    );
  }

  return <ToolsSection tools={data} />;
}

// justify-start: garis dekoratif harus di posisi yang sama di semua halaman.
// overflow-clip (bukan hanya overflow-x-clip): kartu tools yang sedang beranimasi
// naik dari bawah tidak boleh memunculkan scrollbar vertikal di desktop.
export default function ToolsPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col justify-start gap-3 overflow-clip px-4 py-5 sm:px-10">
      <SiteNav active="tools" />
      <Suspense
        fallback={
          <>
            <DecorLine />
            <p className="py-24 text-center text-muted">Memuat tools…</p>
          </>
        }
      >
        <ToolsData />
      </Suspense>
    </main>
  );
}