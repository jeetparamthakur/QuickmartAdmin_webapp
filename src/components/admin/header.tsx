"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/context";
import { ROLE_LABELS } from "@/lib/permissions/matrix";
import { GlobalSearch } from "@/components/admin/global-search";
import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { cn } from "@/lib/utils";

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export function AdminHeader({ sidebarCollapsed }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => repositories.dashboard.getNotifications(),
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-card/80 px-4 backdrop-blur-md transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1.5">
        <Link href="/admin/notifications">
          <Button variant="ghost" size="icon" className="relative rounded-lg">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </Link>
        {user && (
          <>
            <div className="hidden items-center gap-2.5 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <Badge variant="secondary" className="mt-0.5 h-4 px-1.5 text-[10px] font-normal">
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg text-muted-foreground hover:text-destructive"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
