export const primaryButtonClass = [
  "transition duration-150 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3182f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F8FB]",
  "md:hover:-translate-y-[1px] md:hover:shadow-[0px_4px_10px_rgba(0,0,0,0.12)]",
  "active:translate-y-0 active:scale-[0.98] active:shadow-[0px_1px_2px_rgba(0,0,0,0.08)]",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none",
].join(" ");

export const secondaryButtonClass = [
  "transition duration-150 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3182f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F8FB]",
  "md:hover:-translate-y-[1px] md:hover:shadow-[0px_3px_8px_rgba(0,0,0,0.1)]",
  "active:translate-y-0 active:scale-[0.98] active:shadow-[0px_1px_2px_rgba(0,0,0,0.06)]",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none",
].join(" ");

export const ghostButtonClass = [
  "transition duration-150 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3182f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F8FB]",
  "md:hover:-translate-y-[1px]",
  "active:translate-y-0 active:scale-[0.98]",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
].join(" ");
