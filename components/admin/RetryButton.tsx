"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

export function RetryButton() {
  const router = useRouter();

  return (
    <Button variant="outline" size="sm" onClick={() => router.refresh()}>
      Coba lagi
    </Button>
  );
}