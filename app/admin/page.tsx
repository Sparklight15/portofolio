import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminShell } from "../../components/admin/AdminShell";
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from "../../components/admin/AdminState";
import { AdminTable } from "../../components/admin/AdminTable";
import type { AdminTableRow } from "../../components/admin/AdminTable";
import { DeleteProjectButton } from "../../components/admin/DeleteProjectButton";
import { Button } from "../../components/ui/Button";
import { formatWaktu, getProjects } from "../../lib/projects";

export const metadata: Metadata = {
  title: "Dashboard admin",
  robots: { index: false, follow: false },
};

async function ProjectList() {
  // Pastikan daftar dibaca per request, bukan dibekukan saat build.
  await connection();

  const { data, error } = await getProjects();

  if (error) {
    console.error("Gagal memuat project:", error);
    return <AdminError detail={error} />;
  }

  if (data.length === 0) {
    return <AdminEmpty />;
  }

  const rows: AdminTableRow[] = data.map((p, i) => ({
    id: p.id,
    no: i + 1,
    title: p.title,
    time: formatWaktu(p.project_month, p.project_year),
    category: p.category,
    actions: (
      <>
        <Button
          href={`/admin/projects/${p.id}`}
          variant="outline"
          size="sm"
        >
          Detail
        </Button>
        <DeleteProjectButton id={p.id} title={p.title} />
      </>
    ),
  }));

  return <AdminTable rows={rows} />;
}

export default function AdminPage() {
  return (
    <AdminShell
      title="Daftar Project"
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button href="/admin/home" variant="outline" size="sm">
            Konten Home
          </Button>
          <Button href="/admin/about" variant="outline" size="sm">
            Konten About
          </Button>
          <Button href="/admin/tools" variant="outline" size="sm">
            Kelola Tools
          </Button>
          <Button href="/admin/contact" variant="outline" size="sm">
            Kelola Contact
          </Button>
          <Button href="/admin/projects/baru" variant="filled" size="sm">
            Tambah Project
          </Button>
        </div>
      }
    >
      <Suspense fallback={<AdminLoading />}>
        <ProjectList />
      </Suspense>
    </AdminShell>
  );
}