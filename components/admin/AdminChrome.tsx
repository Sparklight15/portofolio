"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "../../app/admin/LogoutButton";
import { Button } from "../ui/Button";

// Rangka admin yang dipasang SEKALI di app/admin/layout.tsx: header, baris tab,
// dan kotak isi. Pindah tab hanya mengganti isi kotak; rangkanya tidak dibuat ulang.

const TAB = [
  { label: "Project", href: "/admin" },
  { label: "Konten Home", href: "/admin/home" },
  { label: "Konten About", href: "/admin/about" },
  { label: "Kelola Tools", href: "/admin/tools" },
  { label: "Kelola Contact", href: "/admin/contact" },
] as const;

function tabAktif(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/projects");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = (usePathname() || "/admin").replace(/\/$/, "") || "/";

  // Halaman login tidak memakai rangka ini.
  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <p className="text-label uppercase text-muted">Portofolio / Admin</p>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-10 pt-8">
        {/* Baris tab: tab aktif menutup garis atas kotak (-mb-px + border bawah
            berwarna latar), jadi terlihat menyatu dengan kotak isi. */}
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <nav
            aria-label="Menu admin"
            className="flex flex-wrap items-end gap-1"
          >
            {TAB.map((t) => {
              const aktif = tabAktif(pathname, t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={aktif ? "page" : undefined}
                  className={`relative z-10 -mb-px rounded-t-lg border px-5 py-2.5 text-[14px] no-underline transition-colors motion-reduce:transition-none ${
                    aktif
                      ? "border-border border-b-background bg-background font-semibold text-foreground"
                      : "border-transparent font-normal text-muted hover:bg-surface hover:text-foreground focus-visible:bg-surface focus-visible:text-foreground"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>

          {pathname === "/admin" ? (
            <div className="pb-2">
              <Button href="/admin/projects/baru" variant="filled" size="sm">
                Tambah Project
              </Button>
            </div>
          ) : null}
        </div>

        <main className="rounded-b-lg rounded-tr-lg border border-border p-6">
          {children}
        </main>
      </div>
    </div>
  );
}