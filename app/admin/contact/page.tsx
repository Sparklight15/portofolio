import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminShell } from "../../../components/admin/AdminShell";
import {
  AdminError,
  AdminLoading,
} from "../../../components/admin/AdminState";
import { ContactLinkForm } from "../../../components/admin/ContactLinkForm";
import { ContactLinkRow } from "../../../components/admin/ContactLinkRow";
import { FotoContactUploadForm } from "../../../components/admin/FotoContactUploadForm";
import { Button } from "../../../components/ui/Button";
import { getContactLinks } from "../../../lib/contact-links";
import { getProfile } from "../../../lib/profile";

export const metadata: Metadata = {
  title: "Kelola Contact",
  robots: { index: false, follow: false },
};

const thClass =
  "bg-surface px-4 py-3 text-left text-label uppercase text-muted";

async function IsiContact() {
  await connection();

  let contactPhotoUrl: string | null = null;
  try {
    const profil = await getProfile();
    contactPhotoUrl = profil.contactPhotoUrl;
  } catch (e) {
    console.error("Gagal memuat foto Contact:", e);
    return (
      <AdminError
        detail={e instanceof Error ? e.message : "Gagal memuat foto Contact."}
      />
    );
  }

  const { data, error } = await getContactLinks();

  if (error) {
    console.error("Gagal memuat link contact:", error);
    return <AdminError detail={error} />;
  }

  const fotoAman =
    contactPhotoUrl && /^https?:\/\//i.test(contactPhotoUrl)
      ? contactPhotoUrl
      : null;

  return (
    <div className="space-y-6">
      <div className="space-y-3 border border-foreground p-4">
        <p className="text-label uppercase text-muted">Foto Contact</p>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoAman ?? "/images/about-evi.jpg"}
            alt="Foto Contact saat ini"
            className="h-24 w-24 rounded-full border border-foreground object-cover"
          />
          <p className="text-caption text-muted">
            {fotoAman
              ? "Foto Contact saat ini."
              : "Belum ada foto Contact. Halaman Contact memakai foto bawaan."}
          </p>
        </div>
        <FotoContactUploadForm adaFoto={fotoAman !== null} />
      </div>

      <ContactLinkForm jumlah={data.length} />

      {data.length === 0 ? (
        <p className="text-body text-muted">
          Belum ada link. Tambahkan lewat form di atas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-foreground">
            <thead>
              <tr className="border-b border-foreground">
                <th scope="col" className={`${thClass} w-32`}>
                  Urutan
                </th>
                <th scope="col" className={`${thClass} w-24`}>
                  Logo
                </th>
                <th scope="col" className={thClass}>
                  Nama app
                </th>
                <th scope="col" className={thClass}>
                  Link
                </th>
                <th scope="col" className={thClass}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((l, i) => (
                <ContactLinkRow
                  key={`${l.id}|${i}|${l.appName}|${l.url}|${l.iconUrl ?? ""}`}
                  id={l.id}
                  appName={l.appName}
                  url={l.url}
                  iconUrl={l.iconUrl}
                  index={i}
                  total={data.length}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ul className="list-disc space-y-1 pl-5 text-caption text-muted">
        <li>
          Maksimal 6 link. Nama app maksimal 20 karakter. Link diawali
          http://, https://, atau mailto: (untuk email).
        </li>
        <li>
          Logo: JPG, PNG, atau WebP, maksimal 2 MB. Paling bagus PNG persegi
          dengan latar transparan. Di halaman Contact logo tampil hitam-putih.
        </li>
        <li>
          Urutan di sini sama dengan urutan tampil di halaman Contact. Tanpa
          logo, dipakai ikon bawaan.
        </li>
        <li>
          Foto Contact terpisah dari foto About. Di halaman Contact foto tampil
          bulat dan berwarna.
        </li>
      </ul>
    </div>
  );
}

export default function ContactAdminPage() {
  return (
    <AdminShell
      title="Kelola Contact"
      action={
        <Button href="/admin" variant="outline" size="sm">
          Kembali
        </Button>
      }
    >
      <Suspense fallback={<AdminLoading />}>
        <IsiContact />
      </Suspense>
    </AdminShell>
  );
}