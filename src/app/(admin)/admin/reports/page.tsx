"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { ExportButton } from "@/components/admin/export-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const { data: orders } = useQuery({ queryKey: ["orders-report"], queryFn: () => repositories.orders.getAll({ pageSize: 500 }) });
  const { data: stores } = useQuery({ queryKey: ["stores-report"], queryFn: () => repositories.stores.getAll({ pageSize: 100 }) });
  const { data: payouts } = useQuery({ queryKey: ["payouts-report"], queryFn: () => repositories.payouts.getAll({ pageSize: 100 }) });

  const salesReport = (orders?.data ?? []).map((o) => ({
    orderId: o.id, customer: o.customerName, store: o.storeName ?? o.sellerName ?? "Multi",
    city: o.cityName, status: o.status, total: o.total, date: formatDate(o.createdAt),
  }));

  const storeReport = (stores?.data ?? []).map((s) => ({
    store: s.name, owner: s.ownerName, city: s.address.city, orders: s.totalOrders,
    sales: s.totalSales, rating: s.rating, status: s.status,
  }));

  const payoutReport = (payouts?.data ?? []).map((p) => ({
    id: p.id, type: p.type, recipient: p.recipientName, gross: p.grossSales,
    net: p.netPayable, status: p.status, date: formatDate(p.createdAt),
  }));

  const reports = [
    { title: "Sales Report", data: salesReport, filename: "sales-report" },
    { title: "Store Report", data: storeReport, filename: "store-report" },
    { title: "Payout Report", data: payoutReport, filename: "payout-report" },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Reports" }]} />
      <h1 className="mb-4 text-2xl font-bold">Reports & Data Export</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardHeader><CardTitle className="text-base">{r.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">{r.data.length} records</p>
              <div className="flex flex-wrap gap-2">
                <ExportButton data={r.data} filename={r.filename} format="csv" />
                <ExportButton data={r.data} filename={r.filename} format="excel" />
                <ExportButton data={r.data} filename={r.filename} format="pdf" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
