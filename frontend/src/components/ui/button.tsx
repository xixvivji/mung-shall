import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap font-medium " +
    "transition-all duration-200 " +
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-ink text-white " +
      "opacity-85 hover:opacity-100 " +
      "hover:bg-slate-900",
    secondary:
      "bg-white text-ink border border-line " +
      "opacity-85 hover:opacity-100 " +
      "hover:bg-slate-50",
  } as const;

  const sizes = {
    md: "h-11 px-5 rounded-lg text-m",
    lg: "h-12 px-6 rounded-lg text-m",
  } as const;

  return (
    <button
      {...props}
      className={cx(base, variants[variant], sizes[size], className)}
    />
  );
}
