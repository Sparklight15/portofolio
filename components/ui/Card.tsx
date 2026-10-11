import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

type Props = ComponentProps<"div"> & {
  variant?: "surface" | "outline" | "featured";
  padding?: "sm" | "md" | "lg";
};

const variants = {
  surface: "rounded-2xl bg-surface",
  outline: "rounded-2xl border-2 border-foreground bg-background",
  featured: "rounded-lg border-2 border-foreground bg-background shadow-hard",
};

const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({
  variant = "surface",
  padding = "md",
  className,
  ...rest
}: Props) {
  return (
    <div
      className={cn(variants[variant], paddings[padding], className)}
      {...rest}
    />
  );
}