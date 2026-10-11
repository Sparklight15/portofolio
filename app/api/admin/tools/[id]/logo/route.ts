import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "../../../../../../lib/session";
import {
  hapusLogo,
  idToolValid,
  uploadLogo,
} from "../../../../../../lib/tools-admin";

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
  if (!idToolValid(id)) {
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

  const hasil = await uploadLogo(id, file);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.error }, { status: hasil.status });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  const { id } = await params;
  if (!idToolValid(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const hasil = await hapusLogo(id);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.error }, { status: hasil.status });
  }
  return NextResponse.json({ ok: true, warning: hasil.warning });
}