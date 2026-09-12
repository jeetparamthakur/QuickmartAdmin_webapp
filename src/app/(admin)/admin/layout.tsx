"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/lib/admin/navigation";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function useIsClient() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, can } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient && !user) router.replace("/login");
  }, [isClient, user, router]);

  if (!isClient || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const matchedRoute = adminNavItems.find(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );
  const requiredPermission = matchedRoute?.permission;
  const hasAccess = !requiredPermission || can(requiredPermission);

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <AdminHeader sidebarCollapsed={collapsed} />
      <main
        className={cn(
          "relative min-h-[calc(100vh-3.5rem)] p-4 transition-all duration-300 md:p-6 lg:p-8",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        {!hasAccess ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ShieldX className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="mt-2 max-w-sm text-center text-muted-foreground">
              You don&apos;t have permission to view this page.
            </p>
            <Button asChild className="mt-6">
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
