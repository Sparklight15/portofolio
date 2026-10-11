import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "../../../../../lib/session";
import { bersihkanTeksHome, simpanTeksHome } from "../../../../../lib/profile";

export async function PUT(request: NextRequest) {
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

  const hasil = bersihkanTeksHome(body);
  if ("error" in hasil) {
    return NextResponse.json({ error: hasil.error }, { status: 400 });
  }

  try {
    await simpanTeksHome(hasil.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Gagal menyimpan teks Home:", e);
    return NextResponse.json({ error: "Gagal menyimpan teks Home." }, { status: 500 });
  }
}