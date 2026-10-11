import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "../../../../../lib/session";
import { uploadCv, validasiCv } from "../../../../../lib/profile";

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

  const pesan = await validasiCv(file);
  if (pesan) {
    return NextResponse.json({ error: pesan }, { status: 400 });
  }

  try {
    const profil = await uploadCv(file);
    return NextResponse.json({
      ok: true,
      cvUrl: profil.cvUrl,
      cvFilename: profil.cvFilename,
    });
  } catch (e) {
    console.error("Gagal mengunggah CV:", e);
    return NextResponse.json({ error: "Gagal mengunggah CV." }, { status: 500 });
  }
}