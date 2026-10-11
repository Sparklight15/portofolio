import { getSupabaseAdmin } from "./supabase-server";
import type { ProjectFormValues } from "../components/admin/ProjectForm";

export async function getProjectForEdit(
  id: string
): Promise<{ data: ProjectFormValues | null; error: string | null }> {
  try {
    const supabase = getSupabaseAdmin();

    const [proyek, gambar, link, relasi] = await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, title, category, project_year, project_month, summary, problem, insight"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("project_images")
        .select("id, image_url, caption, sort_order, is_thumbnail")
        .eq("project_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("project_links")
        .select("id, label, url, sort_order")
        .eq("project_id", id)
        .order("sort_order", { ascending: true }),
      supabase.from("project_tools").select("tool_id").eq("project_id", id),
    ]);

    const galat = proyek.error ?? gambar.error ?? link.error ?? relasi.error;
    if (galat) return { data: null, error: galat.message };
    if (!proyek.data) return { data: null, error: null };

    let namaTools: string[] = [];
    const toolIds = (relasi.data ?? []).map((r) => r.tool_id as string);
    if (toolIds.length > 0) {
      const { data, error } = await supabase
        .from("tools")
        .select("name")
        .in("id", toolIds)
        .order("name", { ascending: true });
      if (error) return { data: null, error: error.message };
      namaTools = (data ?? []).map((t) => t.name as string);
    }

    const p = proyek.data;
    const nilai: ProjectFormValues = {
      title: p.title as string,
      month: p.project_month ? String(p.project_month) : "",
      year: p.project_year ? String(p.project_year) : "",
      category: p.category as string,
      newCategory: "",
      summary: (p.summary as string) ?? "",
      problem: (p.problem as string) ?? "",
      insight: (p.insight as string) ?? "",
      tools: namaTools,
      links: (link.data ?? []).map((l) => ({
        id: `db-${l.id}`,
        label: (l.label as string) ?? "",
        url: (l.url as string) ?? "",
      })),
      images: (gambar.data ?? []).map((g) => {
        const url = g.image_url as string;
        return {
          id: `db-${g.id}`,
          dbId: g.id as string,
          existing: true,
          name: url.split("/").pop() ?? "gambar",
          caption: (g.caption as string) ?? "",
          status: "ready" as const,
          originalSize: 0,
          previewUrl: url,
          thumbnail: g.is_thumbnail === true,
        };
      }),
    };

    return { data: nilai, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Terjadi kesalahan.",
    };
  }
}