import { getSupabaseAdmin } from "./supabase-server";

export type ProjectListItem = {
  id: string;
  title: string;
  category: string;
  project_year: number | null;
  project_month: number | null;
};

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const JENIS_BAWAAN = ["capstone", "kuliah"];

export function formatWaktu(
  month: number | null,
  year: number | null
): string {
  if (!year) return "-";
  if (!month || month < 1 || month > 12) return String(year);
  return `${NAMA_BULAN[month - 1]} ${year}`;
}

export async function getProjects(): Promise<{
  data: ProjectListItem[];
  error: string | null;
}> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, category, project_year, project_month")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as ProjectListItem[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Terjadi kesalahan.",
    };
  }
}

// Jenis bawaan + semua jenis yang sudah dipakai project. Gagal baca = bawaan saja.
export async function getCategories(): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("projects").select("category");
    if (error) return JENIS_BAWAAN;

    const semua = new Set<string>(JENIS_BAWAAN);
    for (const row of data ?? []) {
      if (typeof row.category === "string" && row.category) {
        semua.add(row.category);
      }
    }
    return Array.from(semua).sort();
  } catch {
    return JENIS_BAWAAN;
  }
}

// Nama semua tools yang sudah ada. Gagal baca = daftar kosong (tools bisa tetap diketik manual).
export async function getTools(): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tools")
      .select("name")
      .order("name", { ascending: true });
    if (error) return [];

    return (data ?? [])
      .map((row) => row.name)
      .filter((n): n is string => typeof n === "string" && n.length > 0);
  } catch {
    return [];
  }
}