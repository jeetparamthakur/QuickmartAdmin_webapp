"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/context";
import { ROLE_LABELS } from "@/lib/permissions/matrix";
import { GlobalSearch } from "@/components/admin/global-search";
import { seedData } from "@/lib/mock/seed";

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export function AdminHeader({ sidebarCollapsed }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const unreadCount = seedData.notifications.filter((n) => !n.read).length;

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ marginLeft: sidebarCollapsed ? 64 : 256 }}
    >
      <div className="flex flex-1 items-center gap-4">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <Link href="/admin/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </Link>
        {user && (
          <>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {ROLE_LABELS[user.role]}
            </Badge>
            <div className="hidden items-center gap-2 md:flex">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
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
