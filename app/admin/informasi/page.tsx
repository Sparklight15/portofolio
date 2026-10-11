import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminShell } from "../../../components/admin/AdminShell";
import {
  AdminError,
  AdminLoading,
} from "../../../components/admin/AdminState";
import { CvUploadForm } from "../../../components/admin/CvUploadForm";
import { FotoUploadForm } from "../../../components/admin/FotoUploadForm";
import { Button } from "../../../components/ui/Button";
import { getProfile } from "../../../lib/profile";

export const metadata: Metadata = {
  title: "Informasi pribadi",
  robots: { index: false, follow: false },
};

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

function waktuUnggah(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

function urlAman(url: string | null): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

async function IsiInformasi() {
  await connection();

  let profil;
  try {
    profil = await getProfile();
  } catch (e) {
    console.error("Gagal membaca profil:", e);
    return <AdminError detail="Gagal membaca informasi pribadi." />;
  }

  const adaCv = Boolean(profil.cvUrl);
  const fotoUrl = urlAman(profil.photoUrl);

  return (
    <table className="w-full border border-foreground">
      <tbody>
        <Baris label="CV saat ini">
          {adaCv ? (
            <div className="space-y-1">
              <a
                href={profil.cvUrl as string}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {profil.cvFilename || "Lihat CV"}
              </a>
              <p className="text-caption text-muted">
                Diunggah: {waktuUnggah(profil.updatedAt)}
              </p>
            </div>
          ) : (
            "Belum ada CV."
          )}
        </Baris>

        <Baris label="Unggah CV">
          <CvUploadForm adaCv={adaCv} />
        </Baris>

        <Baris label="Foto saat ini">
          {fotoUrl ? (
            <div className="w-40 overflow-hidden border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotoUrl}
                alt="Foto profil saat ini"
                className="block aspect-[3/4] w-full object-cover"
              />
            </div>
          ) : (
            "Belum ada foto. Halaman About memakai foto bawaan."
          )}
        </Baris>

        <Baris label="Unggah foto">
          <FotoUploadForm adaFoto={Boolean(fotoUrl)} />
        </Baris>
      </tbody>
    </table>
  );
}

export default function InformasiPribadiPage() {
  return (
    <AdminShell
      title="Informasi Pribadi"
      action={
        <Button href="/admin" variant="outline" size="sm">
          Kembali
        </Button>
      }
    >
      <Suspense fallback={<AdminLoading />}>
        <IsiInformasi />
      </Suspense>
    </AdminShell>
  );
}