"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAdminToast } from "./AdminToast";

const NAMA_APP_MAX = 20;
const URL_MAX = 300;
const CONTACT_MAX = 6;

type ContactLinkFormProps = {
  jumlah: number;
};

export function ContactLinkForm({ jumlah }: ContactLinkFormProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [nama, setNama] = useState("");
  const [url, setUrl] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const penuh = jumlah >= CONTACT_MAX;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sibuk || penuh) return;

    const namaBersih = nama.trim();
    const urlBersih = url.trim();
    if (namaBersih.length < 1) {
      showToast("Nama app wajib diisi.");
      return;
    }
    if (urlBersih.length < 1) {
      showToast("Link wajib diisi.");
      return;
    }

    setSibuk(true);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: namaBersih, url: urlBersih }),
      });

      if (res.status === 401) {
        showToast("Sesi habis. Silakan masuk lagi.");
        router.replace("/admin/login");
        router.refresh();
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        showToast(body?.error ?? "Gagal menambah link. Coba lagi.");
        return;
      }

      setNama("");
      setUrl("");
      showToast(`Link ${namaBersih} ditambahkan. Unggah logonya di tabel.`);
      router.refresh();
    } catch {
      showToast("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 border border-foreground p-4"
    >
      <div className="text-label uppercase text-muted">
        Tambah link ({jumlah}/{CONTACT_MAX})
      </div>

      {penuh ? (
        <p className="text-body text-muted">
          Sudah mencapai {CONTACT_MAX} link. Hapus salah satu dulu untuk
          menambah yang baru.
        </p>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-[200px_1fr]">
            <Input
              placeholder="Nama app (mis. LinkedIn)"
              value={nama}
              maxLength={NAMA_APP_MAX}
              onChange={(e) => setNama(e.target.value)}
              disabled={sibuk}
              aria-label="Nama app"
            />
            <Input
              placeholder="https://... atau mailto:nama@email.com"
              value={url}
              maxLength={URL_MAX}
              onChange={(e) => setUrl(e.target.value)}
              disabled={sibuk}
              aria-label="Link profil"
            />
          </div>
          <Button type="submit" variant="filled" size="sm" disabled={sibuk}>
            {sibuk ? "Menyimpan..." : "Tambah link"}
          </Button>
        </>
      )}
    </form>
  );
}