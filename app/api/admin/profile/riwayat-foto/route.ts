import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "../../../../../lib/session";
import {
  hapusFotoRiwayatLepas,
  uploadFotoRiwayat,
  validasiFoto,
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

  const pesan = await validasiFoto(file);
  if (pesan) {
    return NextResponse.json({ error: pesan }, { status: 400 });
  }

  try {
    const url = await uploadFotoRiwayat(file);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("Gagal mengunggah foto riwayat:", e);
    return NextResponse.json(
      { error: "Gagal mengunggah foto." },
      { status: 500 }
    );
  }
}

// Body: { "url": "<url foto yang belum tersimpan>" }
export async function DELETE(request: NextRequest) {
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  if (typeof body.url !== "string") {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  try {
    const hasil = await hapusFotoRiwayatLepas(body.url);
    if (!hasil.ok) {
      return NextResponse.json({ error: hasil.error }, { status: hasil.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Gagal menghapus foto riwayat:", e);
    return NextResponse.json(
      { error: "Gagal menghapus foto." },
      { status: 500 }
    );
  }
}