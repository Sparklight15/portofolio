import type { ReactNode } from "react";

type AdminShellProps = {
  /** Opsional: kalau dikosongkan, judul tidak ditampilkan. */
  title?: string;
  /** Opsional: tombol/aksi yang tampil di kanan, sejajar dengan judul. */
  action?: ReactNode;
  children: ReactNode;
};

// Header, tab, dan kotak sudah ada di app/admin/layout.tsx (AdminChrome).
// Komponen ini hanya mengatur judul/aksi per halaman dan isinya.
export function AdminShell({ title, action, children }: AdminShellProps) {
  const adaBarisAtas = Boolean(title) || Boolean(action);

  return (
    <>
      {adaBarisAtas ? (
        <div
          className={`flex flex-wrap items-center gap-4 ${
            title ? "justify-between" : "justify-end"
          }`}
        >
          {title ? (
            <h1 className="font-serif text-h1 italic text-foreground">
              {title}
            </h1>
          ) : null}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={adaBarisAtas ? "mt-8" : ""}>{children}</div>
    </>
  );
}