import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Props = {
  active?: boolean;
  className?: string;
  children: ReactNode;
};

export function Tag({ active = false, className, children }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-foreground px-2.5 py-1 text-[0.75rem] font-medium leading-none",
        active ? "bg-foreground text-background" : "bg-background text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}