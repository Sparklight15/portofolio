import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AdminShell } from "../../../../components/admin/AdminShell";
import {
  AdminError,
  AdminLoading,
} from "../../../../components/admin/AdminState";
import { Button } from "../../../../components/ui/Button";
import { getProjectForEdit } from "../../../../lib/project-detail";

export const metadata: Metadata = {
  title: "Detail project",
  robots: { index: false, follow: false },
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function waktu(month: string, year: string): string {
  const nama = NAMA_BULAN[Number(month) - 1];
  return [nama, year].filter(Boolean).join(" ") || "-";
}

function labelJenis(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function linkAman(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function Baris({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <th
        scope="row"
        className="w-28 bg-surface px-4 py-3 text-left align-top text-label uppercase text-muted sm:w-40"
      >
        {label}
      </th>
      <td className="px-4 py-3 align-top text-body text-foreground">
        {children}
      </td>
    </tr>
  );
}

function Teks({ isi }: { isi: string }) {
  return <p className="whitespace-pre-wrap">{isi.trim() ? isi : "-"}</p>;
}

async function IsiDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const { data, error } = await getProjectForEdit(id);

  if (error) return <AdminError detail={error} />;
  if (!data) notFound();

  return (
    <table className="w-full border border-foreground">
      <tbody>
        <Baris label="Judul">
          <p className="font-medium">{data.title}</p>
        </Baris>

        <Baris label="Waktu">{waktu(data.month, data.year)}</Baris>

        <Baris label="Jenis">{labelJenis(data.category)}</Baris>

        <Baris label="Deskripsi">
          <Teks isi={data.summary} />
        </Baris>

        <Baris label="Masalah">
          <Teks isi={data.problem} />
        </Baris>

        <Baris label="Insight">
          <Teks isi={data.insight} />
        </Baris>

        <Baris label="Tools">
          {data.tools.length === 0 ? (
            "-"
          ) : (
            <ul className="flex flex-wrap gap-2">
              {data.tools.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-foreground px-3 py-1 text-caption text-background"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </Baris>

        <Baris label="Link">
          {data.links.length === 0 ? (
            "-"
          ) : (
            <ul className="space-y-1">
              {data.links.map((l) => (
                <li key={l.id}>
                  {linkAman(l.url) ? (
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4"
                    >
                      {l.label || l.url}
                    </a>
                  ) : (
                    <span>{l.label || l.url}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Baris>

        <Baris label="Gambar">
          {data.images.length === 0 ? (
            "Belum ada gambar."
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {data.images.map((g) => (
                <li key={g.id}>
                  <div className="aspect-video w-full overflow-hidden border border-border bg-surface">
                    {g.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.previewUrl}
                        alt={g.caption || g.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  {g.caption ? (
                    <p className="mt-2 text-caption text-muted">{g.caption}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Baris>
      </tbody>
    </table>
  );
}

async function TombolAksi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex items-center gap-2">
      <Button href="/admin" variant="outline" size="sm">
        Kembali
      </Button>
      {UUID_RE.test(id) ? (
        <Button href={`/admin/projects/${id}/edit`} variant="filled" size="sm">
          Edit
        </Button>
      ) : null}
    </div>
  );
}

export default function DetailProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AdminShell
      action={
        <Suspense fallback={null}>
          <TombolAksi params={params} />
        </Suspense>
      }
    >
      <Suspense fallback={<AdminLoading />}>
        <IsiDetail params={params} />
      </Suspense>
    </AdminShell>
  );
}