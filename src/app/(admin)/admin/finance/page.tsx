"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { StatCard, MetricGrid } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function FinancePage() {
  const { data: stats } = useQuery({ queryKey: ["finance"], queryFn: () => repositories.dashboard.getFinanceStats() });
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Finance" }]} />
      <h1 className="mb-4 text-2xl font-bold">Financial Control Center</h1>
      <MetricGrid>
        <StatCard title="Customer Payments" value={stats.totalCustomerPayments} format="currency" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} format="currency" />
        <StatCard title="Successful Payments" value={stats.successfulPayments} format="currency" />
        <StatCard title="Failed Payments" value={stats.failedPayments} format="currency" />
        <StatCard title="Refunds" value={stats.refunds} format="currency" />
        <StatCard title="Seller Payables" value={stats.sellerPayables} format="currency" />
        <StatCard title="Partner Payables" value={stats.deliveryPartnerPayables} format="currency" />
        <StatCard title="Platform Revenue" value={stats.platformRevenue} format="currency" />
        <StatCard title="Commission" value={stats.commission} format="currency" />
        <StatCard title="Taxes" value={stats.taxes} format="currency" />
        <StatCard title="Charge Collection" value={stats.chargeCollection} format="currency" />
      </MetricGrid>
      <Card className="mt-6">
        <CardHeader><CardTitle>Revenue Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            ["Platform Fees", stats.platformRevenue],
            ["Commission Revenue", stats.commission],
            ["Delivery Revenue", stats.chargeCollection * 0.6],
            ["Other Charges", stats.chargeCollection * 0.4],
          ].map(([label, val]) => (
            <div key={String(label)} className="flex justify-between border-b py-2 text-sm">
              <span>{label}</span><span className="font-medium">{formatCurrency(Number(val))}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
