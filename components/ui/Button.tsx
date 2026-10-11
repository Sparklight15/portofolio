import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "filled" | "outline" | "gray";
type Size = "md" | "sm" | "icon";

type Props = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const base =
  "inline-flex items-center justify-center gap-2 border-2 font-sans font-semibold leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:border-surface disabled:bg-surface disabled:text-border";

const variants: Record<Variant, string> = {
  filled: "border-foreground bg-foreground text-background hover:bg-charcoal",
  outline: "border-foreground bg-background text-foreground hover:bg-surface",
  gray: "border-surface bg-surface text-foreground hover:border-border hover:bg-border",
};

const sizes: Record<Size, string> = {
  md: "rounded-lg px-6 py-3.5 text-body",
  sm: "rounded-lg px-4 py-2.5 text-[0.8125rem]",
  icon: "size-10 rounded-full text-body",
};

export function Button({
  variant = "filled",
  size = "md",
  href,
  className,
  children,
  ...rest
}: Props) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}