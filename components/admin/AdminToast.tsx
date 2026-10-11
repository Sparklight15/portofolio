"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Toast } from "../ui/Toast";

type ToastState = { id: number; message: string } | null;

type AdminToastContextValue = {
  showToast: (message: string) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const FLASH_KEY = "admin_flash";

// Pesan yang harus tampil di halaman berikutnya (setelah pindah halaman).
export function setFlashToast(message: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, message);
  } catch {
    // abaikan: toast ini hanya pelengkap
  }
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const closeToast = useCallback(() => setToast(null), []);
  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    try {
      const pesan = sessionStorage.getItem(FLASH_KEY);
      if (pesan) {
        sessionStorage.removeItem(FLASH_KEY);
        showToast(pesan);
      }
    } catch {
      // abaikan
    }
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Toast key={toast.id} message={toast.message} onClose={closeToast} />
      ) : null}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast harus dipakai di dalam AdminShell.");
  }
  return ctx;
}