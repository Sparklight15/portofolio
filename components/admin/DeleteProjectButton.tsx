"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { useAdminToast } from "./AdminToast";
import { ConfirmModal } from "./ConfirmModal";

type DeleteProjectButtonProps = {
  id: string;
  title: string;
};

export function DeleteProjectButton({ id, title }: DeleteProjectButtonProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onConfirm() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });

      if (res.status === 401) {
        showToast("Sesi habis. Silakan masuk lagi.");
        router.replace("/admin/login");
        router.refresh();
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        error?: string;
        warning?: string;
      } | null;

      if (!res.ok) {
        showToast(body?.error ?? "Gagal menghapus project. Coba lagi.");
        setLoading(false);
        return;
      }

      setOpen(false);
      showToast(body?.warning ?? "Project berhasil dihapus.");
      router.refresh();
    } catch {
      showToast("Tidak bisa terhubung ke server. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="gray" size="sm" onClick={() => setOpen(true)}>
        Hapus
      </Button>
      <ConfirmModal
        open={open}
        title="Hapus project ini?"
        message={`"${title}" akan dihapus permanen, termasuk gambar dan link-nya. Tindakan ini tidak bisa dibatalkan.`}
        loading={loading}
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}