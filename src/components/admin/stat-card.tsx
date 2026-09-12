import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  href?: string;
  format?: "number" | "currency";
  className?: string;
  icon?: LucideIcon;
  description?: string;
  accentClass?: string;
}

export function StatCard({
  title,
  value,
  href,
  format = "number",
  className,
  icon: Icon,
  description,
  accentClass = "bg-primary/10 text-primary",
}: StatCardProps) {
  const display = format === "currency" ? formatCurrency(value) : formatNumber(value);

  const content = (
    <Card
      className={cn(
        "group border-border/40 bg-card/80 shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all duration-200",
        "hover:border-primary/25 hover:bg-card hover:shadow-[var(--shadow-md)]",
        href && "cursor-pointer",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{display}</p>
            {description && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset ring-black/[0.04]",
                accentClass
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {href && (
          <p className="mt-4 flex items-center gap-1 text-xs font-medium text-primary/80 transition-colors group-hover:text-primary">
            View all <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}

interface MetricGridProps {
  children: React.ReactNode;
  variant?: "default" | "overview";
}

export function MetricGrid({ children, variant = "default" }: MetricGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        variant === "overview"
          ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          : "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      )}
    >
      {children}
    </div>
  );
}
