type Entry = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000; // lama kunci setelah gagal ke-5
const MAX_FAILURES = 5;
const MAX_ENTRIES = 5000;

// Disimpan di globalThis supaya tidak hilang saat hot reload di dev.
const store = globalThis as unknown as { __loginAttempts?: Map<string, Entry> };
const attempts = (store.__loginAttempts ??= new Map<string, Entry>());

function prune(now: number) {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkLoginLimit(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_FAILURES) {
    return { blocked: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { blocked: false, retryAfter: 0 };
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();

  if (attempts.size >= MAX_ENTRIES) {
    prune(now);
    if (attempts.size >= MAX_ENTRIES) {
      const oldest = attempts.keys().next().value;
      if (oldest !== undefined) attempts.delete(oldest);
    }
  }

  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  entry.count += 1;
  if (entry.count >= MAX_FAILURES) entry.resetAt = now + WINDOW_MS;
}

export function resetLoginFailures(ip: string) {
  attempts.delete(ip);
}