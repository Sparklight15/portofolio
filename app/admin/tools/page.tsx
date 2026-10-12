import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminShell } from "../../../components/admin/AdminShell";
import {
  AdminError,
  AdminLoading,
} from "../../../components/admin/AdminState";
import { ToolRowActions } from "../../../components/admin/ToolRowActions";
import { getToolsAdmin } from "../../../lib/tools-admin";

export const metadata: Metadata = {
  title: "Kelola Tools",
  robots: { index: false, follow: false },
};

const thClass =
  "bg-surface px-4 py-3 text-left text-label uppercase text-muted";

async function IsiTools() {
  await connection();

  const { data, error } = await getToolsAdmin();

  if (error) {
    console.error("Gagal memuat tools:", error);
    return <AdminError detail={error} />;
  }

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <p className="text-body text-muted">
          Belum ada tools. Tools muncul di sini otomatis setelah dipakai di
          form project.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-foreground">
            <thead>
              <tr className="border-b border-foreground">
                <th scope="col" className={`${thClass} w-24`}>
                  Logo
                </th>
                <th scope="col" className={thClass}>
                  Nama
                </th>
                <th scope="col" className={`${thClass} w-32`}>
                  Dipakai
                </th>
                <th scope="col" className={thClass}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex h-12 w-12 items-center justify-center border border-border bg-surface">
                      {t.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.iconUrl}
                          alt={`Logo ${t.name}`}
                          className="h-full w-full object-contain p-1 [filter:grayscale(1)]"
                        />
                      ) : (
                        <span className="text-caption text-muted">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-body text-foreground">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 align-middle text-body text-foreground">
                    {t.projectCount} project
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <ToolRowActions
                      id={t.id}
                      name={t.name}
                      hasLogo={Boolean(t.iconUrl)}
                      projectCount={t.projectCount}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ul className="list-disc space-y-1 pl-5 text-caption text-muted">
        <li>
          Tools baru muncul di daftar ini otomatis saat dipakai di form
          project. Logo hanya diatur di halaman ini.
        </li>
        <li>
          Logo: JPG, PNG, atau WebP, maksimal 2 MB. Paling bagus PNG persegi
          dengan latar transparan.
        </li>
        <li>
          Tools yang masih dipakai project tidak bisa dihapus. Lepas dulu dari
          project lewat Edit.
        </li>
      </ul>
    </div>
  );
}

export default function ToolsAdminPage() {
  return (
    <AdminShell>
      <Suspense fallback={<AdminLoading />}>
        <IsiTools />
      </Suspense>
    </AdminShell>
  );
}