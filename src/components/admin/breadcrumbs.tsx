import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-5 flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/admin"
        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-border" />
          {item.href ? (
            <Link
              href={item.href}
              className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="rounded-md px-1.5 py-0.5 font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
