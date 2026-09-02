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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Check route permission
  const matchedRoute = adminNavItems.find(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );
  const requiredPermission = matchedRoute?.permission;
  const hasAccess = !requiredPermission || can(requiredPermission);

  // Special case for roles sub-route
  const rolesAccess = pathname.includes("/admin-users/roles") ? can("admin.roles") : true;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <AdminHeader sidebarCollapsed={collapsed} />
      <main
        className={cn("min-h-[calc(100vh-3.5rem)] p-4 transition-all duration-300 md:p-6", collapsed ? "ml-16" : "ml-64")}
      >
        {!hasAccess || !rolesAccess ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShieldX className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="mt-2 text-muted-foreground">You don&apos;t have permission to view this page.</p>
            <Button asChild className="mt-4">
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
