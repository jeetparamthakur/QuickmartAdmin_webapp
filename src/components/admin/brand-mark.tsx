import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { box: "h-8 w-8", letter: "text-lg", dot: "right-1.5 bottom-1.5 h-1.5 w-1.5" },
  md: { box: "h-9 w-9", letter: "text-xl", dot: "right-2 bottom-2 h-2 w-2" },
  lg: { box: "h-12 w-12", letter: "text-2xl", dot: "right-2.5 bottom-2.5 h-2 w-2" },
};

export function BrandMark({ size = "md", className }: BrandMarkProps) {
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-card shadow-[var(--shadow-sm)] ring-1 ring-border/60",
        s.box,
        className
      )}
      aria-hidden
    >
      <span className={cn("font-extrabold tracking-tight text-primary", s.letter)}>Q</span>
      <span
        className={cn("absolute rounded-full bg-[#2ECC71]", s.dot)}
        aria-hidden
      />
    </div>
  );
}
