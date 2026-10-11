"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAdminToast } from "./AdminToast";
import { ConfirmModal } from "./ConfirmModal";

const LOGO_MAX_BYTE = 2 * 1024 * 1024;
const TIPE_BOLEH = ["image/jpeg", "image/png", "image/webp"];
const NAMA_APP_MAX = 20;
const URL_MAX = 300;

type ContactLinkRowProps = {
  id: string;
  appName: string;
  url: string;
  iconUrl: string | null;
  index: number;
  total: number;
};

type Modal = "logo" | "link" | null;

export function ContactLinkRow({
  id,
  appName,
  url,
  iconUrl,
  index,
  total,
}: ContactLinkRowProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sibuk, setSibuk] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [edit, setEdit] = useState(false);
  const [nama, setNama] = useState(appName);
  const [link, setLink] = useState(url);

  function sesiHabis() {
    showToast("Sesi habis. Silakan masuk lagi.");
    router.replace("/admin/login");
    router.refresh();
  }

  // Mengembalikan true kalau berhasil.
  async function jalankan(
    req: () => Promise<Response>,
    sukses: string,
    gagal: string
  ): Promise<boolean> {
    if (sibuk) return false;
    setSibuk(true);
    try {
      const res = await req();

      if (res.status === 401) {
        sesiHabis();
        return false;
      }

      const body = (await res.json().catch(() => null)) as {
        error?: string;
        warning?: string;
      } | null;

      if (!res.ok) {
        showToast(body?.error ?? gagal);
        return false;
      }

      setModal(null);
      showToast(body?.warning ?? sukses);
      router.refresh();
      return true;
    } catch {
      showToast("Tidak bisa terhubung ke server. Coba lagi.");
      return false;
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
      () => fetch(`/api/admin/contact/${id}/logo`, { method: "POST", body: fd }),
      `Logo ${appName} berhasil disimpan.`,
      "Gagal mengunggah logo. Coba lagi."
    );
  }

  function hapusLogoKonfirmasi() {
    void jalankan(
      () => fetch(`/api/admin/contact/${id}/logo`, { method: "DELETE" }),
      `Logo ${appName} dihapus.`,
      "Gagal menghapus logo. Coba lagi."
    );
  }

  function hapusLinkKonfirmasi() {
    void jalankan(
      () => fetch(`/api/admin/contact/${id}`, { method: "DELETE" }),
      `Link ${appName} berhasil dihapus.`,
      "Gagal menghapus link. Coba lagi."
    );
  }

  function geser(arah: "naik" | "turun") {
    void jalankan(
      () =>
        fetch(`/api/admin/contact/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arah }),
        }),
      "Urutan diubah.",
      "Gagal mengubah urutan. Coba lagi."
    );
  }

  async function simpan() {
    const namaBersih = nama.trim();
    const linkBersih = link.trim();
    if (namaBersih.length < 1) {
      showToast("Nama app wajib diisi.");
      return;
    }
    if (linkBersih.length < 1) {
      showToast("Link wajib diisi.");
      return;
    }

    const ok = await jalankan(
      () =>
        fetch(`/api/admin/contact/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appName: namaBersih, url: linkBersih }),
        }),
      "Link berhasil disimpan.",
      "Gagal menyimpan link. Coba lagi."
    );
    if (ok) setEdit(false);
  }

  function batal() {
    setNama(appName);
    setLink(url);
    setEdit(false);
  }

  return (
    <>
      <tr className="border-b border-border last:border-b-0">
        <td className="px-4 py-3 align-middle">
          <div className="flex items-center gap-2">
            <span className="w-4 text-body text-foreground">{index + 1}</span>
            <div className="flex flex-col gap-1">
              <Button
                variant="gray"
                size="sm"
                disabled={sibuk || index === 0}
                onClick={() => geser("naik")}
              >
                Naik
              </Button>
              <Button
                variant="gray"
                size="sm"
                disabled={sibuk || index === total - 1}
                onClick={() => geser("turun")}
              >
                Turun
              </Button>
            </div>
          </div>
        </td>

        <td className="px-4 py-3 align-middle">
          <div className="flex h-12 w-12 items-center justify-center border border-border bg-surface">
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl}
                alt={`Logo ${appName}`}
                className="h-full w-full object-contain p-1 [filter:grayscale(1)]"
              />
            ) : (
              <span className="text-caption text-muted">-</span>
            )}
          </div>
        </td>

        {edit ? (
          <>
            <td className="px-4 py-3 align-middle">
              <Input
                value={nama}
                maxLength={NAMA_APP_MAX}
                onChange={(e) => setNama(e.target.value)}
                disabled={sibuk}
                aria-label="Nama app"
              />
            </td>
            <td className="px-4 py-3 align-middle">
              <Input
                value={link}
                maxLength={URL_MAX}
                onChange={(e) => setLink(e.target.value)}
                disabled={sibuk}
                aria-label="Link profil"
              />
            </td>
          </>
        ) : (
          <>
            <td className="px-4 py-3 align-middle text-body text-foreground">
              {appName}
            </td>
            <td className="max-w-[260px] px-4 py-3 align-middle text-body text-foreground">
              <div className="truncate" title={url}>
                {url}
              </div>
            </td>
          </>
        )}

        <td className="px-4 py-3 align-middle">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPilihLogo}
            className="hidden"
          />

          {edit ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="filled"
                size="sm"
                disabled={sibuk}
                onClick={() => void simpan()}
              >
                {sibuk ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={sibuk}
                onClick={batal}
              >
                Batal
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={sibuk}
                onClick={() => setEdit(true)}
              >
                Ubah
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={sibuk}
                onClick={() => inputRef.current?.click()}
              >
                {sibuk ? "Memproses..." : iconUrl ? "Ganti logo" : "Unggah logo"}
              </Button>
              {iconUrl ? (
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
                disabled={sibuk}
                onClick={() => setModal("link")}
              >
                Hapus link
              </Button>
            </div>
          )}
        </td>
      </tr>

      <ConfirmModal
        open={modal === "logo"}
        title="Hapus logo ini?"
        message={`Logo "${appName}" akan dihapus. Di halaman Contact, ikon bawaan dipakai lagi.`}
        confirmLabel="Hapus logo"
        loading={sibuk}
        onConfirm={hapusLogoKonfirmasi}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal === "link"}
        title="Hapus link ini?"
        message={`Link "${appName}" akan dihapus dari halaman Contact, termasuk logonya. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus link"
        loading={sibuk}
        onConfirm={hapusLinkKonfirmasi}
        onCancel={() => setModal(null)}
      />
    </>
  );
}