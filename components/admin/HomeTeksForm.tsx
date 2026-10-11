"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "./AdminToast";
import { HOME_DEFAULT } from "../../lib/home-defaults";

type Nilai = {
  kicker1: string;
  kicker2: string;
  greeting: string;
  label1: string;
  label2: string;
  label3: string;
};

const FIELD: { key: keyof Nilai; label: string; max: number }[] = [
  { key: "kicker1", label: "Teks kecil 1", max: 40 },
  { key: "kicker2", label: "Teks kecil 2", max: 40 },
  { key: "greeting", label: "Sapaan (gelembung)", max: 30 },
  { key: "label1", label: "Label bawah 1", max: 30 },
  { key: "label2", label: "Label bawah 2", max: 30 },
  { key: "label3", label: "Label bawah 3", max: 30 },
];

export function HomeTeksForm({ awal }: { awal: Nilai }) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [nilai, setNilai] = useState<Nilai>(awal);
  const [error, setError] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  async function simpan() {
    if (menyimpan) return;
    setError("");
    setMenyimpan(true);
    try {
      const res = await fetch("/api/admin/profile/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nilai),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        setError(json?.error ?? "Gagal menyimpan teks Home.");
        return;
      }

      showToast("Teks Home berhasil disimpan.");
      router.refresh();
    } catch {
      setError("Gagal menyimpan. Cek koneksi lalu coba lagi.");
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div className="space-y-4">
      {FIELD.map((f) => (
        <div key={f.key} className="space-y-1">
          <label
            htmlFor={`home-${f.key}`}
            className="block text-label uppercase text-muted"
          >
            {f.label}
          </label>
          <input
            id={`home-${f.key}`}
            type="text"
            value={nilai[f.key]}
            maxLength={f.max}
            disabled={menyimpan}
            placeholder={HOME_DEFAULT[f.key]}
            onChange={(e) => setNilai({ ...nilai, [f.key]: e.target.value })}
            className="block w-full border border-foreground bg-background px-3 py-2 text-body text-foreground placeholder:text-muted"
          />
          <p className="text-caption text-muted">
            {nilai[f.key].length}/{f.max} karakter
          </p>
        </div>
      ))}

      <p className="text-caption text-muted">
        Kosongkan kolom untuk memakai teks bawaan (yang tampil abu-abu di
        kolom).
      </p>

      {error ? (
        <p role="alert" className="text-caption text-foreground">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={simpan}
        disabled={menyimpan}
        className="rounded-full border border-foreground bg-foreground px-5 py-2 text-label uppercase text-background disabled:cursor-not-allowed disabled:opacity-40"
      >
        {menyimpan ? "Menyimpan..." : "Simpan teks"}
      </button>
    </div>
  );
}