import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteNav } from "../../components/public/SiteNav";
import { DecorLine } from "../../components/public/PageChrome";
import { PageSlide } from "../../components/public/PageSlide";
import AboutSection from "../../components/public/AboutSection";
import type { AboutKonten } from "../../components/public/AboutSection";
import { getProfile } from "../../lib/profile";

export const metadata: Metadata = { title: "About | Evi Fauziah" };

async function AboutData() {
  await connection();

  let konten: AboutKonten = {};
  try {
    const profil = await getProfile();
    konten = {
      cvUrl: profil.cvUrl,
      photoUrl: profil.photoUrl,
      name: profil.aboutName,
      description: profil.aboutDescription,
      experience: profil.aboutExperience,
      education: profil.aboutEducation,
    };
  } catch (e) {
    console.error("Gagal membaca profil untuk halaman About:", e);
  }

  return <AboutSection {...konten} />;
}

// justify-start: garis dekoratif harus di posisi yang sama di semua halaman.
// SiteNav dan DecorLine di luar PageSlide supaya tetap diam. Fallback null
// supaya animasi masuk elemen tidak main dua kali (fallback lalu konten asli).
export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col justify-start gap-3 overflow-x-clip px-4 py-5 sm:px-10">
      <SiteNav active="about" />
      <DecorLine />
      <PageSlide>
        <Suspense fallback={null}>
          <AboutData />
        </Suspense>
      </PageSlide>
    </main>
  );
}
