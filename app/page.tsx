import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { HomeHero } from "../components/public/HomeHero";
import type { HomeKonten } from "../components/public/HomeHero";
import { SiteNav } from "../components/public/SiteNav";
import { getProfile } from "../lib/profile";

export const metadata: Metadata = {
  title: "Evi Fauziah | Portofolio",
  description: "Portofolio Evi Fauziah, fresh graduate bidang data.",
};

async function HomeData() {
  await connection();

  let konten: HomeKonten | undefined;
  try {
    const profil = await getProfile();
    konten = {
      kicker1: profil.homeKicker1,
      kicker2: profil.homeKicker2,
      greeting: profil.homeGreeting,
      label1: profil.homeLabel1,
      label2: profil.homeLabel2,
      label3: profil.homeLabel3,
      imageUrl: profil.homeImageUrl,
    };
  } catch (e) {
    console.error("Gagal membaca konten Home:", e);
  }

  return <HomeHero konten={konten} />;
}

// justify-start: garis dekoratif harus di posisi yang sama di semua halaman.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col justify-start gap-3 overflow-x-clip px-4 py-5 sm:px-10">
      <SiteNav active="home" />
      <Suspense fallback={<HomeHero />}>
        <HomeData />
      </Suspense>
    </main>
  );
}