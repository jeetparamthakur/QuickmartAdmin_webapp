"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { PageSection } from "@/components/admin/page-section";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Users, Truck, Clock, RotateCcw } from "lucide-react";

export default function FinancePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["finance"],
    queryFn: () => repositories.dashboard.getFinanceStats(),
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Finance" }]} />
        <div className="h-8 w-48 animate-pulse rounded bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Finance" }]} />
      <PageHeader
        title="Finance"
        description="Platform revenue, partner payables, and payment health across your SaaS marketplace."
      />

      <PageSection title="Key figures" description="What matters for day-to-day financial operations">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Platform Revenue"
            value={stats.platformRevenue}
            format="currency"
            icon={Wallet}
            accentClass="bg-emerald-50 text-emerald-600 ring-emerald-100"
            description="Your SaaS platform earnings"
          />
          <StatCard
            title="Seller Payables"
            value={stats.sellerPayables}
            format="currency"
            icon={Users}
            accentClass="bg-violet-50 text-violet-600 ring-violet-100"
            description="Owed to store owners & sellers"
            href="/admin/payouts"
          />
          <StatCard
            title="Delivery Payables"
            value={stats.deliveryPartnerPayables}
            format="currency"
            icon={Truck}
            accentClass="bg-amber-50 text-amber-600 ring-amber-100"
            description="Owed to delivery partners"
            href="/admin/payouts"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            format="currency"
            icon={Clock}
            accentClass="bg-orange-50 text-orange-600 ring-orange-100"
            description="Customer payments in progress"
          />
          <StatCard
            title="Refunds"
            value={stats.refunds}
            format="currency"
            icon={RotateCcw}
            accentClass="bg-rose-50 text-rose-600 ring-rose-100"
            description="Processed refunds"
          />
        </div>
      </PageSection>

      <Card className="border-border/40 bg-card/80 shadow-[var(--shadow-sm)]">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            ["Platform / handling fees", stats.platformRevenue],
            ["Commission", stats.commission],
            ["Total charge collection", stats.chargeCollection],
          ].map(([label, val]) => (
            <div
              key={String(label)}
              className="flex justify-between border-b border-border/40 py-3 text-sm last:border-0"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{formatCurrency(Number(val))}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
