"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "./AdminToast";
import { ABOUT_DEFAULT } from "../../lib/about-defaults";
import { kompresGambar } from "../../lib/compress-image";
import type { AboutEntri } from "../../lib/profile";
import LogoRiwayat from "../ui/LogoRiwayat";

type Nilai = {
  name: string;
  description: string;
  experience: AboutEntri[];
  education: AboutEntri[];
};

type KunciTeks = "year" | "title" | "detail";
type Pembaruan = (prev: AboutEntri[]) => AboutEntri[];

const DESKRIPSI_MAX = 330;
const TAMPIL_MAX = 1;
const TOTAL_MAX = 30;
const FOTO_MAX = 8;
const FOTO_ASLI_MAX_BYTE = 15 * 1024 * 1024;
// Logo diunggah apa adanya (tanpa kompres, supaya transparansi PNG aman),
// jadi batasnya sama dengan batas server.
const LOGO_MAX_BYTE = 5 * 1024 * 1024;
const TIPE_BOLEH = ["image/jpeg", "image/png", "image/webp"];

const KOLOM_ENTRI: { key: KunciTeks; label: string; max: number }[] = [
  { key: "year", label: "Tahun", max: 15 },
  { key: "title", label: "Judul", max: 40 },
  { key: "detail", label: "Detail", max: 45 },
];

const KELAS_INPUT =
  "block w-full rounded-md border border-border bg-background px-3 py-2 text-body text-foreground focus:border-muted focus:outline-none disabled:opacity-60";

const KELAS_TOMBOL_DASAR =
  "rounded-full border border-border bg-background px-4 py-1 text-label uppercase text-foreground";

const KELAS_TOMBOL_KECIL = `${KELAS_TOMBOL_DASAR} enabled:hover:border-muted disabled:cursor-not-allowed disabled:opacity-40`;

// Tombol berbentuk <label> (pembungkus input file).
function kelasLabelTombol(nonaktif: boolean): string {
  return `${KELAS_TOMBOL_DASAR} ${
    nonaktif ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:border-muted"
  }`;
}

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// show kosong (data lama) dianggap true.
function tampil(e: AboutEntri): boolean {
  return e.show !== false;
}

function hitungTampil(daftar: AboutEntri[]): number {
  return daftar.filter(tampil).length;
}

function fotoSama(a?: string[], b?: string[]): boolean {
  const x = a ?? [];
  const y = b ?? [];
  return x.length === y.length && x.every((u, i) => u === y[i]);
}

function samaEntri(a: AboutEntri[], b: AboutEntri[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (e, i) =>
        norm(e.year) === norm(b[i].year) &&
        norm(e.title) === norm(b[i].title) &&
        norm(e.detail) === norm(b[i].detail) &&
        tampil(e) === tampil(b[i]) &&
        (e.logo ?? "") === (b[i].logo ?? "") &&
        fotoSama(e.photos, b[i].photos)
    )
  );
}

// Data lama bisa punya lebih dari TAMPIL_MAX entri tampil (batas dulu lebih
// longgar). Sisakan yang pertama saja supaya form tidak buntu saat disimpan.
function rapikanDaftar(daftar: AboutEntri[]): AboutEntri[] {
  let sisa = TAMPIL_MAX;
  return daftar.map((e) => {
    if (!tampil(e)) return e;
    if (sisa > 0) {
      sisa -= 1;
      return e;
    }
    return { ...e, show: false };
  });
}

function rapikanNilai(n: Nilai): Nilai {
  return {
    ...n,
    experience: rapikanDaftar(n.experience),
    education: rapikanDaftar(n.education),
  };
}

// Entri lama bisa punya lebih dari FOTO_MAX foto (batas dulu 10). Foto tidak
// dihapus otomatis; simpan diblokir sampai admin mengurangi sendiri.
function cariFotoBerlebih(judul: string, daftar: AboutEntri[]): string | null {
  for (let i = 0; i < daftar.length; i += 1) {
    const jumlah = daftar[i].photos?.length ?? 0;
    if (jumlah > FOTO_MAX) {
      return `${judul}, entri ${i + 1}: ${jumlah} foto. Maksimal ${FOTO_MAX} foto per entri, hapus ${
        jumlah - FOTO_MAX
      } foto dulu.`;
    }
  }
  return null;
}

// Semua URL foto yang sudah tersimpan di database.
function kumpulFoto(n: Nilai): Set<string> {
  const hasil = new Set<string>();
  for (const daftar of [n.experience, n.education]) {
    for (const e of daftar) {
      for (const u of e.photos ?? []) hasil.add(u);
      if (e.logo) hasil.add(e.logo);
    }
  }
  return hasil;
}

// Buang file foto yang belum tersimpan di entri mana pun (best effort).
function lepasFile(url: string) {
  void fetch("/api/admin/profile/riwayat-foto", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => undefined);
}

function EntriEditor({
  prefix,
  judul,
  daftar,
  onChange,
  disabled,
  tersimpan,
  onFotoSibuk,
}: {
  prefix: string;
  judul: string;
  daftar: AboutEntri[];
  onChange: (pembaruan: Pembaruan) => void;
  disabled: boolean;
  tersimpan: Set<string>;
  onFotoSibuk: (sibuk: boolean) => void;
}) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [fotoSibukIdx, setFotoSibukIdx] = useState<number | null>(null);
  const jumlahTampil = hitungTampil(daftar);
  const kunciFoto = disabled || fotoSibukIdx !== null;
  const jenis = prefix === "exp" ? "experience" : "education";

  function ubah(i: number, kunci: KunciTeks, nilai: string) {
    onChange((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [kunci]: nilai } : e))
    );
  }

  // Mencentang satu entri otomatis melepas centang entri lain di blok ini.
  function ubahTampil(i: number, nilai: boolean) {
    onChange((prev) =>
      prev.map((e, idx) => {
        if (idx === i) return { ...e, show: nilai };
        return nilai ? { ...e, show: false } : e;
      })
    );
  }

  function hapusFoto(i: number, url: string) {
    if (!tersimpan.has(url)) lepasFile(url);
    onChange((prev) =>
      prev.map((e, idx) =>
        idx === i
          ? { ...e, photos: (e.photos ?? []).filter((u) => u !== url) }
          : e
      )
    );
  }

  function hapusEntri(i: number) {
    for (const url of daftar[i]?.photos ?? []) {
      if (!tersimpan.has(url)) lepasFile(url);
    }
    const logoLama = daftar[i]?.logo;
    if (logoLama && !tersimpan.has(logoLama)) lepasFile(logoLama);
    onChange((prev) => prev.filter((_, idx) => idx !== i));
  }

  function hapusLogo(i: number) {
    const lama = daftar[i]?.logo;
    if (lama && !tersimpan.has(lama)) lepasFile(lama);
    onChange((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, logo: undefined } : e))
    );
  }

  async function onPilihLogo(i: number, ev: ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    ev.target.value = "";
    if (!f || fotoSibukIdx !== null) return;

    if (!TIPE_BOLEH.includes(f.type)) {
      showToast("Logo harus berformat JPG, PNG, atau WebP.");
      return;
    }
    if (f.size > LOGO_MAX_BYTE) {
      showToast("Ukuran logo maksimal 5 MB.");
      return;
    }

    setFotoSibukIdx(i);
    onFotoSibuk(true);
    try {
      const fd = new FormData();
      fd.append("file", f, f.name);
      const res = await fetch("/api/admin/profile/riwayat-foto", {
        method: "POST",
        body: fd,
      });
      if (res.status === 401) {
        showToast("Sesi habis. Silakan masuk lagi.");
        router.replace("/admin/login");
        router.refresh();
        return;
      }
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        url?: string;
      } | null;
      if (!res.ok || !json?.url) {
        showToast(json?.error ?? "Logo gagal diunggah.");
        return;
      }
      const url = json.url;
      const lama = daftar[i]?.logo;
      onChange((prev) =>
        prev.map((e, idx) => (idx === i ? { ...e, logo: url } : e))
      );
      // Logo lama yang belum pernah tersimpan dibuang dari storage.
      if (lama && !tersimpan.has(lama)) lepasFile(lama);
    } catch {
      showToast("Logo gagal diunggah. Cek koneksi lalu coba lagi.");
    } finally {
      setFotoSibukIdx(null);
      onFotoSibuk(false);
    }
  }

  async function onPilihFoto(i: number, ev: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(ev.target.files ?? []);
    ev.target.value = "";
    if (files.length === 0 || fotoSibukIdx !== null) return;

    let sisa = FOTO_MAX - (daftar[i]?.photos?.length ?? 0);
    setFotoSibukIdx(i);
    onFotoSibuk(true);
    try {
      for (const f of files) {
        if (!TIPE_BOLEH.includes(f.type)) {
          showToast(`${f.name}: hanya JPG, PNG, atau WebP.`);
          continue;
        }
        if (f.size > FOTO_ASLI_MAX_BYTE) {
          showToast(`${f.name}: lebih dari 15 MB.`);
          continue;
        }
        if (sisa <= 0) {
          showToast(`Maksimal ${FOTO_MAX} foto per entri.`);
          break;
        }
        try {
          const kecil = await kompresGambar(f);
          const fd = new FormData();
          fd.append("file", kecil, kecil.name);
          const res = await fetch("/api/admin/profile/riwayat-foto", {
            method: "POST",
            body: fd,
          });
          if (res.status === 401) {
            showToast("Sesi habis. Silakan masuk lagi.");
            router.replace("/admin/login");
            router.refresh();
            return;
          }
          const json = (await res.json().catch(() => null)) as {
            error?: string;
            url?: string;
          } | null;
          if (!res.ok || !json?.url) {
            showToast(json?.error ?? `${f.name}: gagal diunggah.`);
            continue;
          }
          const url = json.url;
          onChange((prev) =>
            prev.map((e, idx) =>
              idx === i ? { ...e, photos: [...(e.photos ?? []), url] } : e
            )
          );
          sisa -= 1;
        } catch (err) {
          showToast(
            err instanceof Error
              ? `${f.name}: ${err.message}`
              : `${f.name}: gagal diproses.`
          );
        }
      }
    } finally {
      setFotoSibukIdx(null);
      onFotoSibuk(false);
    }
  }

  return (
    <section
      aria-labelledby={`${prefix}-judul`}
      className="space-y-5 rounded-lg border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0 space-y-1">
          <p
            id={`${prefix}-judul`}
            className="text-body font-semibold text-foreground"
          >
            {judul}
          </p>
          <p className="text-caption text-muted">
            Semua entri tampil di bagian detail di bawah About. Centang satu
            entri untuk ikut tampil di bagian atas About ({jumlahTampil}/
            {TAMPIL_MAX}).
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-caption text-muted">
          {daftar.length}/{TOTAL_MAX} entri
        </span>
      </div>

      {daftar.length === 0 ? (
        <p className="text-caption text-muted">
          Belum ada entri. Blok {judul} disembunyikan di bagian atas About.
        </p>
      ) : null}

      {daftar.length > 0 && jumlahTampil === 0 ? (
        <p className="text-caption text-muted">
          Tidak ada entri yang dicentang, jadi blok {judul} disembunyikan di
          bagian atas About (entri tetap tampil di bagian detail).
        </p>
      ) : null}

      {daftar.map((entri, i) => {
        const dicentang = tampil(entri);
        const foto = entri.photos ?? [];
        const fotoPenuh = foto.length >= FOTO_MAX;
        const fieldTeks = (k: (typeof KOLOM_ENTRI)[number]) => (
          <div key={k.key} className="min-w-0 space-y-1">
            <label
              htmlFor={`${prefix}-${i}-${k.key}`}
              className="flex items-baseline justify-between gap-2 text-caption text-muted"
            >
              <span>{k.label}</span>
              <span>
                {entri[k.key].length}/{k.max}
              </span>
            </label>
            <input
              id={`${prefix}-${i}-${k.key}`}
              type="text"
              value={entri[k.key]}
              maxLength={k.max}
              disabled={disabled}
              onChange={(e) => ubah(i, k.key, e.target.value)}
              className={KELAS_INPUT}
            />
          </div>
        );

        return (
          <div
            key={i}
            className="space-y-4 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-label uppercase text-foreground">
                Entri {i + 1}
              </p>
              <button
                type="button"
                disabled={kunciFoto}
                onClick={() => hapusEntri(i)}
                className={KELAS_TOMBOL_KECIL}
              >
                Hapus entri
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
              {fieldTeks(KOLOM_ENTRI[0])}
              {fieldTeks(KOLOM_ENTRI[1])}
            </div>
            {fieldTeks(KOLOM_ENTRI[2])}

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-caption text-muted">
                Logo. Kosongkan untuk memakai logo bawaan (
                {jenis === "experience" ? "ikon koper" : "ikon topi wisuda"}).
                Tampil di samping teks entri di halaman About. JPG, PNG, atau
                WebP, maksimal 5 MB; PNG transparan paling rapi.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <LogoRiwayat
                  jenis={jenis}
                  url={entri.logo}
                  ukuran={56}
                  alt={`Logo entri ${i + 1}`}
                />
                <label className={kelasLabelTombol(kunciFoto)}>
                  {fotoSibukIdx === i
                    ? "Mengunggah..."
                    : entri.logo
                      ? "Ganti logo"
                      : "Unggah logo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={kunciFoto}
                    onChange={(ev) => void onPilihLogo(i, ev)}
                    className="hidden"
                  />
                </label>
                {entri.logo ? (
                  <button
                    type="button"
                    disabled={kunciFoto}
                    onClick={() => hapusLogo(i)}
                    className={KELAS_TOMBOL_KECIL}
                  >
                    Hapus logo
                  </button>
                ) : null}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label
                htmlFor={`${prefix}-${i}-show`}
                className="flex items-center gap-2 text-body text-foreground"
              >
                <input
                  id={`${prefix}-${i}-show`}
                  type="checkbox"
                  checked={dicentang}
                  disabled={disabled}
                  onChange={(e) => ubahTampil(i, e.target.checked)}
                  className="h-4 w-4 accent-foreground disabled:cursor-not-allowed"
                />
                Tampilkan di bagian atas About
              </label>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-caption text-muted">
                Foto bukti ({foto.length}/{FOTO_MAX}). Maksimal {FOTO_MAX}{" "}
                supaya tampilan rapi. Tampil di bagian detail di bawah About.
              </p>

              {foto.length > FOTO_MAX ? (
                <p className="rounded-md border border-border bg-surface p-2 text-caption text-foreground">
                  Entri ini punya {foto.length} foto, lebih dari batas{" "}
                  {FOTO_MAX}. Hapus {foto.length - FOTO_MAX} foto sebelum
                  menyimpan.
                </p>
              ) : null}

              {foto.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {foto.map((url, n) => (
                    <li key={url} className="w-20 space-y-1">
                      <div className="h-20 w-20 overflow-hidden rounded-md border border-border bg-surface">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Foto ${n + 1} untuk entri ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={kunciFoto}
                        onClick={() => hapusFoto(i, url)}
                        className="w-full rounded-full border border-border bg-background px-2 py-0.5 text-caption text-foreground enabled:hover:border-muted disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <label className={kelasLabelTombol(kunciFoto || fotoPenuh)}>
                  {fotoSibukIdx === i ? "Mengunggah..." : "Tambah foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={kunciFoto || fotoPenuh}
                    onChange={(ev) => void onPilihFoto(i, ev)}
                    className="hidden"
                  />
                </label>
                <p className="text-caption text-muted">
                  {fotoPenuh
                    ? `Batas ${FOTO_MAX} foto tercapai.`
                    : "JPG, PNG, atau WebP. Dikompres otomatis."}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {daftar.length < TOTAL_MAX ? (
        <button
          type="button"
          disabled={kunciFoto}
          onClick={() =>
            onChange((prev) => [
              ...prev,
              {
                year: "",
                title: "",
                detail: "",
                show: hitungTampil(prev) < TAMPIL_MAX,
                photos: [],
              },
            ])
          }
          className={KELAS_TOMBOL_KECIL}
        >
          Tambah entri
        </button>
      ) : (
        <p className="text-caption text-muted">
          Batas {TOTAL_MAX} entri sudah tercapai.
        </p>
      )}
    </section>
  );
}

function kirimEntri(daftar: AboutEntri[]): AboutEntri[] {
  return daftar.map((e) => ({
    ...e,
    show: tampil(e),
    photos: e.photos ?? [],
  }));
}

export function AboutForm({ awal }: { awal: Nilai }) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [nilai, setNilai] = useState<Nilai>(() => rapikanNilai(awal));
  // Dihitung sekali saat form dipasang: apakah data lama perlu dirapikan.
  const [dirapikan] = useState(
    () =>
      !samaEntri(awal.experience, rapikanDaftar(awal.experience)) ||
      !samaEntri(awal.education, rapikanDaftar(awal.education))
  );
  const [error, setError] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [fotoSibuk, setFotoSibuk] = useState(0);

  const tersimpan = kumpulFoto(awal);

  function catatFotoSibuk(sibuk: boolean) {
    setFotoSibuk((n) => Math.max(0, n + (sibuk ? 1 : -1)));
  }

  async function simpan() {
    if (menyimpan || fotoSibuk > 0) return;
    setError("");

    if (
      hitungTampil(nilai.experience) > TAMPIL_MAX ||
      hitungTampil(nilai.education) > TAMPIL_MAX
    ) {
      setError(
        `Maksimal ${TAMPIL_MAX} entri yang ditampilkan di bagian atas About per blok.`
      );
      return;
    }

    const berlebih =
      cariFotoBerlebih("Experience", nilai.experience) ??
      cariFotoBerlebih("Education", nilai.education);
    if (berlebih) {
      setError(berlebih);
      return;
    }

    setMenyimpan(true);
    try {
      // Nilai yang sama dengan bawaan dikirim sebagai kosong (= pakai bawaan).
      const payload = {
        name:
          norm(nilai.name) === norm(ABOUT_DEFAULT.name) ? "" : nilai.name,
        description:
          norm(nilai.description) === norm(ABOUT_DEFAULT.description)
            ? ""
            : nilai.description,
        experience: samaEntri(nilai.experience, ABOUT_DEFAULT.experience)
          ? null
          : kirimEntri(nilai.experience),
        education: samaEntri(nilai.education, ABOUT_DEFAULT.education)
          ? null
          : kirimEntri(nilai.education),
      };

      const res = await fetch("/api/admin/profile/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (res.status === 401) {
        showToast("Sesi habis. Silakan masuk lagi.");
        router.replace("/admin/login");
        router.refresh();
        return;
      }

      if (!res.ok) {
        setError(json?.error ?? "Gagal menyimpan konten About.");
        return;
      }

      showToast("Konten About berhasil disimpan.");
      router.refresh();
    } catch {
      setError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div className="space-y-10">
      {dirapikan ? (
        <p className="rounded-md border border-border bg-surface p-3 text-caption text-foreground">
          Data lama punya lebih dari {TAMPIL_MAX} entri yang tampil di bagian
          atas About. Form otomatis menyisakan yang pertama per blok. Klik
          &quot;Simpan konten About&quot; untuk menerapkannya.
        </p>
      ) : null}

      <section
        aria-labelledby="about-profil-judul"
        className="space-y-5 rounded-lg border border-border bg-surface p-5"
      >
        <div className="border-b border-border pb-4">
          <p
            id="about-profil-judul"
            className="text-body font-semibold text-foreground"
          >
            Nama dan deskripsi
          </p>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="about-name"
            className="block text-label uppercase text-muted"
          >
            Nama
          </label>
          <input
            id="about-name"
            type="text"
            value={nilai.name}
            maxLength={40}
            disabled={menyimpan}
            onChange={(e) => setNilai({ ...nilai, name: e.target.value })}
            className={KELAS_INPUT}
          />
          <p className="text-caption text-muted">
            Maksimal 4 kata dan 24 karakter. Kata ketiga dan seterusnya
            otomatis disingkat jadi inisial (&quot;evi azzahra fauziah&quot;
            menjadi &quot;Evi Azzahra F&quot;).
          </p>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="about-description"
            className="block text-label uppercase text-muted"
          >
            Deskripsi
          </label>
          <textarea
            id="about-description"
            value={nilai.description}
            maxLength={DESKRIPSI_MAX}
            rows={6}
            disabled={menyimpan}
            onChange={(e) =>
              setNilai({ ...nilai, description: e.target.value })
            }
            className={KELAS_INPUT}
          />
          <p className="text-caption text-muted">
            {nilai.description.length}/{DESKRIPSI_MAX} karakter. Kosongkan
            untuk memakai teks bawaan.
          </p>
        </div>
      </section>

      <EntriEditor
        prefix="exp"
        judul="Experience"
        daftar={nilai.experience}
        disabled={menyimpan}
        tersimpan={tersimpan}
        onFotoSibuk={catatFotoSibuk}
        onChange={(fn) =>
          setNilai((p) => ({ ...p, experience: fn(p.experience) }))
        }
      />

      <EntriEditor
        prefix="edu"
        judul="Education"
        daftar={nilai.education}
        disabled={menyimpan}
        tersimpan={tersimpan}
        onFotoSibuk={catatFotoSibuk}
        onChange={(fn) =>
          setNilai((p) => ({ ...p, education: fn(p.education) }))
        }
      />

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-surface p-3 text-caption text-foreground"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={simpan}
        disabled={menyimpan || fotoSibuk > 0}
        className="rounded-full bg-foreground px-5 py-2 text-label uppercase text-background disabled:cursor-not-allowed disabled:opacity-40"
      >
        {menyimpan
          ? "Menyimpan..."
          : fotoSibuk > 0
            ? "Menunggu foto..."
            : "Simpan konten About"}
      </button>
    </div>
  );
}