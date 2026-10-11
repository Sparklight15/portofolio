"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "../ui/Button";

type ToolsInputProps = {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  available: string[];
};

const MAX_TOOLS = 20;
const MAX_PANJANG = 40;
const NAMA_RE = /^[\p{L}\p{N}][\p{L}\p{N} .+#/_()-]*$/u;

const chipDasar =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-caption";

const fieldClass =
  "w-full rounded-lg border border-foreground bg-background px-4 py-3 text-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground";

export function ToolsInput({ id, value, onChange, available }: ToolsInputProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dipilihLower = new Set(value.map((v) => v.toLowerCase()));
  const availableLower = new Set(available.map((a) => a.toLowerCase()));
  const belumDipilih = available.filter(
    (a) => !dipilihLower.has(a.toLowerCase())
  );

  function tambah(raw: string) {
    const nama = raw.trim().replace(/\s+/g, " ");
    if (!nama) return;

    if (nama.length > MAX_PANJANG) {
      setError(`Nama tools maksimal ${MAX_PANJANG} karakter.`);
      return;
    }
    if (!NAMA_RE.test(nama)) {
      setError("Nama tools hanya boleh huruf, angka, spasi, dan . + # / _ ( ) -");
      return;
    }

    const kanonik =
      available.find((a) => a.toLowerCase() === nama.toLowerCase()) ?? nama;

    if (dipilihLower.has(kanonik.toLowerCase())) {
      setText("");
      setError(null);
      return;
    }
    if (value.length >= MAX_TOOLS) {
      setError(`Maksimal ${MAX_TOOLS} tools per project.`);
      return;
    }

    onChange([...value, kanonik]);
    setText("");
    setError(null);
  }

  function hapus(nama: string) {
    onChange(value.filter((v) => v !== nama));
    setError(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Enter di sini menambah tools, bukan mengirim formulir.
    if (e.key === "Enter") {
      e.preventDefault();
      tambah(text);
    }
  }

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Tools terpilih">
          {value.map((nama) => {
            const baru = !availableLower.has(nama.toLowerCase());
            return (
              <li
                key={nama}
                className={`${chipDasar} border-foreground bg-foreground text-background`}
              >
                <span>
                  {nama}
                  {baru ? " (baru)" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => hapus(nama)}
                  aria-label={`Hapus ${nama}`}
                  className="leading-none hover:opacity-70"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-caption text-muted">Belum ada tools dipilih.</p>
      )}

      {belumDipilih.length > 0 ? (
        <div>
          <p className="mb-2 text-caption text-muted">Pilih dari yang ada:</p>
          <div className="flex flex-wrap gap-2">
            {belumDipilih.map((nama) => (
              <button
                key={nama}
                type="button"
                onClick={() => tambah(nama)}
                className={`${chipDasar} border-border bg-background text-charcoal hover:border-foreground hover:text-foreground`}
              >
                + {nama}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          maxLength={MAX_PANJANG}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          onKeyDown={onKeyDown}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder="Ketik nama tools, lalu Enter"
          className={fieldClass}
        />
        <Button variant="outline" size="sm" onClick={() => tambah(text)}>
          Tambah
        </Button>
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-caption text-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}