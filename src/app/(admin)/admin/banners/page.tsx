"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function BannersPage() {
  const { data: banners } = useQuery({ queryKey: ["banners"], queryFn: () => repositories.dashboard.getBanners() });
  return (
    <div>
      <Breadcrumbs items={[{ label: "Banners" }]} />
      <h1 className="mb-4 text-2xl font-bold">Banner Management</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {banners?.map((b) => (
          <div key={b.id} className="rounded-lg border p-4">
            <div className="mb-3 flex h-24 items-center justify-center rounded bg-muted text-muted-foreground">{b.title}</div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{b.title}</p>
                <Badge variant="outline">{b.position}</Badge>
                <p className="mt-1 text-xs text-muted-foreground">{b.startDate} – {b.endDate}</p>
                <p className="text-xs">Impressions: {b.impressions.toLocaleString()} · Clicks: {b.clicks.toLocaleString()} · CTR: {((b.clicks / b.impressions) * 100).toFixed(1)}%</p>
              </div>
              <Switch checked={b.enabled} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
