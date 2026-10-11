import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "../../../../../../lib/session";
import { getSupabaseAdmin } from "../../../../../../lib/supabase-server";

const BUCKET = "project-images";
const MAX_BYTE = 5 * 1024 * 1024;
const MAX_GAMBAR = 5;
const EKSTENSI: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  const ekstensi = EKSTENSI[file.type];
  if (!ekstensi) {
    return NextResponse.json(
      { error: "Hanya JPG, PNG, atau WebP." },
      { status: 400 }
    );
  }
  if (file.size === 0 || file.size > MAX_BYTE) {
    return NextResponse.json(
      { error: "Ukuran gambar harus di bawah 5 MB." },
      { status: 400 }
    );
  }

  const caption = String(form.get("caption") ?? "").trim().slice(0, 200);
  const urutan = Number(form.get("order"));
  if (!Number.isInteger(urutan) || urutan < 1 || urutan > MAX_GAMBAR) {
    return NextResponse.json({ error: "Urutan tidak valid." }, { status: 400 });
  }
  const jadikanThumbnail = form.get("thumbnail") === "1";

  const supabase = getSupabaseAdmin();

  try {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, slug, title")
      .eq("id", id)
      .maybeSingle();

    if (projectError) throw new Error(projectError.message);
    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan." },
        { status: 404 }
      );
    }

    // Batas gambar per project.
    const { count, error: countError } = await supabase
      .from("project_images")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= MAX_GAMBAR) {
      return NextResponse.json(
        { error: `Maksimal ${MAX_GAMBAR} gambar per project.` },
        { status: 400 }
      );
    }

    // Akhiran acak supaya gambar baru tidak menimpa file lama saat edit.
    const sufiks = Math.random().toString(36).slice(2, 8);
    const path = `projects/${project.slug}/gambar-${urutan}-${sufiks}.${ekstensi}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publik } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { data: baru, error: insertError } = await supabase
      .from("project_images")
      .insert({
        project_id: project.id,
        image_url: publik.publicUrl,
        alt_text: caption || project.title,
        caption,
        sort_order: urutan,
        is_thumbnail: jadikanThumbnail,
      })
      .select("id")
      .single();

    if (insertError || !baru) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw new Error(insertError?.message ?? "Gagal menyimpan data gambar.");
    }

    // Hanya satu thumbnail per project: lepas tanda di gambar lain.
    if (jadikanThumbnail) {
      const { error: lepasError } = await supabase
        .from("project_images")
        .update({ is_thumbnail: false })
        .eq("project_id", project.id)
        .neq("id", baru.id);
      if (lepasError) {
        console.error("Gagal melepas thumbnail lama:", lepasError.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Gagal mengunggah gambar:", e);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar." },
      { status: 500 }
    );
  }
}