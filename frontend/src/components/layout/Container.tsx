import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("mx-auto max-w-6xl px-4", className)} {...props} />;
}
