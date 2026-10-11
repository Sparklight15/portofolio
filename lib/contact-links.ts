import { getSupabaseAdmin } from "./supabase-server";

const BUCKET = "project-images";
const URL_MARKER = `/object/public/${BUCKET}/`;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CONTACT_MAX = 6;
export const NAMA_APP_MAX = 20;
export const URL_MAX = 300;
export const LOGO_MAX_BYTE = 2 * 1024 * 1024;

export type ContactLink = {
  id: string;
  appName: string;
  url: string;
  iconUrl: string | null;
  sortOrder: number;
};

export type HasilAksi =
  | { ok: true; id?: string; warning?: string }
  | { ok: false; error: string; status: number };

export function idLinkValid(id: string): boolean {
  return UUID_RE.test(id);
}

function pathDariUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const i = url.indexOf(URL_MARKER);
  if (i === -1) return null;
  const path = url.slice(i + URL_MARKER.length).split("?")[0];
  if (!path) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

// Tipe gambar ditentukan dari isi file, bukan dari ekstensi atau tipe kiriman browser.
function deteksiTipe(b: Uint8Array): { mime: string; ext: string } | null {
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return { mime: "image/png", ext: "png" };
  }
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

async function hapusFile(path: string | null): Promise<boolean> {
  if (!path) return true;
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error("Gagal menghapus file logo contact:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Gagal menghapus file logo contact:", e);
    return false;
  }
}

function iconAman(v: unknown): string | null {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim()) ? v.trim() : null;
}

function keLink(r: Record<string, unknown>): ContactLink {
  return {
    id: r.id as string,
    appName: r.app_name as string,
    url: r.url as string,
    iconUrl: iconAman(r.icon_url),
    sortOrder: (r.sort_order as number) ?? 0,
  };
}

// Validasi nama app dan url. url boleh http(s) atau mailto:.
export function validasiLink(
  input: unknown
): { ok: true; appName: string; url: string } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Data tidak valid." };
  }
  const { appName, url } = input as { appName?: unknown; url?: unknown };

  if (typeof appName !== "string" || typeof url !== "string") {
    return { ok: false, error: "Data tidak valid." };
  }

  const nama = appName.trim();
  if (nama.length < 1) return { ok: false, error: "Nama app wajib diisi." };
  if (nama.length > NAMA_APP_MAX) {
    return { ok: false, error: `Nama app maksimal ${NAMA_APP_MAX} karakter.` };
  }

  const link = url.trim();
  if (link.length < 1) return { ok: false, error: "Link wajib diisi." };
  if (link.length > URL_MAX) {
    return { ok: false, error: `Link maksimal ${URL_MAX} karakter.` };
  }

  if (/^mailto:/i.test(link)) {
    if (!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(link)) {
      return { ok: false, error: "Alamat email tidak valid." };
    }
  } else {
    let u: URL;
    try {
      u = new URL(link);
    } catch {
      return {
        ok: false,
        error: "Link harus diawali http://, https://, atau mailto:.",
      };
    }
    if ((u.protocol !== "http:" && u.protocol !== "https:") || !u.hostname) {
      return {
        ok: false,
        error: "Link harus diawali http://, https://, atau mailto:.",
      };
    }
  }

  return { ok: true, appName: nama, url: link };
}

// Semua link berurutan. Dipakai admin dan halaman publik /contact.
export async function getContactLinks(): Promise<{
  data: ContactLink[];
  error: string | null;
}> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_links")
      .select("id, app_name, url, icon_url, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return { data: [], error: error.message };
    return {
      data: (data ?? []).map((r) => keLink(r as Record<string, unknown>)),
      error: null,
    };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Terjadi kesalahan.",
    };
  }
}

export async function tambahLink(input: unknown): Promise<HasilAksi> {
  const v = validasiLink(input);
  if (!v.ok) return { ok: false, error: v.error, status: 400 };

  try {
    const supabase = getSupabaseAdmin();

    const { count, error: countError } = await supabase
      .from("contact_links")
      .select("id", { count: "exact", head: true });
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= CONTACT_MAX) {
      return {
        ok: false,
        error: `Maksimal ${CONTACT_MAX} link. Hapus salah satu dulu.`,
        status: 409,
      };
    }

    const { data: terakhir, error: lastError } = await supabase
      .from("contact_links")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastError) throw new Error(lastError.message);
    const urutan = ((terakhir?.sort_order as number | undefined) ?? 0) + 1;

    const { data: baru, error: insertError } = await supabase
      .from("contact_links")
      .insert({ app_name: v.appName, url: v.url, sort_order: urutan })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);

    return { ok: true, id: baru.id as string };
  } catch (e) {
    console.error("Gagal menambah link contact:", e);
    return { ok: false, error: "Gagal menambah link.", status: 500 };
  }
}

export async function ubahLink(id: string, input: unknown): Promise<HasilAksi> {
  const v = validasiLink(input);
  if (!v.ok) return { ok: false, error: v.error, status: 400 };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_links")
      .update({ app_name: v.appName, url: v.url })
      .eq("id", id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return { ok: false, error: "Link tidak ditemukan.", status: 404 };
    }
    return { ok: true };
  } catch (e) {
    console.error("Gagal mengubah link contact:", e);
    return { ok: false, error: "Gagal menyimpan link.", status: 500 };
  }
}

// Geser satu posisi ke atas ("naik") atau ke bawah ("turun"), lalu urutan dinomori ulang 1..n.
export async function geserLink(
  id: string,
  arah: "naik" | "turun"
): Promise<HasilAksi> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_links")
      .select("id, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const daftar = (data ?? []).map((r) => ({
      id: r.id as string,
      sortOrder: r.sort_order as number,
    }));
    const i = daftar.findIndex((d) => d.id === id);
    if (i === -1) return { ok: false, error: "Link tidak ditemukan.", status: 404 };

    const j = arah === "naik" ? i - 1 : i + 1;
    if (j < 0 || j >= daftar.length) return { ok: true }; // sudah di ujung

    [daftar[i], daftar[j]] = [daftar[j], daftar[i]];

    for (let k = 0; k < daftar.length; k++) {
      const baru = k + 1;
      if (daftar[k].sortOrder === baru) continue;
      const { error: updError } = await supabase
        .from("contact_links")
        .update({ sort_order: baru })
        .eq("id", daftar[k].id);
      if (updError) throw new Error(updError.message);
    }
    return { ok: true };
  } catch (e) {
    console.error("Gagal menggeser link contact:", e);
    return { ok: false, error: "Gagal mengubah urutan.", status: 500 };
  }
}

export async function hapusLink(id: string): Promise<HasilAksi> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: row, error: rowError } = await supabase
      .from("contact_links")
      .select("id, icon_url")
      .eq("id", id)
      .maybeSingle();
    if (rowError) throw new Error(rowError.message);
    if (!row) return { ok: false, error: "Link tidak ditemukan.", status: 404 };

    const { data: dihapus, error: deleteError } = await supabase
      .from("contact_links")
      .delete()
      .eq("id", id)
      .select("id");
    if (deleteError) throw new Error(deleteError.message);
    if (!dihapus || dihapus.length === 0) {
      return { ok: false, error: "Link tidak ditemukan.", status: 404 };
    }

    const berhasil = await hapusFile(pathDariUrl(row.icon_url as string | null));
    return berhasil
      ? { ok: true }
      : {
          ok: true,
          warning:
            "Link terhapus, tapi file logonya gagal dihapus dari storage. Hapus manual lewat dashboard Supabase.",
        };
  } catch (e) {
    console.error("Gagal menghapus link contact:", e);
    return { ok: false, error: "Gagal menghapus link.", status: 500 };
  }
}

export async function uploadLogoLink(id: string, file: File): Promise<HasilAksi> {
  if (file.size === 0 || file.size > LOGO_MAX_BYTE) {
    return { ok: false, error: "Ukuran logo harus di bawah 2 MB.", status: 400 };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const tipe = deteksiTipe(bytes);
  if (!tipe) {
    return { ok: false, error: "Hanya JPG, PNG, atau WebP.", status: 400 };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: row, error: rowError } = await supabase
      .from("contact_links")
      .select("id, icon_url")
      .eq("id", id)
      .maybeSingle();
    if (rowError) throw new Error(rowError.message);
    if (!row) return { ok: false, error: "Link tidak ditemukan.", status: 404 };

    const path = `contact/logo-${id}-${Date.now()}.${tipe.ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(bytes), { contentType: tipe.mime, upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publik } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("contact_links")
      .update({ icon_url: publik.publicUrl })
      .eq("id", id);
    if (updateError) {
      await hapusFile(path);
      throw new Error(updateError.message);
    }

    // Logo lama dihapus setelah yang baru aman tersimpan (best effort).
    const lama = pathDariUrl(row.icon_url as string | null);
    if (lama && lama !== path) await hapusFile(lama);

    return { ok: true };
  } catch (e) {
    console.error("Gagal mengunggah logo contact:", e);
    return { ok: false, error: "Gagal mengunggah logo.", status: 500 };
  }
}

export async function hapusLogoLink(id: string): Promise<HasilAksi> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: row, error: rowError } = await supabase
      .from("contact_links")
      .select("id, icon_url")
      .eq("id", id)
      .maybeSingle();
    if (rowError) throw new Error(rowError.message);
    if (!row) return { ok: false, error: "Link tidak ditemukan.", status: 404 };

    const { error: updateError } = await supabase
      .from("contact_links")
      .update({ icon_url: null })
      .eq("id", id);
    if (updateError) throw new Error(updateError.message);

    const berhasil = await hapusFile(pathDariUrl(row.icon_url as string | null));
    return berhasil
      ? { ok: true }
      : {
          ok: true,
          warning:
            "Logo dilepas, tapi file-nya gagal dihapus dari storage. Hapus manual lewat dashboard Supabase.",
        };
  } catch (e) {
    console.error("Gagal menghapus logo contact:", e);
    return { ok: false, error: "Gagal menghapus logo.", status: 500 };
  }
}