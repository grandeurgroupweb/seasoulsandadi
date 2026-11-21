import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

type Props = {
  dir: "prev" | "next";
  label: string;
  onClick: () => void;
  className?: string;
};

/** Frosted round arrow shared by every carousel, so they read as one family. */
export function GlassArrow({ dir, label, onClick, className = "" }: Props) {
  const Icon = dir === "prev" ? LuArrowLeft : LuArrowRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`group pointer-events-auto grid size-12 place-items-center rounded-pill border border-sand-50/80 bg-sand-50/70 text-sea-800 shadow-card backdrop-blur-md transition-[transform,background-color,color] duration-300 ease-out-soft hover:scale-105 hover:bg-sea-700 hover:text-sand-50 active:scale-95 md:size-14 ${className}`}
    >
      <Icon
        aria-hidden
        className={`size-5 transition-transform duration-300 ease-out-soft md:size-6 ${
          dir === "prev" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
        }`}
      />
    </button>
  );
}
