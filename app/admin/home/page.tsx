import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminShell } from "../../../components/admin/AdminShell";
import {
  AdminError,
  AdminLoading,
} from "../../../components/admin/AdminState";
import { HomeGambarForm } from "../../../components/admin/HomeGambarForm";
import { HomeTeksForm } from "../../../components/admin/HomeTeksForm";
import { HOME_DEFAULT } from "../../../lib/home-defaults";
import { getProfile } from "../../../lib/profile";

export const metadata: Metadata = {
  title: "Konten Home",
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

function urlAman(url: string | null): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

async function IsiHome() {
  await connection();

  let profil;
  try {
    profil = await getProfile();
  } catch (e) {
    console.error("Gagal membaca konten Home:", e);
    return <AdminError detail="Gagal membaca konten Home." />;
  }

  const gambarUrl = urlAman(profil.homeImageUrl);
  const awal = {
    kicker1: profil.homeKicker1 ?? "",
    kicker2: profil.homeKicker2 ?? "",
    greeting: profil.homeGreeting ?? "",
    label1: profil.homeLabel1 ?? "",
    label2: profil.homeLabel2 ?? "",
    label3: profil.homeLabel3 ?? "",
  };

  return (
    <table className="w-full border border-foreground">
      <tbody>
        <Baris label="Teks Home">
          {/* key: form dipasang ulang setiap data tersimpan berubah (efek cacheComponents). */}
          <HomeTeksForm key={JSON.stringify(awal)} awal={awal} />
        </Baris>

        <Baris label="Ketentuan gambar">
          <ul className="list-disc space-y-1 pl-5 text-caption text-muted">
            <li>Format PNG, maksimal 5 MB.</li>
            <li>Latar transparan (tanpa background).</li>
            <li>Portrait sekitar 2:3: tinggi 1,35 sampai 1,6 kali lebar.</li>
            <li>Lebar 600 sampai 3000 px (bawaan: 768 x 1129 px).</li>
            <li>Kepala karakter dekat bagian atas gambar.</li>
          </ul>
        </Baris>

        <Baris label="Gambar saat ini">
          <div className="w-40 overflow-hidden border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gambarUrl ?? HOME_DEFAULT.image}
              alt="Gambar karakter Home saat ini"
              className="block aspect-[2/3] w-full object-contain"
            />
          </div>
          {gambarUrl ? null : (
            <p className="mt-2 text-caption text-muted">
              Belum ada unggahan. Home memakai gambar bawaan.
            </p>
          )}
        </Baris>

        <Baris label="Unggah gambar">
          <HomeGambarForm adaGambar={Boolean(gambarUrl)} />
        </Baris>
      </tbody>
    </table>
  );
}

export default function HomeAdminPage() {
  return (
    <AdminShell>
      <Suspense fallback={<AdminLoading />}>
        <IsiHome />
      </Suspense>
    </AdminShell>
  );
}