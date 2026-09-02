"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { DetailTabs } from "@/components/admin/detail-tabs";
import { StatusBadge } from "@/components/admin/status-badge";
import { FeatureToggleGrid } from "@/components/admin/rule-builder";
import { EntityActionDialog } from "@/components/admin/entity-action-dialog";
import { MapView } from "@/components/admin/map-view";
import { useAuth } from "@/lib/auth/context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, can } = useAuth();
  const qc = useQueryClient();
  const [action, setAction] = useState<{ type: string; title: string; desc: string; data: Partial<import("@/lib/types").Store> } | null>(null);

  const { data: store } = useQuery({
    queryKey: ["store", id],
    queryFn: () => repositories.stores.getById(id),
  });

  if (!store) return <p>Loading...</p>;

  const handleAction = async (reason?: string) => {
    if (!action || !user) return;
    await repositories.stores.update(id, action.data, { id: user.id, name: user.name }, action.title, reason);
    qc.invalidateQueries({ queryKey: ["store", id] });
    setAction(null);
  };

  const tabs = [
    {
      value: "basic",
      label: "Basic Info",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Store Name", store.name], ["Owner", store.ownerName], ["Phone", store.ownerPhone],
            ["Email", store.ownerEmail], ["Category", store.categoryName], ["Business Type", store.businessType],
            ["Address", `${store.address.line1}, ${store.address.city}`], ["Timings", store.timings],
            ["Registration", formatDate(store.registrationDate)], ["Status", null],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">{label === "Status" ? <StatusBadge status={store.status} /> : value}</p>
            </div>
          ))}
          <div className="col-span-full">
            <MapView center={{ lat: store.address.lat, lng: store.address.lng }} zoom={14} markers={[{
              id: store.id, lat: store.address.lat, lng: store.address.lng, label: store.name, type: "store",
            }]} height="250px" />
          </div>
        </div>
      ),
    },
    {
      value: "performance",
      label: "Performance",
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Today's Orders", store.todayOrders], ["Total Orders", store.totalOrders],
            ["Today's Sales", formatCurrency(store.todaySales)], ["Total Sales", formatCurrency(store.totalSales)],
            ["Rating", store.rating], ["Commission", `${store.commissionOverride ?? store.platformCommission}%`],
          ].map(([l, v]) => (
            <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></CardContent></Card>
          ))}
        </div>
      ),
    },
    {
      value: "financial",
      label: "Financial",
      content: (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b py-2"><span>Gross Sales</span><span>{formatCurrency(store.totalSales)}</span></div>
          <div className="flex justify-between border-b py-2"><span>Platform Commission ({store.commissionOverride ?? store.platformCommission}%)</span><span>-{formatCurrency(store.totalSales * (store.commissionOverride ?? store.platformCommission) / 100)}</span></div>
          <div className="flex justify-between py-2 font-bold"><span>Net Seller Earnings</span><span>{formatCurrency(store.totalSales * 0.88)}</span></div>
        </div>
      ),
    },
    {
      value: "controls",
      label: "Admin Controls",
      content: can("stores.manage") ? (
        <div className="flex flex-wrap gap-2">
          {[
            { type: "Activate", title: "Store Activated", desc: "Activate this store", data: { status: "ACTIVE" as const } },
            { type: "Suspend", title: "Store Suspended", desc: "Suspend this store", data: { status: "SUSPENDED" as const } },
            { type: "Disable Orders", title: "Orders Disabled", desc: "Disable orders for this store", data: {} },
          ].map((a) => (
            <Button key={a.type} variant={a.type === "Suspend" ? "destructive" : "outline"} size="sm"
              onClick={() => setAction({ type: a.type, title: a.title, desc: a.desc, data: a.data })}>
              {a.type}
            </Button>
          ))}
        </div>
      ) : <p className="text-muted-foreground">No permission</p>,
    },
    {
      value: "features",
      label: "Feature Access",
      content: (
        <FeatureToggleGrid
          features={store.features as unknown as Record<string, boolean>}
          onToggle={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Stores", href: "/admin/stores" }, { label: store.name }]} />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <StatusBadge status={store.status} />
        </div>
      </div>
      <DetailTabs tabs={tabs} />
      <EntityActionDialog
        open={!!action}
        onOpenChange={() => setAction(null)}
        title={action?.title ?? ""}
        description={action?.desc ?? ""}
        onConfirm={handleAction}
        destructive={action?.type === "Suspend"}
      />
    </div>
  );
}
