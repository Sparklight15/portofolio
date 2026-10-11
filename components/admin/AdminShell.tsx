import type { ReactNode } from "react";
import { LogoutButton } from "../../app/admin/LogoutButton";
import { AdminToastProvider } from "./AdminToast";

type AdminShellProps = {
  /** Opsional: kalau dikosongkan, judul tidak ditampilkan. */
  title?: string;
  /** Opsional: tombol/aksi yang tampil di kanan, sejajar dengan judul. */
  action?: ReactNode;
  children: ReactNode;
};

export function AdminShell({ title, action, children }: AdminShellProps) {
  const adaBarisAtas = Boolean(title) || Boolean(action);

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <p className="text-label uppercase text-muted">
              Portofolio / Admin
            </p>
            <LogoutButton />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
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
        </main>
      </div>
    </AdminToastProvider>
  );
}