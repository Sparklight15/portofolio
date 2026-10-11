"use client";

import type { KeyboardEvent } from "react";
import { Button } from "../ui/Button";

export type LinkRow = {
  id: string;
  label: string;
  url: string;
};

export type LinkRowErrors = { label?: string; url?: string };

type LinksInputProps = {
  value: LinkRow[];
  onChange: (next: LinkRow[]) => void;
  errors: Record<string, LinkRowErrors>;
};

const MAX_LINKS = 10;
const MAX_LABEL = 60;
const MAX_URL = 2000;

const fieldClass =
  "w-full rounded-lg border border-foreground bg-background px-4 py-3 text-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground";

let counter = 0;
function barisBaru(): LinkRow {
  counter += 1;
  return { id: `link-${Date.now()}-${counter}`, label: "", url: "" };
}

// Baris yang dua-duanya kosong diabaikan. Dipakai juga oleh formulir saat simpan.
export function barisTerisi(rows: LinkRow[]): LinkRow[] {
  return rows.filter((r) => r.label.trim() || r.url.trim());
}

export function validateLinks(rows: LinkRow[]): Record<string, LinkRowErrors> {
  const errors: Record<string, LinkRowErrors> = {};

  for (const r of barisTerisi(rows)) {
    const label = r.label.trim();
    const url = r.url.trim();
    const e: LinkRowErrors = {};

    if (!label) {
      e.label = "Label wajib diisi.";
    } else if (label.length > MAX_LABEL) {
      e.label = `Label maksimal ${MAX_LABEL} karakter.`;
    }

    if (!url) {
      e.url = "URL wajib diisi.";
    } else if (url.length > MAX_URL) {
      e.url = `URL maksimal ${MAX_URL} karakter.`;
    } else {
      let ok = false;
      try {
        const parsed = new URL(url);
        ok = parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        ok = false;
      }
      if (!ok) e.url = "URL harus diawali http:// atau https://";
    }

    if (e.label || e.url) errors[r.id] = e;
  }

  return errors;
}

export function LinksInput({ value, onChange, errors }: LinksInputProps) {
  function ubah(id: string, field: "label" | "url", text: string) {
    onChange(value.map((r) => (r.id === id ? { ...r, [field]: text } : r)));
  }

  function hapus(id: string) {
    onChange(value.filter((r) => r.id !== id));
  }

  function tambah() {
    if (value.length >= MAX_LINKS) return;
    onChange([...value, barisBaru()]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Enter di sini tidak boleh mengirim formulir.
    if (e.key === "Enter") e.preventDefault();
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="text-caption text-muted">Belum ada link.</p>
      ) : (
        <ul className="space-y-4">
          {value.map((row, i) => {
            const err = errors[row.id];
            return (
              <li key={row.id}>
                <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-start">
                  <div>
                    <input
                      type="text"
                      maxLength={MAX_LABEL}
                      value={row.label}
                      onChange={(e) => ubah(row.id, "label", e.target.value)}
                      onKeyDown={onKeyDown}
                      aria-label={`Label link ${i + 1}`}
                      aria-invalid={err?.label ? true : undefined}
                      placeholder="Label, contoh: GitHub"
                      className={fieldClass}
                    />
                    {err?.label ? (
                      <p className="mt-1 text-caption text-foreground">
                        {err.label}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <input
                      type="url"
                      maxLength={MAX_URL}
                      value={row.url}
                      onChange={(e) => ubah(row.id, "url", e.target.value)}
                      onKeyDown={onKeyDown}
                      aria-label={`URL link ${i + 1}`}
                      aria-invalid={err?.url ? true : undefined}
                      placeholder="https://..."
                      className={fieldClass}
                    />
                    {err?.url ? (
                      <p className="mt-1 text-caption text-foreground">
                        {err.url}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="gray"
                    size="sm"
                    onClick={() => hapus(row.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={tambah}
        disabled={value.length >= MAX_LINKS}
      >
        + Tambah link
      </Button>
      {value.length >= MAX_LINKS ? (
        <p className="text-caption text-muted">
          Maksimal {MAX_LINKS} link per project.
        </p>
      ) : null}
    </div>
  );
}