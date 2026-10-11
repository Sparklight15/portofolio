import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "../../../../../lib/session";
import {
  uploadGambarHome,
  validasiGambarHome,
} from "../../../../../lib/profile";

export async function POST(request: NextRequest) {
  // Verifikasi sesi sendiri, tidak hanya mengandalkan proxy.ts.
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
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

  const pesan = await validasiGambarHome(file);
  if (pesan) {
    return NextResponse.json({ error: pesan }, { status: 400 });
  }

  try {
    const profil = await uploadGambarHome(file);
    return NextResponse.json({ ok: true, imageUrl: profil.homeImageUrl });
  } catch (e) {
    console.error("Gagal mengunggah gambar karakter:", e);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar karakter." },
      { status: 500 }
    );
  }
}