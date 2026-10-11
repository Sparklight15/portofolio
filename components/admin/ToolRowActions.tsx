"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { useAdminToast } from "./AdminToast";
import { ConfirmModal } from "./ConfirmModal";

const LOGO_MAX_BYTE = 2 * 1024 * 1024;
const TIPE_BOLEH = ["image/jpeg", "image/png", "image/webp"];

type ToolRowActionsProps = {
  id: string;
  name: string;
  hasLogo: boolean;
  projectCount: number;
};

type Modal = "logo" | "tool" | null;

export function ToolRowActions({
  id,
  name,
  hasLogo,
  projectCount,
}: ToolRowActionsProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sibuk, setSibuk] = useState(false);
  const [modal, setModal] = useState<Modal>(null);

  function sesiHabis() {
    showToast("Sesi habis. Silakan masuk lagi.");
    router.replace("/admin/login");
    router.refresh();
  }

  async function jalankan(
    req: () => Promise<Response>,
    sukses: string,
    gagal: string
  ) {
    if (sibuk) return;
    setSibuk(true);
    try {
      const res = await req();

      if (res.status === 401) {
        sesiHabis();
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        error?: string;
        warning?: string;
      } | null;

      if (!res.ok) {
        showToast(body?.error ?? gagal);
        return;
      }

      setModal(null);
      showToast(body?.warning ?? sukses);
      router.refresh();
    } catch {
      showToast("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  function onPilihLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!TIPE_BOLEH.includes(file.type)) {
      showToast("Logo harus berupa JPG, PNG, atau WebP.");
      return;
    }
    if (file.size === 0 || file.size > LOGO_MAX_BYTE) {
      showToast("Ukuran logo harus di bawah 2 MB.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file, file.name);

    void jalankan(
      () =>
        fetch(`/api/admin/tools/${id}/logo`, { method: "POST", body: fd }),
      `Logo ${name} berhasil disimpan.`,
      "Gagal mengunggah logo. Coba lagi."
    );
  }

  function hapusLogoKonfirmasi() {
    void jalankan(
      () => fetch(`/api/admin/tools/${id}/logo`, { method: "DELETE" }),
      `Logo ${name} dihapus.`,
      "Gagal menghapus logo. Coba lagi."
    );
  }

  function hapusToolKonfirmasi() {
    void jalankan(
      () => fetch(`/api/admin/tools/${id}`, { method: "DELETE" }),
      `Tools ${name} berhasil dihapus.`,
      "Gagal menghapus tools. Coba lagi."
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPilihLogo}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={sibuk}
          onClick={() => inputRef.current?.click()}
        >
          {sibuk ? "Memproses..." : hasLogo ? "Ganti logo" : "Unggah logo"}
        </Button>

        {hasLogo ? (
          <Button
            variant="gray"
            size="sm"
            disabled={sibuk}
            onClick={() => setModal("logo")}
          >
            Hapus logo
          </Button>
        ) : null}

        <Button
          variant="gray"
          size="sm"
          disabled={sibuk || projectCount > 0}
          onClick={() => setModal("tool")}
        >
          Hapus tools
        </Button>
      </div>

      <ConfirmModal
        open={modal === "logo"}
        title="Hapus logo ini?"
        message={`Logo "${name}" akan dihapus. Di halaman Tools, ikon bawaan dipakai lagi.`}
        confirmLabel="Hapus logo"
        loading={sibuk}
        onConfirm={hapusLogoKonfirmasi}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal === "tool"}
        title="Hapus tools ini?"
        message={`"${name}" akan dihapus dari daftar tools, termasuk logonya. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus tools"
        loading={sibuk}
        onConfirm={hapusToolKonfirmasi}
        onCancel={() => setModal(null)}
      />
    </>
  );
}