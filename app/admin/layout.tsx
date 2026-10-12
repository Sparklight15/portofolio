import { Suspense } from "react";
import type { ReactNode } from "react";
import { AdminChrome } from "../../components/admin/AdminChrome";
import { AdminToastProvider } from "../../components/admin/AdminToast";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminToastProvider>
      <Suspense fallback={null}>
        <AdminChrome>{children}</AdminChrome>
      </Suspense>
    </AdminToastProvider>
  );
}