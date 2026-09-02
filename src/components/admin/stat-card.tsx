import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  href?: string;
  format?: "number" | "currency";
  className?: string;
}

export function StatCard({ title, value, href, format = "number", className }: StatCardProps) {
  const display = format === "currency" ? formatCurrency(value) : formatNumber(value);

  const content = (
    <Card className={cn("transition-shadow hover:shadow-md", href && "cursor-pointer", className)}>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{display}</p>
        {href && (
          <p className="mt-2 flex items-center gap-1 text-xs text-primary">
            View details <ArrowUpRight className="h-3 w-3" />
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {children}
    </div>
  );
}
