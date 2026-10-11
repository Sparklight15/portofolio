import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  checkLoginLimit,
  getClientIp,
  recordLoginFailure,
  resetLoginFailures,
} from "../../../../lib/rate-limit";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
} from "../../../../lib/session";

// Hash palsu supaya waktu proses tetap sama saat username salah.
let dummyHash: string | null = null;

function sameText(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function reply(
  body: Record<string, unknown>,
  status: number,
  extraHeaders: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

export async function POST(request: Request) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUsername || !adminHash || !process.env.SESSION_SECRET) {
    console.error("[login] ADMIN_USERNAME / ADMIN_PASSWORD_HASH / SESSION_SECRET belum lengkap.");
    return reply({ error: "server_misconfigured" }, 500);
  }

  // Cek batas percobaan SEBELUM bcrypt supaya permintaan terblokir murah.
  const ip = getClientIp(request);
  const limit = checkLoginLimit(ip);
  if (limit.blocked) {
    return reply({ error: "too_many_attempts" }, 429, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply({ error: "bad_request" }, 400);
  }

  const { username, password } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password ||
    username.length > 100 ||
    password.length > 200
  ) {
    return reply({ error: "bad_request" }, 400);
  }

  const usernameOk = sameText(username, adminUsername);
  const hashToCheck = usernameOk
    ? adminHash
    : (dummyHash ??= bcrypt.hashSync("password-palsu-untuk-timing", 12));
  const passwordOk = await bcrypt.compare(password, hashToCheck);

  if (!usernameOk || !passwordOk) {
    // === DIAGNOSTIK SEMENTARA: HAPUS SETELAH MASALAH KETEMU ===
    console.warn("[login-debug]", {
      usernameOk,
      passwordOk, // tidak bermakna kalau usernameOk = false
      inputUsernameLen: username.length,
      envUsernameLen: adminUsername.length,
      envHashLen: adminHash.length,
      envHashPrefix: adminHash.slice(0, 7),
    });
    // === AKHIR DIAGNOSTIK ===
    recordLoginFailure(ip);
    return reply({ error: "invalid_credentials" }, 401);
  }

  resetLoginFailures(ip);

  const token = await createSessionToken(adminUsername);
  const res = reply({ ok: true }, 200);
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return res;
}