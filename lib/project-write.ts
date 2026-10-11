import type { SupabaseClient } from "@supabase/supabase-js";

const NAMA_TOOLS_RE = /^[\p{L}\p{N}][\p{L}\p{N} .+#/_()-]*$/u;
const JENIS_RE = /^[a-z0-9]+( [a-z0-9]+)*$/;

export type LinkInput = { label: string; url: string };

export type ProjectInput = {
  title: string;
  month: number;
  year: number;
  category: string;
  summary: string;
  problem: string;
  insight: string;
  tools: string[];
  links: LinkInput[];
};

export function slugify(s: string): string {
  const dasar = s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return dasar || "project";
}

function teks(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// Mengembalikan data bersih, atau pesan error.
export function validasiProject(
  body: unknown
): { data: ProjectInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Data tidak valid." };
  const b = body as Record<string, unknown>;

  const title = teks(b.title);
  if (!title || title.length > 150) {
    return { error: "Judul wajib diisi (maks 150 karakter)." };
  }

  const month = Number(b.month);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { error: "Bulan tidak valid." };
  }

  const year = Number(b.year);
  const maxYear = new Date().getFullYear() + 1;
  if (!Number.isInteger(year) || year < 2000 || year > maxYear) {
    return { error: "Tahun tidak valid." };
  }

  const category = teks(b.category).toLowerCase().replace(/\s+/g, " ");
  if (category.length < 2 || category.length > 40 || !JENIS_RE.test(category)) {
    return { error: "Jenis tidak valid." };
  }

  const summary = teks(b.summary);
  const problem = teks(b.problem);
  const insight = teks(b.insight);
  if (!summary || summary.length > 2000) return { error: "Deskripsi tidak valid." };
  if (!problem || problem.length > 2000) return { error: "Masalah tidak valid." };
  if (!insight || insight.length > 2000) return { error: "Insight tidak valid." };

  const toolsMentah = Array.isArray(b.tools) ? b.tools : [];
  if (toolsMentah.length > 20) return { error: "Maksimal 20 tools." };
  const tools: string[] = [];
  const terlihat = new Set<string>();
  for (const t of toolsMentah) {
    const nama = teks(t).replace(/\s+/g, " ");
    if (!nama) continue;
    if (nama.length > 40 || !NAMA_TOOLS_RE.test(nama)) {
      return { error: `Nama tools tidak valid: ${nama.slice(0, 40)}` };
    }
    if (terlihat.has(nama.toLowerCase())) continue;
    terlihat.add(nama.toLowerCase());
    tools.push(nama);
  }

  const linksMentah = Array.isArray(b.links) ? b.links : [];
  if (linksMentah.length > 10) return { error: "Maksimal 10 link." };
  const links: LinkInput[] = [];
  for (const l of linksMentah) {
    const row = (l ?? {}) as Record<string, unknown>;
    const label = teks(row.label);
    const url = teks(row.url);
    if (!label && !url) continue;
    if (!label || label.length > 60) return { error: "Label link tidak valid." };
    let ok = false;
    try {
      const p = new URL(url);
      ok =
        (p.protocol === "http:" || p.protocol === "https:") &&
        url.length <= 2000;
    } catch {
      ok = false;
    }
    if (!ok) return { error: "URL link harus diawali http:// atau https://" };
    links.push({ label, url });
  }

  return {
    data: { title, month, year, category, summary, problem, insight, tools, links },
  };
}

// Pakai tools yang sudah ada (huruf besar/kecil diabaikan), buat yang baru.
// Melempar Error kalau gagal.
export async function resolveToolIds(
  supabase: SupabaseClient,
  names: string[]
): Promise<string[]> {
  if (names.length === 0) return [];

  const { data: semua, error } = await supabase.from("tools").select("id, name");
  if (error) throw new Error(error.message);

  const peta = new Map<string, string>();
  for (const t of semua ?? []) {
    peta.set((t.name as string).toLowerCase(), t.id as string);
  }

  const ids: string[] = [];
  const namaBaru: string[] = [];
  for (const nama of names) {
    const id = peta.get(nama.toLowerCase());
    if (id) ids.push(id);
    else namaBaru.push(nama);
  }

  if (namaBaru.length > 0) {
    const { data: dibuat, error: buatError } = await supabase
      .from("tools")
      .insert(namaBaru.map((name) => ({ name })))
      .select("id");
    if (buatError) throw new Error(buatError.message);
    for (const t of dibuat ?? []) ids.push(t.id as string);
  }

  return ids;
}