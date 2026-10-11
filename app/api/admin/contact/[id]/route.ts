import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "../../../../../lib/session";
import {
  geserLink,
  hapusLink,
  idLinkValid,
  ubahLink,
} from "../../../../../lib/contact-links";

type Ctx = { params: Promise<{ id: string }> };

async function cekAkses(request: NextRequest, ctx: Ctx) {
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  if (!session) {
    return {
      error: NextResponse.json({ error: "Belum masuk." }, { status: 401 }),
    } as const;
  }
  const { id } = await ctx.params;
  if (!idLinkValid(id)) {
    return {
      error: NextResponse.json({ error: "ID tidak valid." }, { status: 400 }),
    } as const;
  }
  return { id } as const;
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const akses = await cekAkses(request, ctx);
  if ("error" in akses) return akses.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const hasil = await ubahLink(akses.id, body);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.error }, { status: hasil.status });
  }
  return NextResponse.json({ ok: true });
}

// Body: { "arah": "naik" | "turun" }
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const akses = await cekAkses(request, ctx);
  if ("error" in akses) return akses.error;

  let body: { arah?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  if (body.arah !== "naik" && body.arah !== "turun") {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const hasil = await geserLink(akses.id, body.arah);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.error }, { status: hasil.status });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const akses = await cekAkses(request, ctx);
  if ("error" in akses) return akses.error;

  const hasil = await hapusLink(akses.id);
  if (!hasil.ok) {
    return NextResponse.json({ error: hasil.error }, { status: hasil.status });
  }
  return NextResponse.json({ ok: true, warning: hasil.warning });
}