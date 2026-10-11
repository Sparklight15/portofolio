"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { setFlashToast, useAdminToast } from "./AdminToast";
import { ImagesInput, validateImages } from "./ImagesInput";
import type { ImageItem } from "./ImagesInput";
import { LinksInput, barisTerisi, validateLinks } from "./LinksInput";
import type { LinkRow, LinkRowErrors } from "./LinksInput";
import { ToolsInput } from "./ToolsInput";

export type ProjectFormValues = {
  title: string;
  month: string;
  year: string;
  category: string;
  newCategory: string;
  summary: string;
  problem: string;
  insight: string;
  tools: string[];
  links: LinkRow[];
  images: ImageItem[];
};

type TextFieldName = Exclude<
  keyof ProjectFormValues,
  "tools" | "links" | "images"
>;

type FormErrors = Partial<Record<TextFieldName, string>>;

type ProjectFormProps = {
  projectId?: string;
  initialValues?: ProjectFormValues;
  categories?: string[];
  availableTools?: string[];
};

const JENIS_BARU = "__baru__";

const KOSONG: ProjectFormValues = {
  title: "",
  month: "",
  year: "",
  category: "",
  newCategory: "",
  summary: "",
  problem: "",
  insight: "",
  tools: [],
  links: [],
  images: [],
};

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const JENIS_DEFAULT = ["capstone", "kuliah"];

const fieldClass =
  "w-full rounded-lg border border-foreground bg-background px-4 py-3 text-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground";

function normalisasiJenis(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function labelJenis(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function validate(v: ProjectFormValues, daftarJenis: string[]): FormErrors {
  const errors: FormErrors = {};

  if (!v.title.trim()) errors.title = "Judul wajib diisi.";
  if (!v.month) errors.month = "Pilih bulan.";

  const year = Number(v.year);
  const maxYear = new Date().getFullYear() + 1;
  if (!v.year.trim()) {
    errors.year = "Tahun wajib diisi.";
  } else if (!Number.isInteger(year) || year < 2000 || year > maxYear) {
    errors.year = `Tahun harus antara 2000 dan ${maxYear}.`;
  }

  if (!v.category) {
    errors.category = "Pilih jenis project.";
  } else if (v.category === JENIS_BARU) {
    const baru = normalisasiJenis(v.newCategory);
    if (!baru) {
      errors.newCategory = "Tulis nama jenis baru.";
    } else if (baru.length < 2 || baru.length > 40) {
      errors.newCategory = "Nama jenis 2 sampai 40 karakter.";
    } else if (!/^[a-z0-9]+( [a-z0-9]+)*$/.test(baru)) {
      errors.newCategory = "Hanya huruf, angka, dan spasi.";
    } else if (daftarJenis.includes(baru)) {
      errors.newCategory = "Jenis ini sudah ada di daftar. Pilih dari dropdown.";
    }
  }

  if (!v.summary.trim()) errors.summary = "Deskripsi wajib diisi.";
  if (!v.problem.trim()) errors.problem = "Masalah wajib diisi.";
  if (!v.insight.trim()) errors.insight = "Insight wajib diisi.";

  return errors;
}

type FieldProps = {
  id?: string;
  label: string;
  error?: string;
  children: ReactNode;
};

const labelCell = "bg-surface px-4 py-4 text-label uppercase text-muted";

// Satu baris tabel: label di kiri (atas di layar sempit), isian di kanan.
function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="grid border-b border-border last:border-b-0 sm:grid-cols-[10rem_1fr]">
      {id ? (
        <label htmlFor={id} className={labelCell}>
          {label}
        </label>
      ) : (
        <p className={labelCell}>{label}</p>
      )}
      <div className="px-4 py-3">
        {children}
        {error && id ? (
          <p id={`${id}-error`} className="mt-1 text-caption text-foreground">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type ProjectFormInnerProps = ProjectFormProps & {
  onSaved: () => void;
};

function ProjectFormInner({
  projectId,
  initialValues,
  categories,
  availableTools,
  onSaved,
}: ProjectFormInnerProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [values, setValues] = useState<ProjectFormValues>(
    initialValues ?? KOSONG
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, LinkRowErrors>>(
    {}
  );
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");

  const daftarJenis = Array.from(
    new Set([...JENIS_DEFAULT, ...(categories ?? [])])
  ).sort();

  function setField(name: TextFieldName, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function setTools(next: string[]) {
    setValues((prev) => ({ ...prev, tools: next }));
  }

  function setLinks(next: LinkRow[]) {
    // Hapus pesan error hanya untuk baris yang isinya berubah.
    setLinkErrors((prevErr) => {
      const out = { ...prevErr };
      for (const r of next) {
        const lama = values.links.find((o) => o.id === r.id);
        if (!lama || lama.label !== r.label || lama.url !== r.url) {
          delete out[r.id];
        }
      }
      return out;
    });
    setValues((prev) => ({ ...prev, links: next }));
  }

  // Pakai updater karena kompresi gambar selesai tidak serempak.
  function setImages(updater: (prev: ImageItem[]) => ImageItem[]) {
    setImagesError(null);
    setValues((prev) => ({ ...prev, images: updater(prev.images) }));
  }

  function sesiHabis() {
    showToast("Sesi habis. Silakan masuk lagi.");
    router.replace("/admin/login");
    router.refresh();
  }

  function dataProject() {
    const kategoriFinal =
      values.category === JENIS_BARU
        ? normalisasiJenis(values.newCategory)
        : values.category;

    return {
      title: values.title.trim(),
      month: Number(values.month),
      year: Number(values.year),
      category: kategoriFinal,
      summary: values.summary.trim(),
      problem: values.problem.trim(),
      insight: values.insight.trim(),
      tools: values.tools,
      links: barisTerisi(values.links).map((l) => ({
        label: l.label.trim(),
        url: l.url.trim(),
      })),
    };
  }

  async function simpanBaru() {
    setSubmitting(true);
    setProgress("Menyimpan data project...");

    let idBaru: string | null = null;

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataProject()),
      });

      if (res.status === 401) {
        setSubmitting(false);
        sesiHabis();
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        id?: string;
        error?: string;
      } | null;

      if (!res.ok || !body?.id) {
        showToast(body?.error ?? "Gagal menyimpan project. Coba lagi.");
        setSubmitting(false);
        return;
      }

      idBaru = body.id;

      // Gambar diunggah satu per satu (batas body request di Vercel).
      const gambar = values.images.filter((it) => it.file);
      for (let i = 0; i < gambar.length; i += 1) {
        const item = gambar[i];
        setProgress(`Mengunggah gambar ${i + 1} dari ${gambar.length}...`);

        const fd = new FormData();
        fd.append("file", item.file as File, (item.file as File).name);
        fd.append("caption", item.caption.trim());
        fd.append("order", String(i + 1));
        if (item.thumbnail) fd.append("thumbnail", "1"); // BARU

        const up = await fetch(`/api/admin/projects/${idBaru}/images`, {
          method: "POST",
          body: fd,
        });

        if (!up.ok) {
          const upBody = (await up.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            up.status === 401
              ? "Sesi habis."
              : (upBody?.error ?? `Gambar ${i + 1} gagal diunggah.`)
          );
        }
      }

      setFlashToast("Project berhasil disimpan.");
      onSaved();
      router.push("/admin");
      router.refresh();
    } catch (err) {
      // Batalkan project yang sudah terbuat supaya tidak ada data setengah jadi.
      let pesanBatal = "";
      if (idBaru) {
        try {
          const batal = await fetch(`/api/admin/projects/${idBaru}`, {
            method: "DELETE",
          });
          if (!batal.ok) throw new Error("gagal");
        } catch {
          pesanBatal =
            " Project setengah jadi mungkin masih ada di daftar, hapus manual.";
        }
      }
      const pesan =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.";
      showToast(`${pesan} Project dibatalkan.${pesanBatal}`);
      setSubmitting(false);
    }
  }

  async function simpanEdit(id: string) {
    setSubmitting(true);
    setProgress("Menyimpan perubahan...");

    try {
      const semua = values.images;

      // Gambar lama yang dipertahankan: kirim caption, urutan, dan penanda thumbnail.
      const gambarLama = semua.flatMap((it, i) =>
        it.existing && it.dbId
          ? [
              {
                id: it.dbId,
                caption: it.caption.trim(),
                order: i + 1,
                thumbnail: Boolean(it.thumbnail), // BARU
              },
            ]
          : []
      );

      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dataProject(), images: gambarLama }),
      });

      if (res.status === 401) {
        setSubmitting(false);
        sesiHabis();
        return;
      }

      const body = (await res.json().catch(() => null)) as {
        error?: string;
        warning?: string;
      } | null;

      if (!res.ok) {
        showToast(body?.error ?? "Gagal menyimpan perubahan. Coba lagi.");
        setSubmitting(false);
        return;
      }

      // Gambar baru: unggah satu per satu dengan urutan akhirnya.
      const baru = semua
        .map((it, i) => ({ it, order: i + 1 }))
        .filter((x) => !x.it.existing && x.it.file);

      for (let i = 0; i < baru.length; i += 1) {
        const { it, order } = baru[i];
        setProgress(`Mengunggah gambar baru ${i + 1} dari ${baru.length}...`);

        const fd = new FormData();
        fd.append("file", it.file as File, (it.file as File).name);
        fd.append("caption", it.caption.trim());
        fd.append("order", String(order));
        if (it.thumbnail) fd.append("thumbnail", "1"); // BARU

        let pesanGagal = "";
        try {
          const up = await fetch(`/api/admin/projects/${id}/images`, {
            method: "POST",
            body: fd,
          });
          if (!up.ok) {
            const upBody = (await up.json().catch(() => null)) as {
              error?: string;
            } | null;
            pesanGagal = upBody?.error ?? "gagal diunggah";
          }
        } catch {
          pesanGagal = "tidak bisa terhubung ke server";
        }

        if (pesanGagal) {
          setFlashToast(
            `Perubahan tersimpan, tapi gambar baru ke-${i + 1} (${it.name}) gagal: ${pesanGagal}. Gambar sesudahnya belum diunggah. Buka Edit lagi untuk menambahkannya.`
          );
          onSaved();
          router.push(`/admin/projects/${id}`);
          router.refresh();
          return;
        }
      }

      setFlashToast(body?.warning ?? "Perubahan berhasil disimpan.");
      onSaved();
      router.push(`/admin/projects/${id}`);
      router.refresh();
    } catch {
      showToast("Tidak bisa terhubung ke server. Coba lagi.");
      setSubmitting(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const found = validate(values, daftarJenis);
    const linkFound = validateLinks(values.links);
    const imagesFound = validateImages(values.images);
    setErrors(found);
    setLinkErrors(linkFound);
    setImagesError(imagesFound);

    if (
      Object.keys(found).length > 0 ||
      Object.keys(linkFound).length > 0 ||
      imagesFound
    ) {
      showToast("Periksa lagi isian yang ditandai.");
      return;
    }

    if (projectId) {
      void simpanEdit(projectId);
    } else {
      void simpanBaru();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full space-y-6">
      <div className="border border-foreground">
        <Field id="title" label="Judul" error={errors.title}>
          <input
            id="title"
            type="text"
            maxLength={150}
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "title-error" : undefined}
            placeholder="Contoh: Prediksi churn pelanggan"
            className={fieldClass}
          />
        </Field>

        <Field id="month" label="Waktu">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <select
                id="month"
                aria-label="Bulan"
                value={values.month}
                onChange={(e) => setField("month", e.target.value)}
                aria-invalid={errors.month ? true : undefined}
                aria-describedby={errors.month ? "month-error" : undefined}
                className={fieldClass}
              >
                <option value="">Pilih bulan</option>
                {NAMA_BULAN.map((nama, i) => (
                  <option key={nama} value={String(i + 1)}>
                    {nama}
                  </option>
                ))}
              </select>
              {errors.month ? (
                <p
                  id="month-error"
                  className="mt-1 text-caption text-foreground"
                >
                  {errors.month}
                </p>
              ) : null}
            </div>
            <div>
              <input
                id="year"
                aria-label="Tahun"
                type="number"
                inputMode="numeric"
                value={values.year}
                onChange={(e) => setField("year", e.target.value)}
                aria-invalid={errors.year ? true : undefined}
                aria-describedby={errors.year ? "year-error" : undefined}
                placeholder="2026"
                className={fieldClass}
              />
              {errors.year ? (
                <p id="year-error" className="mt-1 text-caption text-foreground">
                  {errors.year}
                </p>
              ) : null}
            </div>
          </div>
        </Field>

        <Field id="category" label="Jenis" error={errors.category}>
          <select
            id="category"
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={errors.category ? "category-error" : undefined}
            className={fieldClass}
          >
            <option value="">Pilih jenis</option>
            {daftarJenis.map((j) => (
              <option key={j} value={j}>
                {labelJenis(j)}
              </option>
            ))}
            <option value={JENIS_BARU}>+ Tambah jenis baru...</option>
          </select>
        </Field>

        {values.category === JENIS_BARU ? (
          <Field
            id="newCategory"
            label="Jenis baru"
            error={errors.newCategory}
          >
            <input
              id="newCategory"
              type="text"
              maxLength={40}
              value={values.newCategory}
              onChange={(e) => setField("newCategory", e.target.value)}
              aria-invalid={errors.newCategory ? true : undefined}
              aria-describedby={
                errors.newCategory ? "newCategory-error" : undefined
              }
              placeholder="Contoh: magang"
              className={fieldClass}
            />
          </Field>
        ) : null}

        <Field id="summary" label="Deskripsi" error={errors.summary}>
          <textarea
            id="summary"
            rows={4}
            maxLength={2000}
            value={values.summary}
            onChange={(e) => setField("summary", e.target.value)}
            aria-invalid={errors.summary ? true : undefined}
            aria-describedby={errors.summary ? "summary-error" : undefined}
            placeholder="Ringkasan singkat tentang project ini"
            className={fieldClass}
          />
        </Field>

        <Field id="problem" label="Masalah" error={errors.problem}>
          <textarea
            id="problem"
            rows={4}
            maxLength={2000}
            value={values.problem}
            onChange={(e) => setField("problem", e.target.value)}
            aria-invalid={errors.problem ? true : undefined}
            aria-describedby={errors.problem ? "problem-error" : undefined}
            placeholder="Masalah apa yang ingin dijawab?"
            className={fieldClass}
          />
        </Field>

        <Field id="insight" label="Insight" error={errors.insight}>
          <textarea
            id="insight"
            rows={4}
            maxLength={2000}
            value={values.insight}
            onChange={(e) => setField("insight", e.target.value)}
            aria-invalid={errors.insight ? true : undefined}
            aria-describedby={errors.insight ? "insight-error" : undefined}
            placeholder="Temuan atau kesimpulan utama"
            className={fieldClass}
          />
        </Field>

        <Field id="tool-input" label="Tools">
          <ToolsInput
            id="tool-input"
            value={values.tools}
            onChange={setTools}
            available={availableTools ?? []}
          />
        </Field>

        <Field label="Link">
          <LinksInput
            value={values.links}
            onChange={setLinks}
            errors={linkErrors}
          />
        </Field>

        <Field label="Gambar">
          <ImagesInput value={values.images} onChange={setImages} />
          {imagesError ? (
            <p className="mt-1 text-caption text-foreground">{imagesError}</p>
          ) : null}
        </Field>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="filled" disabled={submitting}>
          {submitting ? "Menyimpan..." : "Simpan"}
        </Button>
        {submitting ? null : (
          <Button
            href={projectId ? `/admin/projects/${projectId}` : "/admin"}
            variant="outline"
          >
            Batal
          </Button>
        )}
        {submitting && progress ? (
          <p className="text-caption text-muted">{progress}</p>
        ) : null}
      </div>
    </form>
  );
}

// Pembungkus: setelah simpan berhasil, form dipasang ulang dari awal supaya
// state lama (isi, "Menyimpan...") tidak ikut tersimpan di cache halaman.
// Kunci juga memuat data awal, jadi form edit ikut dipasang ulang kalau
// data dari server berubah.
export function ProjectForm(props: ProjectFormProps) {
  const [resetKey, setResetKey] = useState(0);
  const dataKey = JSON.stringify(props.initialValues ?? null);

  return (
    <ProjectFormInner
      key={`${resetKey}:${dataKey}`}
      {...props}
      onSaved={() => setResetKey((k) => k + 1)}
    />
  );
}