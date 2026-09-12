"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#15803d", "#16a34a", "#d97706", "#dc2626", "#0891b2"];

export default function AnalyticsPage() {
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => repositories.dashboard.getStats() });
  const { data: cities } = useQuery({ queryKey: ["cities"], queryFn: () => repositories.dashboard.getCities() });
  const { data: stores } = useQuery({ queryKey: ["stores-analytics"], queryFn: () => repositories.stores.getAll({ pageSize: 20 }) });
  const [drillCity, setDrillCity] = useState<string | null>(null);

  const cityData = cities?.map((c, i) => ({
    name: c.name,
    sales: Math.round((stats?.todayGMV ?? 0) / (cities?.length ?? 1) * (1 + i * 0.2)),
    orders: Math.round((stats?.todayOrders ?? 0) / (cities?.length ?? 1)),
  })) ?? [];

  const hourlyData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    orders: Math.round((h >= 11 && h <= 14 ? 45 : h >= 19 && h <= 22 ? 65 : 15) + (h % 5) * 8),
  }));

  const categoryData = [
    { name: "Grocery", value: 35 }, { name: "Restaurant", value: 25 },
    { name: "Pharmacy", value: 15 }, { name: "Electronics", value: 12 }, { name: "Other", value: 13 },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Analytics" }]} />
      <PageHeader title="Analytics & Drill-Down" />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[["Today's GMV", formatCurrency(stats?.todayGMV ?? 0)], ["Today's Orders", stats?.todayOrders ?? 0], ["Total GMV", formatCurrency(stats?.totalGMV ?? 0)], ["Total Orders", stats?.totalOrders ?? 0]].map(([l, v]) => (
          <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="platform">
        <TabsList>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="customer">Customer App</TabsTrigger>
          <TabsTrigger value="seller">Seller App</TabsTrigger>
          <TabsTrigger value="delivery">Delivery App</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Sales by City (click to drill down)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="sales" fill="#15803d" cursor="pointer" onClick={(d) => setDrillCity(String(d.name))} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Orders by Hour</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" fontSize={10} interval={3} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#059669" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Orders by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {drillCity && (
            <Card>
              <CardHeader><CardTitle className="text-base">Stores in {drillCity}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(stores?.data ?? []).filter((s) => s.address.city === drillCity).slice(0, 10).map((s) => (
                  <Link key={s.id} href={`/admin/stores/${s.id}`} className="flex justify-between rounded border p-2 text-sm hover:bg-muted">
                    <span>{s.name}</span>
                    <span>{formatCurrency(s.todaySales)}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customer">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["New Users", 45], ["Active Users", 1280], ["Searches", 3420], ["Product Views", 8900], ["Cart Created", 890], ["Orders Placed", 312], ["Conversion Rate", "35.1%"]].map(([l,v]) => (
              <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seller">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["New Registrations", 8], ["Pending Verification", 12], ["Active Sellers", 95], ["Product Uploads", 156], ["Order Acceptance", "92%"], ["Avg Prep Time", "18 min"]].map(([l,v]) => (
              <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="delivery">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Online Partners", stats?.onlineDeliveryPartners ?? 0], ["Active Deliveries", 45], ["Avg Acceptance", "2.3 min"], ["Avg Pickup", "8 min"], ["Avg Delivery", "22 min"], ["Success Rate", "96.5%"]].map(([l,v]) => (
              <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></CardContent></Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
