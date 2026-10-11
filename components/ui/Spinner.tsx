import { cn } from "../../lib/cn";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-9 border-[3px]",
};

export function Spinner({ size = "md", className }: Props) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={cn(
        "inline-block animate-spin rounded-full border-border border-t-foreground",
        sizes[size],
        className,
      )}
    />
  );
}