import type { PropsWithChildren } from "react";

export default function Container({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`mx-auto w-full max-w-[1140px] px-6 md:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
