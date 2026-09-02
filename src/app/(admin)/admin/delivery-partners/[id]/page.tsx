"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { StatusBadge } from "@/components/admin/status-badge";
import { FeatureToggleGrid } from "@/components/admin/rule-builder";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: partner } = useQuery({ queryKey: ["partner", id], queryFn: () => repositories.partners.getById(id) });
  if (!partner) return <p>Loading...</p>;
  return (
    <div>
      <Breadcrumbs items={[{ label: "Delivery Partners", href: "/admin/delivery-partners" }, { label: partner.name }]} />
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-2xl font-bold">{partner.name}</h1>
        <StatusBadge status={partner.status} />
        <Badge variant={partner.isOnline ? "success" : "secondary"}>{partner.isOnline ? "Online" : "Offline"}</Badge>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[["Vehicle", partner.vehicleType], ["Preference", partner.preference], ["Zone", partner.zoneName], ["Today Deliveries", partner.todayDeliveries], ["Total Deliveries", partner.totalDeliveries], ["Total Earnings", formatCurrency(partner.totalEarnings)]].map(([l,v]) => (
          <div key={String(l)} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v}</p></div>
        ))}
      </div>
      <h3 className="mb-2 font-semibold">Feature Access</h3>
      <FeatureToggleGrid features={partner.features as unknown as Record<string, boolean>} onToggle={() => {}} />
    </div>
  );
}
