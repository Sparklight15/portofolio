import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 jam

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET belum diisi atau kurang dari 32 karakter.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(username: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}