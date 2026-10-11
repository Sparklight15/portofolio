"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, onClose, duration = 5000 }: Props) {
  const [show, setShow] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [duration]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role="alert"
        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border-2 border-foreground bg-background p-4 shadow-hard transition duration-200 ease-out motion-reduce:transition-none ${
          show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-caption font-bold leading-none text-background"
        >
          !
        </span>
        <p className="flex-1 pt-0.5 text-caption leading-snug text-foreground">
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="shrink-0 text-body leading-none text-muted transition-colors hover:text-foreground"
        >
          ×
        </button>
      </div>
    </div>
  );
}