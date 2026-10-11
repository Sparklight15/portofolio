"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "./AdminToast";
import { ABOUT_DEFAULT } from "../../lib/about-defaults";
import { kompresGambar } from "../../lib/compress-image";
import type { AboutEntri } from "../../lib/profile";

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
const FOTO_MAX = 10;
const FOTO_ASLI_MAX_BYTE = 15 * 1024 * 1024;
const TIPE_BOLEH = ["image/jpeg", "image/png", "image/webp"];

const KOLOM_ENTRI: { key: KunciTeks; label: string; max: number }[] = [
  { key: "year", label: "Tahun", max: 15 },
  { key: "title", label: "Judul", max: 40 },
  { key: "detail", label: "Detail", max: 45 },
];

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
        fotoSama(e.photos, b[i].photos)
    )
  );
}

// Semua URL foto yang sudah tersimpan di database.
function kumpulFoto(n: Nilai): Set<string> {
  const hasil = new Set<string>();
  for (const daftar of [n.experience, n.education]) {
    for (const e of daftar) {
      for (const u of e.photos ?? []) hasil.add(u);
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

  function ubah(i: number, kunci: KunciTeks, nilai: string) {
    onChange((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [kunci]: nilai } : e))
    );
  }

  function ubahTampil(i: number, nilai: boolean) {
    onChange((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, show: nilai } : e))
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
    onChange((prev) => prev.filter((_, idx) => idx !== i));
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
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-label uppercase text-muted">{judul}</p>
        <p className="text-caption text-muted">
          {jumlahTampil}/{TAMPIL_MAX} tampil di About · {daftar.length}/
          {TOTAL_MAX} entri tersimpan
        </p>
      </div>

      {daftar.length === 0 ? (
        <p className="text-caption text-muted">
          Belum ada entri. Blok {judul} disembunyikan di halaman About.
        </p>
      ) : null}

      {daftar.length > 0 && jumlahTampil === 0 ? (
        <p className="text-caption text-muted">
          Tidak ada entri yang dicentang, jadi blok {judul} disembunyikan di
          halaman About (entri tetap tersimpan).
        </p>
      ) : null}

      {jumlahTampil > TAMPIL_MAX ? (
        <p className="text-caption text-foreground">
          Batas sekarang {TAMPIL_MAX} entri yang tampil di About. Lepas centang
          sampai tersisa {TAMPIL_MAX} sebelum menyimpan.
        </p>
      ) : null}

      {daftar.map((entri, i) => {
        const dicentang = tampil(entri);
        const centangTerkunci = !dicentang && jumlahTampil >= TAMPIL_MAX;
        const foto = entri.photos ?? [];
        return (
          <div key={i} className="space-y-3 border border-border p-3">
            {KOLOM_ENTRI.map((k) => (
              <div key={k.key} className="space-y-1">
                <label
                  htmlFor={`${prefix}-${i}-${k.key}`}
                  className="block text-caption text-muted"
                >
                  {k.label}
                </label>
                <input
                  id={`${prefix}-${i}-${k.key}`}
                  type="text"
                  value={entri[k.key]}
                  maxLength={k.max}
                  disabled={disabled}
                  onChange={(e) => ubah(i, k.key, e.target.value)}
                  className="block w-full border border-foreground bg-background px-3 py-2 text-body text-foreground"
                />
                <p className="text-caption text-muted">
                  {entri[k.key].length}/{k.max} karakter
                </p>
              </div>
            ))}

            <div className="space-y-1">
              <label
                htmlFor={`${prefix}-${i}-show`}
                className="flex items-center gap-2 text-body text-foreground"
              >
                <input
                  id={`${prefix}-${i}-show`}
                  type="checkbox"
                  checked={dicentang}
                  disabled={disabled || centangTerkunci}
                  onChange={(e) => ubahTampil(i, e.target.checked)}
                  className="h-4 w-4 accent-foreground disabled:cursor-not-allowed"
                />
                Tampilkan di About
              </label>
              {centangTerkunci ? (
                <p className="text-caption text-muted">
                  Sudah {TAMPIL_MAX} entri yang tampil. Hapus centang di entri
                  lain dulu.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-caption text-muted">
                Foto bukti ({foto.length}/{FOTO_MAX}). Tampil di halaman
                riwayat, bukan di About.
              </p>

              {foto.length > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {foto.map((url, n) => (
                    <li key={url} className="w-24 space-y-1">
                      <div className="h-24 w-24 overflow-hidden border border-border bg-surface">
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
                        className="w-full rounded-full border border-foreground bg-background px-2 py-1 text-caption text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <label
                  className={`rounded-full border border-foreground bg-background px-4 py-1 text-label uppercase text-foreground ${
                    kunciFoto || foto.length >= FOTO_MAX
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer"
                  }`}
                >
                  {fotoSibukIdx === i ? "Mengunggah..." : "Tambah foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={kunciFoto || foto.length >= FOTO_MAX}
                    onChange={(ev) => void onPilihFoto(i, ev)}
                    className="hidden"
                  />
                </label>
                <p className="text-caption text-muted">
                  JPG, PNG, atau WebP. Dikompres otomatis.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={kunciFoto}
              onClick={() => hapusEntri(i)}
              className="rounded-full border border-foreground bg-background px-4 py-1 text-label uppercase text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hapus entri
            </button>
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
          className="rounded-full border border-foreground bg-background px-4 py-1 text-label uppercase text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          Tambah entri
        </button>
      ) : (
        <p className="text-caption text-muted">
          Batas {TOTAL_MAX} entri sudah tercapai.
        </p>
      )}
    </div>
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
  const [nilai, setNilai] = useState<Nilai>(awal);
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
        `Maksimal ${TAMPIL_MAX} entri yang ditampilkan di About per blok.`
      );
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
    <div className="space-y-6">
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
          className="block w-full border border-foreground bg-background px-3 py-2 text-body text-foreground"
        />
        <p className="text-caption text-muted">
          Maksimal 4 kata dan 24 karakter. Kata ketiga dan seterusnya otomatis
          disingkat jadi inisial (&quot;evi azzahra fauziah&quot; menjadi
          &quot;Evi Azzahra F&quot;).
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
          onChange={(e) => setNilai({ ...nilai, description: e.target.value })}
          className="block w-full border border-foreground bg-background px-3 py-2 text-body text-foreground"
        />
        <p className="text-caption text-muted">
          {nilai.description.length}/{DESKRIPSI_MAX} karakter. Kosongkan untuk
          memakai teks bawaan.
        </p>
      </div>

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
        <p role="alert" className="text-caption text-foreground">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={simpan}
        disabled={menyimpan || fotoSibuk > 0}
        className="rounded-full border border-foreground bg-foreground px-5 py-2 text-label uppercase text-background disabled:cursor-not-allowed disabled:opacity-40"
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