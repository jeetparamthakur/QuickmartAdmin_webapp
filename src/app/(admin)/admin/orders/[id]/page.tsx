"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ORDER_FLOW = ["PLACED", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "DELIVERY_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order } = useQuery({ queryKey: ["order", id], queryFn: () => repositories.orders.getById(id) });
  const { data: assignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: async () => {
      const all = await repositories.dashboard.getAssignments();
      return all.find((a) => a.orderId === id);
    },
  });

  if (!order) return <p>Loading...</p>;

  const currentIdx = ORDER_FLOW.indexOf(order.status);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Orders", href: "/admin/orders" }, { label: order.id }]} />
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{order.id}</h1>
        <StatusBadge status={order.status} />
        {order.isParent && <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">Parent Order</span>}
      </div>

      <div className="mb-6 flex flex-wrap gap-1">
        {ORDER_FLOW.map((step, i) => (
          <div key={step} className={`rounded px-2 py-1 text-xs ${i <= currentIdx ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            {step.replace(/_/g, " ")}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>City:</strong> {order.cityName}</p>
            <p><strong>Store/Seller:</strong> {order.storeName ?? order.sellerName ?? "Multi-vendor"}</p>
            <p><strong>Partner:</strong> {order.deliveryPartnerName ?? "Not assigned"}</p>
            <p><strong>Created:</strong> {formatDateTime(order.createdAt)}</p>
            <div className="mt-2 border-t pt-2">
              <p>Subtotal: {formatCurrency(order.subtotal)}</p>
              <p>Discount: -{formatCurrency(order.discount)}</p>
              <p>Delivery: {formatCurrency(order.deliveryFee)}</p>
              <p>Platform Fee: {formatCurrency(order.platformFee)}</p>
              <p>Tax: {formatCurrency(order.tax)}</p>
              <p className="font-bold">Total: {formatCurrency(order.total)}</p>
            </div>
          </CardContent>
        </Card>

        {order.subOrders && (
          <Card>
            <CardHeader><CardTitle className="text-base">Sub Orders</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.subOrders.map((sub) => (
                <div key={sub.id} className="rounded-lg border p-3">
                  <p className="font-medium">{sub.storeName ?? sub.sellerName}</p>
                  <StatusBadge status={sub.status} />
                  <p className="text-sm">{formatCurrency(sub.subtotal)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {assignment && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Delivery Assignment</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-2 text-sm">Eligible: {assignment.eligiblePartners} · Notified: {assignment.notificationsSent} · Accepted: {assignment.acceptedBy ?? "Pending"}</p>
              <div className="space-y-2">
                {assignment.history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                    <span>{h.partnerName}</span>
                    <StatusBadge status={h.action} />
                    <span className="text-muted-foreground">{formatDateTime(h.timestamp)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
