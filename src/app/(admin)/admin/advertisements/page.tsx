"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function AdvertisementsPage() {
  const { data: ads } = useQuery({ queryKey: ["ads"], queryFn: () => repositories.dashboard.getAds() });
  return (
    <div>
      <Breadcrumbs items={[{ label: "Advertisements" }]} />
      <h1 className="mb-4 text-2xl font-bold">Advertisement Control Center</h1>
      <div className="space-y-3">
        {ads?.map((ad) => (
          <div key={ad.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{ad.name}</p>
              <p className="text-sm text-muted-foreground">{ad.advertiser} · {ad.campaign}</p>
              <div className="mt-1 flex gap-1">
                <Badge variant="outline">{ad.placement}</Badge>
                <Badge variant="outline">{ad.targetLocation}</Badge>
              </div>
              <p className="mt-1 text-xs">Budget: {formatCurrency(ad.budget)} · Spent: {formatCurrency(ad.spent)} · Impressions: {ad.impressions.toLocaleString()} · Clicks: {ad.clicks.toLocaleString()} · Conversions: {ad.conversions}</p>
            </div>
            <Switch checked={ad.enabled} />
          </div>
        ))}
      </div>
    </div>
  );
}
