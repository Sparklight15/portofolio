import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AdminShell } from "../../../../../components/admin/AdminShell";
import {
  AdminError,
  AdminLoading,
} from "../../../../../components/admin/AdminState";
import { ProjectForm } from "../../../../../components/admin/ProjectForm";
import { getProjectForEdit } from "../../../../../lib/project-detail";
import { getCategories, getTools } from "../../../../../lib/projects";

export const metadata: Metadata = {
  title: "Edit project",
  robots: { index: false, follow: false },
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function FormEdit({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [{ data, error }, categories, availableTools] = await Promise.all([
    getProjectForEdit(id),
    getCategories(),
    getTools(),
  ]);

  if (error) return <AdminError detail={error} />;
  if (!data) notFound();

  return (
    <ProjectForm
      projectId={id}
      initialValues={data}
      categories={categories}
      availableTools={availableTools}
    />
  );
}

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AdminShell title="Edit project">
      <Suspense fallback={<AdminLoading />}>
        <FormEdit params={params} />
      </Suspense>
    </AdminShell>
  );
}