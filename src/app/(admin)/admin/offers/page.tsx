"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function OffersPage() {
  const { data: coupons } = useQuery({ queryKey: ["coupons"], queryFn: () => repositories.dashboard.getCoupons() });
  return (
    <div>
      <Breadcrumbs items={[{ label: "Offers & Coupons" }]} />
      <h1 className="mb-4 text-2xl font-bold">Offers & Coupons</h1>
      <div className="space-y-3">
        {coupons?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-mono font-bold">{c.code}</p>
              <Badge variant="outline">{c.type}</Badge>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.type === "PERCENTAGE" ? `${c.value}% off` : c.type === "FLAT" ? `₹${c.value} off` : c.type.replace(/_/g, " ")}
                {" · "}Min cart ₹{c.minCart} · Used {c.usedCount}/{c.usageLimit}
              </p>
            </div>
            <Switch checked={c.enabled} />
          </div>
        ))}
      </div>
    </div>
  );
}
