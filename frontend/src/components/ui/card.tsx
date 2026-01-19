import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-3xl border border-line bg-surface shadow-soft",
        "transition hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}
