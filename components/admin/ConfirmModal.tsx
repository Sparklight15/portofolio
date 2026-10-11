"use client";

import { useEffect } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-6"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant="featured" padding="md">
          <h2
            id="confirm-modal-title"
            className="font-serif text-h2 italic text-foreground"
          >
            {title}
          </h2>
          <p className="mt-2 text-body text-muted">{message}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              variant="filled"
              size="sm"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Menghapus..." : confirmLabel}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}