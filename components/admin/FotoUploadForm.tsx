"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "./AdminToast";

const MAX_BYTE = 5 * 1024 * 1024;
const TIPE_BOLEH = ["image/jpeg", "image/png", "image/webp"];

export function FotoUploadForm({ adaFoto }: { adaFoto: boolean }) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  function pilihFile(f: File | null) {
    setError("");
    if (f && !TIPE_BOLEH.includes(f.type)) {
      setFile(null);
      setError("Foto harus berformat JPG, PNG, atau WebP.");
      return;
    }
    if (f && f.size > MAX_BYTE) {
      setFile(null);
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }
    setFile(f);
  }

  async function kirim() {
    if (!file || menyimpan) return;
    setError("");
    setMenyimpan(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/profile/foto", {
        method: "POST",
        body,
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        setError(json?.error ?? "Gagal mengunggah foto.");
        return;
      }

      showToast("Foto berhasil diunggah.");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("Gagal mengunggah foto. Cek koneksi lalu coba lagi.");
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={menyimpan}
        onChange={(e) => pilihFile(e.target.files?.[0] ?? null)}
        className="block w-full text-body text-foreground file:mr-4 file:cursor-pointer file:border file:border-foreground file:bg-background file:px-4 file:py-2 file:text-label file:uppercase file:text-foreground"
      />
      <p className="text-caption text-muted">
        Format JPG, PNG, atau WebP, maksimal 5 MB.{" "}
        {adaFoto ? "File baru akan menggantikan foto yang sekarang." : ""}
      </p>

      {error ? (
        <p role="alert" className="text-caption text-foreground">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={kirim}
        disabled={!file || menyimpan}
        className="rounded-full border border-foreground bg-foreground px-5 py-2 text-label uppercase text-background disabled:cursor-not-allowed disabled:opacity-40"
      >
        {menyimpan ? "Mengunggah..." : adaFoto ? "Ganti foto" : "Unggah foto"}
      </button>
    </div>
  );
}