"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { Toast } from "../../components/ui/Toast";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  async function onLogout() {
    if (loading) return;
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });

      if (res.ok) {
        router.replace("/admin/login");
        router.refresh();
        return;
      }

      setToast({ id: Date.now(), message: "Gagal keluar. Coba lagi." });
    } catch {
      setToast({
        id: Date.now(),
        message: "Tidak bisa terhubung ke server. Coba lagi.",
      });
    }

    setLoading(false);
  }

  return (
    <>
      {toast ? (
        <Toast key={toast.id} message={toast.message} onClose={closeToast} />
      ) : null}
      <Button variant="outline" size="sm" onClick={onLogout} disabled={loading}>
        {loading ? "Keluar..." : "Keluar"}
      </Button>
    </>
  );
}