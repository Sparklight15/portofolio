import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteNav } from "../../components/public/SiteNav";
import ContactSection from "../../components/public/ContactSection";
import { getContactLinks } from "../../lib/contact-links";
import type { ContactLink } from "../../lib/contact-links";
import { getProfile } from "../../lib/profile";

export const metadata: Metadata = { title: "Contact | Evi Fauziah" };

// Nilai bawaan: dipakai kalau data admin gagal dibaca, dan sebagai tampilan
// sementara selama data dimuat.
const FOTO_BAWAAN = "/images/about-evi.jpg";
const LINK_BAWAAN: ContactLink[] = [
  {
    id: "bawaan-github",
    appName: "GitHub",
    url: "https://github.com/Sparklight15",
    iconUrl: null,
    sortOrder: 1,
  },
];

async function IsiContact() {
  await connection();

  let links: ContactLink[] = LINK_BAWAAN;
  let fotoUrl = FOTO_BAWAAN;

  try {
    const hasil = await getContactLinks();
    if (hasil.error) {
      console.error("Gagal membaca link contact:", hasil.error);
    } else {
      links = hasil.data;
    }
  } catch (e) {
    console.error("Gagal membaca link contact:", e);
  }

  try {
    const profil = await getProfile();
    if (
      profil.contactPhotoUrl &&
      /^https?:\/\//i.test(profil.contactPhotoUrl)
    ) {
      fotoUrl = profil.contactPhotoUrl;
    }
  } catch (e) {
    console.error("Gagal membaca foto Contact:", e);
  }

  return <ContactSection links={links} fotoUrl={fotoUrl} />;
}

// justify-start: garis dekoratif harus di posisi yang sama di semua halaman.
export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col justify-start gap-3 overflow-x-clip px-4 py-5 sm:px-10">
      <SiteNav active="contact" />
      <Suspense
        fallback={<ContactSection links={LINK_BAWAAN} fotoUrl={FOTO_BAWAAN} />}
      >
        <IsiContact />
      </Suspense>
    </main>
  );
}