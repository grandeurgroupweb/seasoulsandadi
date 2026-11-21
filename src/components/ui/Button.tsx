import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "outline-light";

// terracotta-500 fill needs ink-deep text: white on it fails contrast (3.2:1).
const variants: Record<Variant, string> = {
  primary: "bg-terracotta-500 text-ink-deep hover:bg-terracotta-400 shadow-soft",
  secondary: "bg-sea-600 text-white hover:bg-sea-700 shadow-soft",
  outline: "border-2 border-sea-600 text-sea-800 hover:bg-sea-600 hover:text-white",
  "outline-light": "border-2 border-sand-100 text-sand-50 hover:bg-sand-50 hover:text-sea-900",
};

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-6 py-3 text-base font-semibold transition-colors duration-200 ease-out-soft disabled:opacity-60";

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

type LinkButtonProps = ComponentProps<"a"> & { variant?: Variant; external?: boolean; children: ReactNode };

export function LinkButton({ variant = "primary", external, className = "", children, ...rest }: LinkButtonProps) {
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a className={buttonClass(variant, className)} {...externalProps} {...rest}>
      {children}
    </a>
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "primary", className = "", type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}
