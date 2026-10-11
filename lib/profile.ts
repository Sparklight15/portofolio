import { getSupabaseAdmin } from "./supabase-server";

const BUCKET = "site-files";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB, sama dengan batas bucket

// Satu entri Experience atau Education.
// show: true = tampil di halaman About (maksimal 1 per blok).
// Semua entri tetap tampil di halaman riwayat lengkap.
// show kosong (data lama) dianggap true.
// photos: URL foto bukti kegiatan (maksimal 10), tampil di halaman riwayat.
export type AboutEntri = {
  year: string;
  title: string;
  detail: string;
  show?: boolean;
  photos?: string[];
};

export type Profile = {
  cvUrl: string | null;
  cvFilename: string | null;
  photoUrl: string | null;
  // Foto halaman Contact (terpisah dari foto About). null = pakai foto bawaan.
  contactPhotoUrl: string | null;
  updatedAt: string | null;
  // Konten Home. null = pakai teks/gambar bawaan di kode.
  homeKicker1: string | null;
  homeKicker2: string | null;
  homeGreeting: string | null;
  homeLabel1: string | null;
  homeLabel2: string | null;
  homeLabel3: string | null;
  homeImageUrl: string | null;
  // Konten About. null = pakai bawaan di kode; [] = blok disembunyikan.
  aboutName: string | null;
  aboutDescription: string | null;
  aboutExperience: AboutEntri[] | null;
  aboutEducation: AboutEntri[] | null;
};

// Maksimal foto per entri Experience/Education.
export const RIWAYAT_FOTO_MAX = 10;

// Ubah nilai jsonb dari database menjadi daftar entri yang aman.
// Bukan array = null (pakai bawaan).
function bacaEntri(nilai: unknown): AboutEntri[] | null {
  if (!Array.isArray(nilai)) return null;
  const hasil: AboutEntri[] = [];
  for (const item of nilai) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    const photos = Array.isArray(o.photos)
      ? o.photos
          .filter(
            (u): u is string => typeof u === "string" && /^https?:\/\//i.test(u)
          )
          .slice(0, RIWAYAT_FOTO_MAX)
      : [];
    hasil.push({
      year: typeof o.year === "string" ? o.year : "",
      title: typeof o.title === "string" ? o.title : "",
      detail: typeof o.detail === "string" ? o.detail : "",
      show: o.show !== false,
      photos,
    });
  }
  return hasil;
}

// Baca informasi pribadi (satu baris di tabel profile).
// Dipakai halaman Home, About, Contact, dan halaman admin.
export async function getProfile(): Promise<Profile> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profile")
    .select(
      "cv_url, cv_filename, photo_url, contact_photo_url, updated_at, home_kicker_1, home_kicker_2, home_greeting, home_label_1, home_label_2, home_label_3, home_image_url, about_name, about_description, about_experience, about_education"
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca profil: ${error.message}`);
  }

  return {
    cvUrl: data?.cv_url ?? null,
    cvFilename: data?.cv_filename ?? null,
    photoUrl: data?.photo_url ?? null,
    contactPhotoUrl: data?.contact_photo_url ?? null,
    updatedAt: data?.updated_at ?? null,
    homeKicker1: data?.home_kicker_1 ?? null,
    homeKicker2: data?.home_kicker_2 ?? null,
    homeGreeting: data?.home_greeting ?? null,
    homeLabel1: data?.home_label_1 ?? null,
    homeLabel2: data?.home_label_2 ?? null,
    homeLabel3: data?.home_label_3 ?? null,
    homeImageUrl: data?.home_image_url ?? null,
    aboutName: data?.about_name ?? null,
    aboutDescription: data?.about_description ?? null,
    aboutExperience: bacaEntri(data?.about_experience),
    aboutEducation: bacaEntri(data?.about_education),
  };
}

// Ambil path file di bucket dari URL publiknya.
function pathDariUrl(url: string): string | null {
  const penanda = `/${BUCKET}/`;
  const i = url.indexOf(penanda);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + penanda.length).split("?")[0]);
}

// ---------------------------------------------------------------- CV

// Validasi file CV. Mengembalikan pesan error, atau null kalau file valid.
export async function validasiCv(file: File): Promise<string | null> {
  if (file.size === 0) {
    return "File CV kosong.";
  }
  if (file.size > MAX_BYTES) {
    return "Ukuran CV maksimal 5 MB.";
  }
  if (file.type !== "application/pdf") {
    return "CV harus berformat PDF.";
  }

  // Cek isi file, bukan cuma tipe yang dilaporkan browser: PDF diawali "%PDF".
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const isPdf =
    head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
  if (!isPdf) {
    return "Isi file bukan PDF yang valid.";
  }

  return null;
}

// Unggah CV baru, simpan di tabel profile, lalu hapus file CV lama.
// Panggil validasiCv dulu sebelum fungsi ini.
export async function uploadCv(file: File): Promise<Profile> {
  const supabase = getSupabaseAdmin();

  const lama = await getProfile();

  // Nama file unik per unggahan supaya cache browser tidak menyajikan CV lama.
  const path = `cv/cv-${Date.now()}.pdf`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: errUpload } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });

  if (errUpload) {
    throw new Error(`Gagal mengunggah CV: ${errUpload.message}`);
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const filename = (file.name || "cv.pdf").slice(0, 120);
  const waktu = new Date().toISOString();

  const { error: errSimpan } = await supabase
    .from("profile")
    .update({
      cv_url: pub.publicUrl,
      cv_filename: filename,
      updated_at: waktu,
    })
    .eq("id", 1);

  if (errSimpan) {
    // Batalkan: hapus file yang baru saja diunggah supaya tidak jadi sampah.
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(`Gagal menyimpan data CV: ${errSimpan.message}`);
  }

  // Hapus CV lama (best effort: kalau gagal, CV baru tetap aktif).
  if (lama.cvUrl) {
    const pathLama = pathDariUrl(lama.cvUrl);
    if (pathLama && pathLama !== path) {
      await supabase.storage.from(BUCKET).remove([pathLama]);
    }
  }

  return {
    ...lama,
    cvUrl: pub.publicUrl,
    cvFilename: filename,
    updatedAt: waktu,
  };
}

// -------------------------------------------------------------- Foto

const EKSTENSI_FOTO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Validasi foto profil. Mengembalikan pesan error, atau null kalau valid.
export async function validasiFoto(file: File): Promise<string | null> {
  if (file.size === 0) {
    return "File foto kosong.";
  }
  if (file.size > MAX_BYTES) {
    return "Ukuran foto maksimal 5 MB.";
  }
  if (!EKSTENSI_FOTO[file.type]) {
    return "Foto harus berformat JPG, PNG, atau WebP.";
  }

  // Cek isi file, bukan cuma tipe yang dilaporkan browser.
  const h = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff;
  const png =
    h[0] === 0x89 && h[1] === 0x50 && h[2] === 0x4e && h[3] === 0x47;
  const webp =
    h[0] === 0x52 &&
    h[1] === 0x49 &&
    h[2] === 0x46 &&
    h[3] === 0x46 &&
    h[8] === 0x57 &&
    h[9] === 0x45 &&
    h[10] === 0x42 &&
    h[11] === 0x50;

  const cocok =
    (file.type === "image/jpeg" && jpeg) ||
    (file.type === "image/png" && png) ||
    (file.type === "image/webp" && webp);
  if (!cocok) {
    return "Isi file bukan gambar yang valid.";
  }

  return null;
}

// Unggah foto baru, simpan di tabel profile, lalu hapus foto lama.
// Panggil validasiFoto dulu sebelum fungsi ini.
// updated_at sengaja tidak diubah: kolom itu dipakai untuk waktu unggah CV.
export async function uploadFoto(file: File): Promise<Profile> {
  const supabase = getSupabaseAdmin();

  const lama = await getProfile();

  const ekstensi = EKSTENSI_FOTO[file.type];
  // Nama file unik per unggahan supaya cache browser tidak menyajikan foto lama.
  const path = `foto/foto-${Date.now()}.${ekstensi}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: errUpload } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (errUpload) {
    throw new Error(`Gagal mengunggah foto: ${errUpload.message}`);
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error: errSimpan } = await supabase
    .from("profile")
    .update({ photo_url: pub.publicUrl })
    .eq("id", 1);

  if (errSimpan) {
    // Batalkan: hapus file yang baru saja diunggah supaya tidak jadi sampah.
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(`Gagal menyimpan data foto: ${errSimpan.message}`);
  }

  // Hapus foto lama (best effort: kalau gagal, foto baru tetap aktif).
  if (lama.photoUrl) {
    const pathLama = pathDariUrl(lama.photoUrl);
    if (pathLama && pathLama !== path) {
      await supabase.storage.from(BUCKET).remove([pathLama]);
    }
  }

  return { ...lama, photoUrl: pub.publicUrl };
}

// ------------------------------------------------------- Foto Contact

// Unggah foto halaman Contact (terpisah dari foto About), simpan di kolom
// contact_photo_url, lalu hapus foto Contact lama.
// Panggil validasiFoto dulu sebelum fungsi ini.
// updated_at sengaja tidak diubah: kolom itu dipakai untuk waktu unggah CV.
export async function uploadFotoContact(file: File): Promise<Profile> {
  const supabase = getSupabaseAdmin();

  const lama = await getProfile();

  const ekstensi = EKSTENSI_FOTO[file.type];
  // Nama file unik per unggahan supaya cache browser tidak menyajikan foto lama.
  const path = `contact/foto-${Date.now()}.${ekstensi}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: errUpload } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (errUpload) {
    throw new Error(`Gagal mengunggah foto Contact: ${errUpload.message}`);
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error: errSimpan } = await supabase
    .from("profile")
    .update({ contact_photo_url: pub.publicUrl })
    .eq("id", 1);

  if (errSimpan) {
    // Batalkan: hapus file yang baru saja diunggah supaya tidak jadi sampah.
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(`Gagal menyimpan data foto Contact: ${errSimpan.message}`);
  }

  // Hapus foto Contact lama (best effort: kalau gagal, foto baru tetap aktif).
  if (lama.contactPhotoUrl) {
    const pathLama = pathDariUrl(lama.contactPhotoUrl);
    if (pathLama && pathLama !== path) {
      await supabase.storage.from(BUCKET).remove([pathLama]);
    }
  }

  return { ...lama, contactPhotoUrl: pub.publicUrl };
}

// ------------------------------------------------------------- Home

export type HomeTeks = {
  kicker1: string | null;
  kicker2: string | null;
  greeting: string | null;
  label1: string | null;
  label2: string | null;
  label3: string | null;
};

// Batas karakter per teks (Home dirancang muat satu layar).
const BATAS_TEKS: Record<keyof HomeTeks, number> = {
  kicker1: 40,
  kicker2: 40,
  greeting: 30,
  label1: 30,
  label2: 30,
  label3: 30,
};

const NAMA_TEKS: Record<keyof HomeTeks, string> = {
  kicker1: "Teks kecil 1",
  kicker2: "Teks kecil 2",
  greeting: "Sapaan",
  label1: "Label 1",
  label2: "Label 2",
  label3: "Label 3",
};

// Bersihkan dan validasi teks Home dari input mentah (JSON dari form).
// Teks kosong menjadi null (artinya: pakai teks bawaan di kode).
export function bersihkanTeksHome(
  input: unknown
): { error: string } | { data: HomeTeks } {
  if (typeof input !== "object" || input === null) {
    return { error: "Data tidak valid." };
  }
  const mentah = input as Record<string, unknown>;
  const hasil = {} as HomeTeks;

  for (const kunci of Object.keys(BATAS_TEKS) as (keyof HomeTeks)[]) {
    const nilai = mentah[kunci];
    if (nilai !== undefined && nilai !== null && typeof nilai !== "string") {
      return { error: `${NAMA_TEKS[kunci]} tidak valid.` };
    }
    // Buang karakter kontrol dan rapikan spasi.
    const teks = String(nilai ?? "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (teks.length > BATAS_TEKS[kunci]) {
      return {
        error: `${NAMA_TEKS[kunci]} maksimal ${BATAS_TEKS[kunci]} karakter.`,
      };
    }
    hasil[kunci] = teks === "" ? null : teks;
  }

  return { data: hasil };
}

// Simpan teks Home. Panggil bersihkanTeksHome dulu.
export async function simpanTeksHome(teks: HomeTeks): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("profile")
    .update({
      home_kicker_1: teks.kicker1,
      home_kicker_2: teks.kicker2,
      home_greeting: teks.greeting,
      home_label_1: teks.label1,
      home_label_2: teks.label2,
      home_label_3: teks.label3,
    })
    .eq("id", 1);

  if (error) {
    throw new Error(`Gagal menyimpan teks Home: ${error.message}`);
  }
}

// Ketentuan gambar karakter Home.
const GAMBAR_LEBAR_MIN = 600;
const GAMBAR_LEBAR_MAX = 3000;
const GAMBAR_RASIO_MIN = 1.35; // tinggi / lebar
const GAMBAR_RASIO_MAX = 1.6;

// Validasi gambar karakter: PNG, transparan, ukuran dan rasio sesuai.
// Mengembalikan pesan error, atau null kalau valid.
export async function validasiGambarHome(file: File): Promise<string | null> {
  if (file.size === 0) {
    return "File gambar kosong.";
  }
  if (file.size > MAX_BYTES) {
    return "Ukuran gambar maksimal 5 MB.";
  }
  if (file.type !== "image/png") {
    return "Gambar karakter harus berformat PNG.";
  }

  const b = new Uint8Array(await file.arrayBuffer());
  const tandaPng = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length < 33 || !tandaPng.every((v, i) => b[i] === v)) {
    return "Isi file bukan PNG yang valid.";
  }

  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const lebar = view.getUint32(16);
  const tinggi = view.getUint32(20);
  const tipeWarna = b[25];

  if (lebar < GAMBAR_LEBAR_MIN || lebar > GAMBAR_LEBAR_MAX) {
    return `Lebar gambar harus ${GAMBAR_LEBAR_MIN} sampai ${GAMBAR_LEBAR_MAX} px (gambarmu ${lebar} px).`;
  }
  const rasio = tinggi / lebar;
  if (rasio < GAMBAR_RASIO_MIN || rasio > GAMBAR_RASIO_MAX) {
    return `Rasio gambar harus portrait sekitar 2:3 (tinggi 1,35 sampai 1,6 kali lebar). Gambarmu ${lebar}x${tinggi} px.`;
  }

  // Transparansi: kanal alpha (tipe warna 4 atau 6), atau chunk tRNS.
  let transparan = tipeWarna === 4 || tipeWarna === 6;
  let pos = 8;
  while (!transparan && pos + 8 <= b.length) {
    const panjang = view.getUint32(pos);
    const jenis = String.fromCharCode(b[pos + 4], b[pos + 5], b[pos + 6], b[pos + 7]);
    if (jenis === "tRNS") {
      transparan = true;
      break;
    }
    if (jenis === "IDAT" || jenis === "IEND") break;
    pos += 12 + panjang;
  }
  if (!transparan) {
    return "Gambar harus punya latar transparan (tanpa background). Simpan sebagai PNG transparan.";
  }

  return null;
}

// Unggah gambar karakter Home, simpan di tabel profile, hapus gambar lama.
// Panggil validasiGambarHome dulu. updated_at tidak diubah.
export async function uploadGambarHome(file: File): Promise<Profile> {
  const supabase = getSupabaseAdmin();

  const lama = await getProfile();

  const path = `home/karakter-${Date.now()}.png`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: errUpload } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: "image/png", upsert: false });

  if (errUpload) {
    throw new Error(`Gagal mengunggah gambar karakter: ${errUpload.message}`);
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error: errSimpan } = await supabase
    .from("profile")
    .update({ home_image_url: pub.publicUrl })
    .eq("id", 1);

  if (errSimpan) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(`Gagal menyimpan gambar karakter: ${errSimpan.message}`);
  }

  if (lama.homeImageUrl) {
    const pathLama = pathDariUrl(lama.homeImageUrl);
    if (pathLama && pathLama !== path) {
      await supabase.storage.from(BUCKET).remove([pathLama]);
    }
  }

  return { ...lama, homeImageUrl: pub.publicUrl };
}

// ------------------------------------------------------------ About

export type AboutData = {
  name: string | null;
  description: string | null;
  experience: AboutEntri[] | null;
  education: AboutEntri[] | null;
};

const ABOUT_NAMA_MAX_KATA = 4;
const ABOUT_NAMA_MAX_KARAKTER = 24;
const ABOUT_DESKRIPSI_MAX = 330;
// Entri yang boleh tampil di halaman About (per blok). Sisanya hanya di
// halaman riwayat lengkap.
const ABOUT_ENTRI_TAMPIL_MAX = 1;
// Batas teknis jumlah seluruh entri per blok, supaya data tidak membengkak.
const ABOUT_ENTRI_TOTAL_MAX = 30;
const ABOUT_TAHUN_MAX = 15;
const ABOUT_JUDUL_MAX = 40;
const ABOUT_DETAIL_MAX = 45;

// Buang karakter kontrol, rapikan spasi. Mengembalikan undefined kalau
// nilainya bukan teks (dan bukan null/undefined).
function rapikanTeks(nilai: unknown): string | undefined {
  if (nilai === undefined || nilai === null) return "";
  if (typeof nilai !== "string") return undefined;
  return (
    nilai
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// Nama About: kata ke-1 dan ke-2 utuh, kata ke-3 dst jadi inisial.
// "evi azzahra fauziah" => "Evi Azzahra F".
function rapikanNama(teks: string): { error: string } | { nama: string } {
  const kata = teks.split(" ");
  if (kata.length > ABOUT_NAMA_MAX_KATA) {
    return { error: `Nama maksimal ${ABOUT_NAMA_MAX_KATA} kata.` };
  }
  const hasil = kata.map((k, i) => {
    const awal = k.charAt(0).toUpperCase();
    return i < 2 ? awal + k.slice(1) : awal;
  });
  const nama = hasil.join(" ");
  if (nama.length > ABOUT_NAMA_MAX_KARAKTER) {
    return {
      error: `Nama maksimal ${ABOUT_NAMA_MAX_KARAKTER} karakter (setelah disingkat).`,
    };
  }
  return { nama };
}

// Awalan URL publik foto riwayat di bucket sendiri. null kalau env belum ada.
function awalanUrlRiwayat(): string | null {
  const base = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/riwayat/`;
}

// Hanya URL file di folder riwayat/ pada bucket sendiri yang diterima.
function fotoRiwayatValid(url: string): boolean {
  const awalan = awalanUrlRiwayat();
  if (!awalan || url.length > 300 || !url.startsWith(awalan)) return false;
  return /^[A-Za-z0-9._-]+$/.test(url.slice(awalan.length));
}

// Bersihkan daftar foto satu entri. Tidak ada/null = daftar kosong.
function bersihkanFoto(
  input: unknown,
  label: string
): { error: string } | { data: string[] } {
  if (input === undefined || input === null) return { data: [] };
  if (!Array.isArray(input)) return { error: `${label}: data foto tidak valid.` };
  if (input.length > RIWAYAT_FOTO_MAX) {
    return {
      error: `${label}: maksimal ${RIWAYAT_FOTO_MAX} foto per entri.`,
    };
  }
  const hasil: string[] = [];
  for (const u of input) {
    if (typeof u !== "string" || !fotoRiwayatValid(u)) {
      return { error: `${label}: data foto tidak valid.` };
    }
    if (!hasil.includes(u)) hasil.push(u);
  }
  return { data: hasil };
}

// Bersihkan satu daftar entri (Experience atau Education).
// undefined/null = null (pakai bawaan). Array = daftar baru (boleh kosong).
// Jumlah entri bebas (sampai batas teknis), tapi yang show = true maksimal 1.
function bersihkanEntri(
  input: unknown,
  label: string
): { error: string } | { data: AboutEntri[] | null } {
  if (input === undefined || input === null) return { data: null };
  if (!Array.isArray(input)) return { error: `${label} tidak valid.` };
  if (input.length > ABOUT_ENTRI_TOTAL_MAX) {
    return { error: `${label} maksimal ${ABOUT_ENTRI_TOTAL_MAX} entri.` };
  }

  const hasil: AboutEntri[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) {
      return { error: `${label} tidak valid.` };
    }
    const o = item as Record<string, unknown>;
    const year = rapikanTeks(o.year);
    const title = rapikanTeks(o.title);
    const detail = rapikanTeks(o.detail);
    if (year === undefined || title === undefined || detail === undefined) {
      return { error: `${label} tidak valid.` };
    }
    if (
      o.show !== undefined &&
      o.show !== null &&
      typeof o.show !== "boolean"
    ) {
      return { error: `${label} tidak valid.` };
    }
    const foto = bersihkanFoto(o.photos, label);
    if ("error" in foto) return { error: foto.error };

    // Entri yang semua kolomnya kosong dibuang.
    if (!year && !title && !detail) continue;
    if (!title) {
      return { error: `${label}: judul wajib diisi untuk setiap entri.` };
    }
    if (year.length > ABOUT_TAHUN_MAX) {
      return { error: `${label}: tahun maksimal ${ABOUT_TAHUN_MAX} karakter.` };
    }
    if (title.length > ABOUT_JUDUL_MAX) {
      return { error: `${label}: judul maksimal ${ABOUT_JUDUL_MAX} karakter.` };
    }
    if (detail.length > ABOUT_DETAIL_MAX) {
      return { error: `${label}: detail maksimal ${ABOUT_DETAIL_MAX} karakter.` };
    }
    hasil.push({ year, title, detail, show: o.show !== false, photos: foto.data });
  }

  const jumlahTampil = hasil.filter((e) => e.show).length;
  if (jumlahTampil > ABOUT_ENTRI_TAMPIL_MAX) {
    return {
      error: `${label}: maksimal ${ABOUT_ENTRI_TAMPIL_MAX} entri yang ditampilkan di About. Hilangkan centang pada entri lain.`,
    };
  }
  return { data: hasil };
}

// Bersihkan dan validasi konten About dari input mentah (JSON dari form).
// name/description kosong = null (pakai bawaan).
// experience/education: null = pakai bawaan, [] = blok disembunyikan.
export function bersihkanAbout(
  input: unknown
): { error: string } | { data: AboutData } {
  if (typeof input !== "object" || input === null) {
    return { error: "Data tidak valid." };
  }
  const mentah = input as Record<string, unknown>;

  const namaMentah = rapikanTeks(mentah.name);
  if (namaMentah === undefined) return { error: "Nama tidak valid." };
  let name: string | null = null;
  if (namaMentah !== "") {
    const r = rapikanNama(namaMentah);
    if ("error" in r) return { error: r.error };
    name = r.nama;
  }

  const deskMentah = rapikanTeks(mentah.description);
  if (deskMentah === undefined) return { error: "Deskripsi tidak valid." };
  if (deskMentah.length > ABOUT_DESKRIPSI_MAX) {
    return { error: `Deskripsi maksimal ${ABOUT_DESKRIPSI_MAX} karakter.` };
  }
  const description = deskMentah === "" ? null : deskMentah;

  const exp = bersihkanEntri(mentah.experience, "Experience");
  if ("error" in exp) return { error: exp.error };
  const edu = bersihkanEntri(mentah.education, "Education");
  if ("error" in edu) return { error: edu.error };

  return {
    data: { name, description, experience: exp.data, education: edu.data },
  };
}

// Kumpulkan semua URL foto riwayat dari daftar entri.
function kumpulFoto(...daftar: (AboutEntri[] | null)[]): Set<string> {
  const hasil = new Set<string>();
  for (const d of daftar) {
    for (const e of d ?? []) {
      for (const u of e.photos ?? []) hasil.add(u);
    }
  }
  return hasil;
}

// Simpan konten About. Panggil bersihkanAbout dulu.
// Foto riwayat yang tidak ada lagi di data baru dihapus dari storage (best effort).
export async function simpanAbout(data: AboutData): Promise<void> {
  const supabase = getSupabaseAdmin();
  const lama = await getProfile();

  const { error } = await supabase
    .from("profile")
    .update({
      about_name: data.name,
      about_description: data.description,
      about_experience: data.experience,
      about_education: data.education,
    })
    .eq("id", 1);

  if (error) {
    throw new Error(`Gagal menyimpan konten About: ${error.message}`);
  }

  const baru = kumpulFoto(data.experience, data.education);
  const path: string[] = [];
  for (const u of kumpulFoto(lama.aboutExperience, lama.aboutEducation)) {
    if (baru.has(u)) continue;
    const p = pathDariUrl(u);
    if (p && p.startsWith("riwayat/")) path.push(p);
  }
  if (path.length > 0) {
    try {
      const { error: errHapus } = await supabase.storage
        .from(BUCKET)
        .remove(path);
      if (errHapus) {
        console.error("Gagal menghapus foto riwayat lama:", errHapus.message);
      }
    } catch (e) {
      console.error("Gagal menghapus foto riwayat lama:", e);
    }
  }
}

// ---------------------------------------------------------- Foto riwayat

// Unggah satu foto bukti kegiatan dan kembalikan URL publiknya. URL baru masuk
// ke data entri saat admin menekan "Simpan konten About".
// Panggil validasiFoto dulu sebelum fungsi ini.
export async function uploadFotoRiwayat(file: File): Promise<string> {
  const supabase = getSupabaseAdmin();

  const ekstensi = EKSTENSI_FOTO[file.type];
  const acak = Math.random().toString(36).slice(2, 8);
  const path = `riwayat/foto-${Date.now()}-${acak}.${ekstensi}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: errUpload } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (errUpload) {
    throw new Error(`Gagal mengunggah foto riwayat: ${errUpload.message}`);
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}

export type HasilLepas =
  | { ok: true }
  | { ok: false; error: string; status: number };

// Hapus foto yang sudah diunggah tapi belum tersimpan di entri mana pun
// (admin membuangnya sebelum menekan Simpan). Foto yang sudah tersimpan
// ditolak: itu dibersihkan otomatis oleh simpanAbout.
export async function hapusFotoRiwayatLepas(url: string): Promise<HasilLepas> {
  if (!fotoRiwayatValid(url)) {
    return { ok: false, error: "URL foto tidak valid.", status: 400 };
  }

  const profil = await getProfile();
  const dipakai = kumpulFoto(profil.aboutExperience, profil.aboutEducation);
  if (dipakai.has(url)) {
    return {
      ok: false,
      error:
        "Foto ini sudah tersimpan di entri. Hapus lewat tombol Simpan konten About.",
      status: 409,
    };
  }

  const p = pathDariUrl(url);
  if (!p || !p.startsWith("riwayat/")) {
    return { ok: false, error: "URL foto tidak valid.", status: 400 };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([p]);
  if (error) {
    console.error("Gagal menghapus foto riwayat:", error.message);
    return { ok: false, error: "Gagal menghapus foto.", status: 500 };
  }
  return { ok: true };
}