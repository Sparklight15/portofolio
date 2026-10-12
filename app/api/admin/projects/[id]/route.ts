import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validasiProject, resolveToolIds } from "../../../../../lib/project-write";
import { SESSION_COOKIE, verifySessionToken } from "../../../../../lib/session";
import { getSupabaseAdmin } from "../../../../../lib/supabase-server";

const BUCKET = "project-images";
const URL_MARKER = `/object/public/${BUCKET}/`;
const MAX_GAMBAR = 6;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type GambarInput = {
  id: string;
  caption: string;
  order: number;
  thumbnail: boolean;
};

function pathDariUrl(url: string): string | null {
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

function parseGambar(v: unknown): GambarInput[] | null {
  if (!Array.isArray(v) || v.length > MAX_GAMBAR) return null;
  const hasil: GambarInput[] = [];
  const ids = new Set<string>();
  let jumlahThumbnail = 0;
  for (const item of v) {
    const row = (item ?? {}) as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id : "";
    const order = Number(row.order);
    if (!UUID_RE.test(id) || ids.has(id)) return null;
    if (!Number.isInteger(order) || order < 1 || order > MAX_GAMBAR) return null;
    const thumbnail = row.thumbnail === true;
    if (thumbnail) jumlahThumbnail += 1;
    ids.add(id);
    hasil.push({
      id,
      order,
      thumbnail,
      caption:
        typeof row.caption === "string" ? row.caption.trim().slice(0, 200) : "",
    });
  }
  // Hanya satu thumbnail per project.
  if (jumlahThumbnail > 1) return null;
  return hasil;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifikasi sesi sendiri, tidak hanya mengandalkan proxy.ts.
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
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

  const gambar = parseGambar((body as Record<string, unknown>).images);
  if (!gambar) {
    return NextResponse.json({ error: "Data gambar tidak valid." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    // Cek kepemilikan gambar dulu, sebelum ada yang diubah.
    const { data: gambarLama, error: gambarError } = await supabase
      .from("project_images")
      .select("id, image_url")
      .eq("project_id", id);
    if (gambarError) throw new Error(gambarError.message);

    const milik = new Map<string, string>();
    for (const g of gambarLama ?? []) milik.set(g.id as string, g.image_url as string);
    for (const g of gambar) {
      if (!milik.has(g.id)) {
        return NextResponse.json({ error: "Gambar tidak dikenali." }, { status: 400 });
      }
    }

    // 1. Data utama (slug sengaja tidak diubah).
    const { data: diubah, error: updateError } = await supabase
      .from("projects")
      .update({
        title: d.title,
        category: d.category,
        project_year: d.year,
        project_month: d.month,
        summary: d.summary,
        problem: d.problem,
        insight: d.insight,
        product_name: d.productName || null,
        product_description: d.productDescription || null,
        product_url: d.productUrl || null,
      })
      .eq("id", id)
      .select("id");
    if (updateError) throw new Error(updateError.message);
    if (!diubah || diubah.length === 0) {
      return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
    }

    // 2. Tools: tambah yang baru, lepas yang dibuang.
    const toolIds = await resolveToolIds(supabase, d.tools);
    const { data: relLama, error: relLamaError } = await supabase
      .from("project_tools")
      .select("tool_id")
      .eq("project_id", id);
    if (relLamaError) throw new Error(relLamaError.message);

    const lama = new Set((relLama ?? []).map((r) => r.tool_id as string));
    const baru = new Set(toolIds);
    const tambah = Array.from(baru).filter((x) => !lama.has(x));
    const buang = Array.from(lama).filter((x) => !baru.has(x));

    if (tambah.length > 0) {
      const { error } = await supabase
        .from("project_tools")
        .insert(tambah.map((tool_id) => ({ project_id: id, tool_id })));
      if (error) throw new Error(error.message);
    }
    if (buang.length > 0) {
      const { error } = await supabase
        .from("project_tools")
        .delete()
        .eq("project_id", id)
        .in("tool_id", buang);
      if (error) throw new Error(error.message);
    }

    // 3. Link: sisipkan yang baru dulu, baru hapus yang lama.
    const { data: linkLama, error: linkLamaError } = await supabase
      .from("project_links")
      .select("id")
      .eq("project_id", id);
    if (linkLamaError) throw new Error(linkLamaError.message);

    if (d.links.length > 0) {
      const { error } = await supabase.from("project_links").insert(
        d.links.map((l, i) => ({
          project_id: id,
          label: l.label,
          url: l.url,
          sort_order: i + 1,
        }))
      );
      if (error) throw new Error(error.message);
    }
    const idLinkLama = (linkLama ?? []).map((l) => l.id as string);
    if (idLinkLama.length > 0) {
      const { error } = await supabase
        .from("project_links")
        .delete()
        .in("id", idLinkLama);
      if (error) throw new Error(error.message);
    }

    // 3b. Video YouTube: sisipkan yang baru dulu, baru hapus yang lama.
    const { data: videoLama, error: videoLamaError } = await supabase
      .from("project_videos")
      .select("id")
      .eq("project_id", id);
    if (videoLamaError) throw new Error(videoLamaError.message);

    if (d.videoIds.length > 0) {
      const { error } = await supabase.from("project_videos").insert(
        d.videoIds.map((youtube_id, i) => ({
          project_id: id,
          youtube_id,
          sort_order: i + 1,
        }))
      );
      if (error) throw new Error(error.message);
    }
    const idVideoLama = (videoLama ?? []).map((v) => v.id as string);
    if (idVideoLama.length > 0) {
      const { error } = await supabase
        .from("project_videos")
        .delete()
        .in("id", idVideoLama);
      if (error) throw new Error(error.message);
    }

    // 4. Gambar lama: hapus yang dibuang, perbarui caption, urutan, dan thumbnail
    //    yang dipertahankan.
    const dipertahankan = new Set(gambar.map((g) => g.id));
    const idBuang = Array.from(milik.keys()).filter((x) => !dipertahankan.has(x));

    let warning: string | undefined;
    if (idBuang.length > 0) {
      const paths = idBuang
        .map((x) => pathDariUrl(milik.get(x) as string))
        .filter((p): p is string => p !== null);

      const { error } = await supabase
        .from("project_images")
        .delete()
        .eq("project_id", id)
        .in("id", idBuang);
      if (error) throw new Error(error.message);

      if (paths.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(BUCKET)
          .remove(paths);
        if (removeError) {
          console.error("Gagal menghapus file gambar:", removeError.message);
          warning =
            "Perubahan tersimpan, tapi file gambar yang dibuang gagal dihapus dari storage. Hapus manual lewat dashboard Supabase.";
        }
      }
    }

    for (const g of gambar) {
      const { error } = await supabase
        .from("project_images")
        .update({
          caption: g.caption,
          alt_text: g.caption || d.title,
          sort_order: g.order,
          is_thumbnail: g.thumbnail,
        })
        .eq("id", g.id)
        .eq("project_id", id);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, warning });
  } catch (e) {
    console.error("Gagal memperbarui project:", e);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan. Sebagian perubahan mungkin sudah tersimpan, cek lagi lewat Edit." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifikasi sesi sendiri, tidak hanya mengandalkan proxy.ts.
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1. Catat dulu path file gambar milik project ini.
    const { data: images, error: imagesError } = await supabase
      .from("project_images")
      .select("image_url")
      .eq("project_id", id);

    if (imagesError) {
      console.error("Gagal membaca gambar project:", imagesError.message);
      return NextResponse.json(
        { error: "Gagal menghapus project." },
        { status: 500 }
      );
    }

    const paths = (images ?? [])
      .map((img) => pathDariUrl(img.image_url))
      .filter((p): p is string => p !== null);

    // 2. Hapus baris project. Link, gambar, dan relasi tools ikut terhapus (cascade).
    const { data: deleted, error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .select("id");

    if (deleteError) {
      console.error("Gagal menghapus project:", deleteError.message);
      return NextResponse.json(
        { error: "Gagal menghapus project." },
        { status: 500 }
      );
    }

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: "Project tidak ditemukan." },
        { status: 404 }
      );
    }

    // 3. Hapus file di bucket. Kalau gagal, project tetap terhapus
    //    dan file yatim bisa dibersihkan manual lewat dashboard.
    let warning: string | undefined;
    if (paths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove(paths);

      if (removeError) {
        console.error("Gagal menghapus file gambar:", removeError.message);
        warning =
          "Project terhapus, tapi file gambarnya gagal dihapus dari storage. Hapus manual lewat dashboard Supabase.";
      }
    }

    return NextResponse.json({ ok: true, warning });
  } catch (e) {
    console.error("Kesalahan saat menghapus project:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server." },
      { status: 500 }
    );
  }
}