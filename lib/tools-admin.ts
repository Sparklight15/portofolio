import { getSupabaseAdmin } from "./supabase-server";

const BUCKET = "project-images";
const URL_MARKER = `/object/public/${BUCKET}/`;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const LOGO_MAX_BYTE = 2 * 1024 * 1024;

export type AdminTool = {
  id: string;
  name: string;
  iconUrl: string | null;
  projectCount: number;
};

export type HasilAksi =
  | { ok: true; warning?: string }
  | { ok: false; error: string; status: number };

export function idToolValid(id: string): boolean {
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

// Hapus file di bucket. Gagal hanya dicatat; mengembalikan true kalau berhasil.
async function hapusFile(path: string | null): Promise<boolean> {
  if (!path) return true;
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error("Gagal menghapus file logo:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Gagal menghapus file logo:", e);
    return false;
  }
}

// Semua tools terdaftar beserta jumlah project yang memakainya.
export async function getToolsAdmin(): Promise<{
  data: AdminTool[];
  error: string | null;
}> {
  try {
    const supabase = getSupabaseAdmin();
    const [toolsRes, relRes] = await Promise.all([
      supabase
        .from("tools")
        .select("id, name, icon_url")
        .order("name", { ascending: true }),
      supabase.from("project_tools").select("tool_id"),
    ]);

    if (toolsRes.error) return { data: [], error: toolsRes.error.message };
    if (relRes.error) return { data: [], error: relRes.error.message };

    const hitung = new Map<string, number>();
    for (const r of relRes.data ?? []) {
      const key = r.tool_id as string;
      hitung.set(key, (hitung.get(key) ?? 0) + 1);
    }

    const data: AdminTool[] = (toolsRes.data ?? []).map((t) => {
      const icon =
        typeof t.icon_url === "string" && /^https?:\/\//i.test(t.icon_url.trim())
          ? t.icon_url.trim()
          : null;
      return {
        id: t.id as string,
        name: t.name as string,
        iconUrl: icon,
        projectCount: hitung.get(t.id as string) ?? 0,
      };
    });

    return { data, error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Terjadi kesalahan.",
    };
  }
}

export async function uploadLogo(id: string, file: File): Promise<HasilAksi> {
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

    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id, icon_url")
      .eq("id", id)
      .maybeSingle();
    if (toolError) throw new Error(toolError.message);
    if (!tool) return { ok: false, error: "Tools tidak ditemukan.", status: 404 };

    const path = `tools/logo-${id}-${Date.now()}.${tipe.ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(bytes), { contentType: tipe.mime, upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publik } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("tools")
      .update({ icon_url: publik.publicUrl })
      .eq("id", id);
    if (updateError) {
      await hapusFile(path);
      throw new Error(updateError.message);
    }

    // Logo lama dihapus setelah yang baru aman tersimpan (best effort).
    const lama = pathDariUrl(tool.icon_url as string | null);
    if (lama && lama !== path) await hapusFile(lama);

    return { ok: true };
  } catch (e) {
    console.error("Gagal mengunggah logo tools:", e);
    return { ok: false, error: "Gagal mengunggah logo.", status: 500 };
  }
}

export async function hapusLogo(id: string): Promise<HasilAksi> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id, icon_url")
      .eq("id", id)
      .maybeSingle();
    if (toolError) throw new Error(toolError.message);
    if (!tool) return { ok: false, error: "Tools tidak ditemukan.", status: 404 };

    const { error: updateError } = await supabase
      .from("tools")
      .update({ icon_url: null })
      .eq("id", id);
    if (updateError) throw new Error(updateError.message);

    const berhasil = await hapusFile(pathDariUrl(tool.icon_url as string | null));
    return berhasil
      ? { ok: true }
      : {
          ok: true,
          warning:
            "Logo dilepas, tapi file-nya gagal dihapus dari storage. Hapus manual lewat dashboard Supabase.",
        };
  } catch (e) {
    console.error("Gagal menghapus logo tools:", e);
    return { ok: false, error: "Gagal menghapus logo.", status: 500 };
  }
}

// Tools yang masih dipakai project tidak boleh dihapus.
export async function hapusTool(id: string): Promise<HasilAksi> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id, icon_url")
      .eq("id", id)
      .maybeSingle();
    if (toolError) throw new Error(toolError.message);
    if (!tool) return { ok: false, error: "Tools tidak ditemukan.", status: 404 };

    const { count, error: countError } = await supabase
      .from("project_tools")
      .select("tool_id", { count: "exact", head: true })
      .eq("tool_id", id);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) {
      return {
        ok: false,
        error: `Tools ini masih dipakai ${count} project. Lepas dulu dari project tersebut.`,
        status: 409,
      };
    }

    const { data: dihapus, error: deleteError } = await supabase
      .from("tools")
      .delete()
      .eq("id", id)
      .select("id");
    if (deleteError) throw new Error(deleteError.message);
    if (!dihapus || dihapus.length === 0) {
      return { ok: false, error: "Tools tidak ditemukan.", status: 404 };
    }

    const berhasil = await hapusFile(pathDariUrl(tool.icon_url as string | null));
    return berhasil
      ? { ok: true }
      : {
          ok: true,
          warning:
            "Tools terhapus, tapi file logonya gagal dihapus dari storage. Hapus manual lewat dashboard Supabase.",
        };
  } catch (e) {
    console.error("Gagal menghapus tools:", e);
    return { ok: false, error: "Gagal menghapus tools.", status: 500 };
  }
}