"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { repositories } from "@/lib/repositories";
import { StatCard, MetricGrid } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";
import type { PlatformEvent } from "@/lib/types";
import { mockEventBus } from "@/lib/events/mock-event-bus";
import { MapView, type MapMarker } from "@/components/admin/map-view";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "lucide-react";

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => repositories.dashboard.getStats() });
  const { data: events = [], refetch } = useQuery({ queryKey: ["events"], queryFn: () => repositories.dashboard.getEvents() });
  const { data: stores } = useQuery({ queryKey: ["stores-all"], queryFn: () => repositories.stores.getAll({ pageSize: 100 }) });
  const { data: cities } = useQuery({ queryKey: ["cities"], queryFn: () => repositories.dashboard.getCities() });
  const [liveEvents, setLiveEvents] = useState<PlatformEvent[]>([]);
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    mockEventBus?.start();
    const unsub = mockEventBus?.subscribe((event) => {
      setLiveEvents((prev) => [event, ...prev.slice(0, 19)]);
      refetch();
    });
    return () => {
      unsub?.();
      mockEventBus?.stop();
    };
  }, [refetch]);

  const displayEvents = liveEvents.length > 0 ? liveEvents : events;

  const mapMarkers: MapMarker[] = (stores?.data ?? [])
    .filter((s) => cityFilter === "all" || s.address.city === cityFilter)
    .slice(0, 40)
    .map((s) => ({
      id: s.id,
      lat: s.address.lat,
      lng: s.address.lng,
      label: s.name,
      type: "store" as const,
      popup: (
        <div className="text-sm">
          <p className="font-semibold">{s.name}</p>
          <p>{s.address.city}</p>
          <p>Orders today: {s.todayOrders}</p>
        </div>
      ),
    }));

  const center = cities?.[0] ? { lat: cities[0].lat, lng: cities[0].lng } : { lat: 30.901, lng: 75.8573 };

  if (!stats) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">Real-time command center for your marketplace</p>
      </div>

      <MetricGrid>
        <StatCard title="Total Customers" value={stats.totalCustomers} href="/admin/customers" />
        <StatCard title="Active Customers" value={stats.activeCustomers} href="/admin/customers?status=ACTIVE" />
        <StatCard title="Total Sellers" value={stats.totalSellers} href="/admin/stores" />
        <StatCard title="Active Sellers" value={stats.activeSellers} href="/admin/stores?status=ACTIVE" />
        <StatCard title="Suspended Sellers" value={stats.suspendedSellers} href="/admin/stores?status=SUSPENDED" />
        <StatCard title="Total Stores" value={stats.totalStores} href="/admin/stores" />
        <StatCard title="Active Stores" value={stats.activeStores} href="/admin/stores?status=ACTIVE" />
        <StatCard title="Closed Stores" value={stats.closedStores} href="/admin/stores" />
        <StatCard title="Independent Sellers" value={stats.totalIndependentSellers} href="/admin/independent-sellers" />
        <StatCard title="Delivery Partners" value={stats.totalDeliveryPartners} href="/admin/delivery-partners" />
        <StatCard title="Online Partners" value={stats.onlineDeliveryPartners} href="/admin/delivery-partners?status=online" />
        <StatCard title="Offline Partners" value={stats.offlineDeliveryPartners} href="/admin/delivery-partners?status=offline" />
        <StatCard title="Active Partners" value={stats.activeDeliveryPartners} href="/admin/delivery-partners?status=ACTIVE" />
        <StatCard title="Total Orders" value={stats.totalOrders} href="/admin/orders" />
        <StatCard title="Today's Orders" value={stats.todayOrders} href="/admin/orders" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} href="/admin/orders?status=PLACED" />
        <StatCard title="Completed Orders" value={stats.completedOrders} href="/admin/orders?status=DELIVERED" />
        <StatCard title="Cancelled Orders" value={stats.cancelledOrders} href="/admin/orders?status=CANCELLED" />
        <StatCard title="Failed Orders" value={stats.failedOrders} href="/admin/orders?status=FAILED" />
        <StatCard title="Total GMV" value={stats.totalGMV} format="currency" href="/admin/analytics" />
        <StatCard title="Today's GMV" value={stats.todayGMV} format="currency" href="/admin/analytics" />
        <StatCard title="Platform Revenue" value={stats.totalPlatformRevenue} format="currency" href="/admin/finance" />
        <StatCard title="Today's Revenue" value={stats.todayPlatformRevenue} format="currency" href="/admin/finance" />
        <StatCard title="Seller Earnings" value={stats.totalSellerEarnings} format="currency" href="/admin/payouts" />
        <StatCard title="Partner Earnings" value={stats.totalDeliveryPartnerEarnings} format="currency" href="/admin/payouts" />
      </MetricGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Live Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {displayEvents.map((event) => (
                <div key={event.id} className="flex gap-3 border-b pb-2 last:border-0">
                  <span className="shrink-0 text-xs text-muted-foreground">{formatTime(event.timestamp)}</span>
                  <div>
                    <p className="text-sm font-medium">{event.message}</p>
                    {event.entityId && <p className="text-xs text-muted-foreground">{event.entityId}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Geographic Overview</CardTitle>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities?.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <MapView center={center} zoom={11} markers={mapMarkers} height="320px" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
