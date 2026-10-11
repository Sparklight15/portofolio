"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Toast } from "../../../components/ui/Toast";

function pesanError(status: number) {
  if (status === 401) return "Username atau password salah.";
  if (status === 429) return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  return "Terjadi kesalahan. Coba lagi.";
}

export function LoginForm() {
  const router = useRouter();
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const showError = (message: string) => setToast({ id: Date.now(), message });
  const closeToast = useCallback(() => setToast(null), []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const data = new FormData(e.currentTarget);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!username || !password) {
      showError("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      showError(pesanError(res.status));
    } catch {
      showError("Tidak bisa terhubung ke server. Coba lagi.");
    }

    setLoading(false);
  }

  return (
    <>
      {toast ? (
        <Toast key={toast.id} message={toast.message} onClose={closeToast} />
      ) : null}

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="block text-label uppercase text-muted">
            Username
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            disabled={loading}
            aria-invalid={toast ? true : undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="block text-label uppercase text-muted">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={loading}
            aria-invalid={toast ? true : undefined}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Memeriksa..." : "Masuk"}
        </Button>
      </form>
    </>
  );
}