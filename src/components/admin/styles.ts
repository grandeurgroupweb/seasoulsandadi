type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md";

// terracotta-500 fills always carry ink-deep text (white fails contrast at 3.2:1).
const variants: Record<Variant, string> = {
  primary: "bg-terracotta-500 text-ink-deep hover:bg-terracotta-400 active:bg-terracotta-600 shadow-soft",
  secondary: "bg-sea-600 text-white hover:bg-sea-700 shadow-soft",
  ghost: "border border-sea-600 text-sea-700 bg-surface-card hover:bg-sea-50",
  danger: "bg-terracotta-800 text-white hover:bg-terracotta-900",
  subtle: "text-ink-muted hover:bg-sand-100 hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm gap-1.5",
  md: "min-h-11 px-5 text-sm gap-2",
};

export function adminButton(variant: Variant = "primary", size: Size = "md", extra = "") {
  return [
    "inline-flex items-center justify-center rounded-pill font-semibold transition-colors duration-200 ease-out-soft",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    extra,
  ].join(" ");
}

export const iconButton =
  "inline-flex size-10 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-sand-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

export const inputBase =
  "w-full rounded-md border border-line bg-surface-card px-3 text-base text-ink placeholder:text-sand-600 transition-shadow focus:border-sea-600 focus:shadow-soft focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-terracotta-800";

export const panel = "rounded-lg bg-surface-card shadow-soft";
