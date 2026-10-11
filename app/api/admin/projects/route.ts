import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  resolveToolIds,
  slugify,
  validasiProject,
} from "../../../../lib/project-write";
import { SESSION_COOKIE, verifySessionToken } from "../../../../lib/session";
import { getSupabaseAdmin } from "../../../../lib/supabase-server";

export async function POST(request: NextRequest) {
  // Verifikasi sesi sendiri, tidak hanya mengandalkan proxy.ts.
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const hasil = validasiProject(body);
  if ("error" in hasil) {
    return NextResponse.json({ error: hasil.error }, { status: 400 });
  }
  const d = hasil.data;

  let projectId: string | null = null;
  const supabase = getSupabaseAdmin();

  try {
    // Urutan: paling akhir.
    const { data: terakhir, error: urutError } = await supabase
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    if (urutError) throw new Error(urutError.message);
    const sortOrder = (terakhir?.[0]?.sort_order ?? 0) + 1;

    // Slug unik dari judul.
    const base = slugify(d.title);
    const { data: adaSlug, error: slugError } = await supabase
      .from("projects")
      .select("slug")
      .like("slug", `${base}%`);
    if (slugError) throw new Error(slugError.message);
    const dipakai = new Set((adaSlug ?? []).map((r) => r.slug as string));

    let slug = base;
    for (let n = 2; dipakai.has(slug); n += 1) slug = `${base}-${n}`;

    // Simpan project. Kalau slug bentrok (jarang), coba lagi dengan akhiran acak.
    let slugFinal = slug;
    for (let percobaan = 0; percobaan < 3; percobaan += 1) {
      const { data: baru, error: insertError } = await supabase
        .from("projects")
        .insert({
          slug: slugFinal,
          title: d.title,
          category: d.category,
          project_year: d.year,
          project_month: d.month,
          summary: d.summary,
          problem: d.problem,
          insight: d.insight,
          sort_order: sortOrder,
          published: true,
        })
        .select("id, slug")
        .single();

      if (!insertError && baru) {
        projectId = baru.id as string;
        slugFinal = baru.slug as string;
        break;
      }
      if (insertError?.code === "23505") {
        slugFinal = `${base}-${Math.random().toString(36).slice(2, 6)}`;
        continue;
      }
      throw new Error(insertError?.message ?? "Gagal menyimpan project.");
    }
    if (!projectId) throw new Error("Gagal membuat slug unik.");

    // Tools.
    if (d.tools.length > 0) {
      const toolIds = await resolveToolIds(supabase, d.tools);
      const { error: relError } = await supabase
        .from("project_tools")
        .insert(toolIds.map((tool_id) => ({ project_id: projectId, tool_id })));
      if (relError) throw new Error(relError.message);
    }

    // Link.
    if (d.links.length > 0) {
      const { error: linkError } = await supabase.from("project_links").insert(
        d.links.map((l, i) => ({
          project_id: projectId,
          label: l.label,
          url: l.url,
          sort_order: i + 1,
        }))
      );
      if (linkError) throw new Error(linkError.message);
    }

    return NextResponse.json({ id: projectId, slug: slugFinal });
  } catch (e) {
    console.error("Gagal menyimpan project:", e);
    // Batalkan: anak-anaknya ikut terhapus lewat cascade.
    if (projectId) {
      await supabase.from("projects").delete().eq("id", projectId);
    }
    return NextResponse.json(
      { error: "Gagal menyimpan project. Coba lagi." },
      { status: 500 }
    );
  }
}