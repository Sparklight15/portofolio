import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { RetryButton } from "./RetryButton";

export function AdminLoading() {
  return (
    <Card variant="outline" padding="lg">
      <div className="flex items-center justify-center gap-3 py-6">
        <Spinner size="md" />
        <p className="text-body text-muted">Memuat project...</p>
      </div>
    </Card>
  );
}

export function AdminEmpty() {
  return (
    <Card variant="outline" padding="lg">
      <div className="py-6 text-center">
        <p className="font-serif text-h2 italic text-foreground">
          Belum ada project.
        </p>
        <p className="mt-2 text-body text-muted">
          Project yang kamu tambahkan akan muncul di sini.
        </p>
      </div>
    </Card>
  );
}

type AdminErrorProps = {
  detail?: string;
};

export function AdminError({ detail }: AdminErrorProps) {
  return (
    <Card variant="outline" padding="lg">
      <div className="py-6 text-center">
        <p className="font-serif text-h2 italic text-foreground">
          Gagal memuat project.
        </p>
        <p className="mt-2 text-body text-muted">
          Coba muat ulang. Kalau masih gagal, cek koneksi atau kunci Supabase.
        </p>
        {detail ? (
          <p className="mt-2 text-caption text-muted">{detail}</p>
        ) : null}
        <div className="mt-4 flex justify-center">
          <RetryButton />
        </div>
      </div>
    </Card>
  );
}