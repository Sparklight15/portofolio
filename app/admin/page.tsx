import type { Metadata } from "next";
import { Card } from "../../components/ui/Card";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = {
  title: "Dashboard admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card variant="featured" padding="lg" className="w-full max-w-sm">
        <p className="text-label uppercase text-muted">Area admin</p>
        <h1 className="mt-2 font-serif text-h1 italic text-foreground">
          Halo.
        </h1>
        <p className="mt-2 text-body text-muted">
          Kamu sudah masuk. Dashboard menyusul di milestone berikutnya.
        </p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </Card>
    </main>
  );
}