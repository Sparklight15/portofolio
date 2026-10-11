import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { AdminLoading } from "../../../../components/admin/AdminState";
import { ProjectForm } from "../../../../components/admin/ProjectForm";
import { getCategories, getTools } from "../../../../lib/projects";

export const metadata: Metadata = {
  title: "Tambah project",
  robots: { index: false, follow: false },
};

async function FormDenganData() {
  await connection();
  const [categories, availableTools] = await Promise.all([
    getCategories(),
    getTools(),
  ]);
  return <ProjectForm categories={categories} availableTools={availableTools} />;
}

export default function TambahProjectPage() {
  return (
    <AdminShell title="Tambah project">
      <Suspense fallback={<AdminLoading />}>
        <FormDenganData />
      </Suspense>
    </AdminShell>
  );
}