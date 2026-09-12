"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const severityVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  info: "default", warning: "warning", error: "destructive", success: "success",
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => repositories.dashboard.getNotifications(),
  });
  return (
    <div>
      <Breadcrumbs items={[{ label: "Notifications" }]} />
      <PageHeader title="Admin Notifications & Alerts" />
      <div className="space-y-3">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No data found.</p>
        ) : notifications.map((n) => (
          <div key={n.id} className={`rounded-lg border p-4 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={severityVariant[n.severity]}>{n.severity}</Badge>
                {!n.read && <Badge variant="outline">New</Badge>}
              </div>
              <span className="text-xs text-muted-foreground">{formatDateTime(n.timestamp)}</span>
            </div>
            <p className="mt-1 font-medium">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
