import { getSupabaseAdmin } from "./supabase-server";

export type PublicTool = { name: string; iconUrl: string | null };

// Hanya untuk dipanggil dari server component (memakai kunci secret).
export async function getPublicTools(): Promise<{
  data: PublicTool[];
  error: string | null;
}> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tools")
      .select("name, icon_url")
      .order("name", { ascending: true });

    if (error) return { data: [], error: error.message };

    const items: PublicTool[] = (data ?? []).flatMap((row) => {
      const name = typeof row.name === "string" ? row.name.trim() : "";
      if (!name) return [];
      const icon =
        typeof row.icon_url === "string" && /^https?:\/\//i.test(row.icon_url.trim())
          ? row.icon_url.trim()
          : null;
      return [{ name, iconUrl: icon }];
    });

    return { data: items, error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Terjadi kesalahan.",
    };
  }
}