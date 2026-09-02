"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CommissionPage() {
  const { data: commissions } = useQuery({ queryKey: ["commissions"], queryFn: () => repositories.dashboard.getCommissions() });
  const global = commissions?.find((c) => c.scope === "GLOBAL");

  return (
    <div>
      <Breadcrumbs items={[{ label: "Commission" }]} />
      <h1 className="mb-4 text-2xl font-bold">Commission Management</h1>
      {global && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Default Global Commission</p>
            <p className="text-3xl font-bold">{global.rate}%</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {commissions?.filter((c) => c.scope !== "GLOBAL").map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{c.targetName ?? c.scope}</p>
              <Badge variant="outline">{c.scope}</Badge>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{c.rate}%</p>
              <p className="text-xs text-muted-foreground">From {c.effectiveFrom}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
