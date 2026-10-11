"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { kompresGambar } from "../../lib/compress-image";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

export type ImageItem = {
  id: string;
  name: string;
  caption: string;
  status: "processing" | "ready" | "error";
  originalSize: number;
  file?: File;
  previewUrl?: string;
  size?: number;
  error?: string;
  // Gambar yang sudah tersimpan di database (mode edit).
  existing?: boolean;
  dbId?: string;
  // Gambar ini dipakai sebagai thumbnail di halaman /project.
  thumbnail?: boolean;
};

type ImagesInputProps = {
  value: ImageItem[];
  onChange: (updater: (prev: ImageItem[]) => ImageItem[]) => void;
};

const MAX_GAMBAR = 5;
const MAX_ASLI_BYTE = 15 * 1024 * 1024;
const MAX_CAPTION = 200;
const TIPE_BOLEH = ["image/jpeg", "image/png", "image/webp"];

const fieldClass =
  "w-full rounded-lg border border-foreground bg-background px-4 py-3 text-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground";

let counter = 0;
function buatId(): string {
  counter += 1;
  return `img-${Date.now()}-${counter}`;
}

function formatUkuran(byte: number): string {
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024))} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

// Dipakai formulir saat Simpan. Null = aman.
export function validateImages(items: ImageItem[]): string | null {
  if (items.length > MAX_GAMBAR) {
    return `Maksimal ${MAX_GAMBAR} gambar per project. Hapus ${items.length - MAX_GAMBAR} gambar dulu.`;
  }
  if (items.some((i) => i.status === "processing")) {
    return "Tunggu sampai semua gambar selesai diproses.";
  }
  if (items.some((i) => i.status === "error")) {
    return "Hapus gambar yang gagal diproses, atau unggah ulang.";
  }
  return null;
}

export function ImagesInput({ value, onChange }: ImagesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dibatalkan = useRef<Set<string>>(new Set());
  const valueRef = useRef<ImageItem[]>(value);
  const [pesan, setPesan] = useState<string[]>([]);

  useEffect(() => {
    valueRef.current = value;
  });

  // Lepas semua URL preview lokal saat formulir ditutup.
  useEffect(() => {
    return () => {
      for (const item of valueRef.current) {
        if (item.previewUrl && !item.existing) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    };
  }, []);

  async function onPilih(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const ditolak: string[] = [];
    const diterima: File[] = [];
    let sisa = MAX_GAMBAR - value.length;

    for (const f of files) {
      if (!TIPE_BOLEH.includes(f.type)) {
        ditolak.push(`${f.name}: hanya JPG, PNG, atau WebP.`);
      } else if (f.size > MAX_ASLI_BYTE) {
        ditolak.push(`${f.name}: lebih dari 15 MB.`);
      } else if (sisa <= 0) {
        ditolak.push(`${f.name}: maksimal ${MAX_GAMBAR} gambar per project.`);
      } else {
        diterima.push(f);
        sisa -= 1;
      }
    }

    setPesan(ditolak);
    if (diterima.length === 0) return;

    const antrean = diterima.map((file) => ({ file, id: buatId() }));
    const baris: ImageItem[] = antrean.map(({ file, id }) => ({
      id,
      name: file.name,
      caption: "",
      status: "processing",
      originalSize: file.size,
    }));
    onChange((prev) => [...prev, ...baris]);

    // Satu per satu supaya memori browser tidak melonjak.
    for (const { file, id } of antrean) {
      if (dibatalkan.current.has(id)) continue;
      try {
        const hasil = await kompresGambar(file);
        if (dibatalkan.current.has(id)) continue;
        const previewUrl = URL.createObjectURL(hasil);
        onChange((prev) =>
          prev.map((it) =>
            it.id === id
              ? { ...it, status: "ready", file: hasil, previewUrl, size: hasil.size }
              : it
          )
        );
      } catch (err) {
        if (dibatalkan.current.has(id)) continue;
        const msg =
          err instanceof Error ? err.message : "Gagal memproses gambar.";
        onChange((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, status: "error", error: msg } : it
          )
        );
      }
    }
  }

  function hapus(item: ImageItem) {
    dibatalkan.current.add(item.id);
    if (item.previewUrl && !item.existing) URL.revokeObjectURL(item.previewUrl);
    onChange((prev) => prev.filter((it) => it.id !== item.id));
  }

  function ubahCaption(id: string, caption: string) {
    onChange((prev) =>
      prev.map((it) => (it.id === id ? { ...it, caption } : it))
    );
  }

  // Hanya satu gambar yang boleh jadi thumbnail.
  function ubahThumbnail(id: string, nilai: boolean) {
    onChange((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, thumbnail: nilai }
          : nilai
            ? { ...it, thumbnail: false }
            : it
      )
    );
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Enter di caption tidak boleh mengirim formulir.
    if (e.key === "Enter") e.preventDefault();
  }

  return (
    <div className="space-y-3">
      <p className="text-caption text-muted">
        {value.length}/{MAX_GAMBAR} gambar. Centang &quot;Jadikan thumbnail&quot;
        pada satu gambar untuk dipakai di halaman Project. Kalau tidak ada yang
        dicentang, gambar pertama yang dipakai.
      </p>

      {value.length === 0 ? (
        <p className="text-caption text-muted">Belum ada gambar.</p>
      ) : (
        <ul className="space-y-4">
          {value.map((item, i) => (
            <li
              key={item.id}
              className="flex gap-4 border border-border p-3 sm:items-start"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-border bg-surface">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.caption || item.name}
                    className="h-full w-full object-cover"
                  />
                ) : item.status === "processing" ? (
                  <Spinner size="sm" />
                ) : (
                  <span className="text-caption text-muted">Gagal</span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <p className="truncate text-caption text-muted">
                  {i + 1}. {item.name}
                </p>

                {item.status === "processing" ? (
                  <p className="text-caption text-muted">Memproses...</p>
                ) : null}

                {item.status === "ready" && item.existing ? (
                  <p className="text-caption text-muted">Sudah tersimpan</p>
                ) : null}

                {item.status === "ready" && !item.existing && item.size ? (
                  <p className="text-caption text-muted">
                    {formatUkuran(item.originalSize)} → {formatUkuran(item.size)}
                  </p>
                ) : null}

                {item.status === "error" ? (
                  <p className="text-caption text-foreground">
                    {item.error ?? "Gagal memproses gambar."}
                  </p>
                ) : null}

                {item.status !== "error" ? (
                  <input
                    type="text"
                    maxLength={MAX_CAPTION}
                    value={item.caption}
                    onChange={(e) => ubahCaption(item.id, e.target.value)}
                    onKeyDown={onKeyDown}
                    aria-label={`Caption gambar ${i + 1}`}
                    placeholder="Caption (opsional)"
                    className={fieldClass}
                  />
                ) : null}

                {item.status !== "error" ? (
                  <label className="flex items-center gap-2 text-caption text-foreground">
                    <input
                      type="checkbox"
                      checked={Boolean(item.thumbnail)}
                      onChange={(e) => ubahThumbnail(item.id, e.target.checked)}
                      className="h-4 w-4 accent-foreground"
                    />
                    Jadikan thumbnail
                  </label>
                ) : null}
              </div>

              <Button variant="gray" size="sm" onClick={() => hapus(item)}>
                Hapus
              </Button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={onPilih}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={value.length >= MAX_GAMBAR}
      >
        + Pilih gambar
      </Button>

      {value.length >= MAX_GAMBAR ? (
        <p className="text-caption text-muted">
          Maksimal {MAX_GAMBAR} gambar per project.
        </p>
      ) : null}

      {pesan.length > 0 ? (
        <ul className="space-y-1">
          {pesan.map((m) => (
            <li key={m} className="text-caption text-foreground">
              {m}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}