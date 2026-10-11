import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Props = Omit<ComponentProps<"input">, "className"> & {
  variant?: "outline" | "filled";
  icon?: ReactNode;
  className?: string;
};

const variants = {
  outline: "border-foreground bg-background",
  filled: "border-surface bg-surface focus-within:border-foreground",
};

export function Input({ variant = "outline", icon, className, ...rest }: Props) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors",
        variants[variant],
        className,
      )}
    >
      {icon ? <span className="shrink-0 text-muted">{icon}</span> : null}
      <input
        className="w-full bg-transparent text-body leading-none text-foreground outline-none placeholder:text-muted"
        {...rest}
      />
    </label>
  );
}