"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { OrderItemsTable } from "@/components/admin/order-items-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/lib/types";

const ORDER_FLOW = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "DELIVERY_ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: () => repositories.orders.getById(id),
  });
  const { data: productsData } = useQuery({
    queryKey: ["products-catalog"],
    queryFn: () => repositories.products.getAll({ pageSize: 1000 }),
  });
  const { data: assignment } = useQuery({
    queryKey: ["assignment", id],
    queryFn: async () => {
      const all = await repositories.dashboard.getAssignments();
      return all.find((a) => a.orderId === id);
    },
  });

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of productsData?.data ?? []) {
      map.set(product.id, product);
    }
    return map;
  }, [productsData?.data]);

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
      </div>
    );
  }

  const currentIdx = ORDER_FLOW.indexOf(order.status);
  const hasSubOrders = Boolean(order.subOrders && order.subOrders.length > 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Orders", href: "/admin/orders" }, { label: order.id }]} />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{order.id}</h1>
        <StatusBadge status={order.status} />
        <StatusBadge status={order.paymentStatus} />
        {order.isParent && (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Parent Order
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {ORDER_FLOW.map((step, i) => (
          <div
            key={step}
            className={`rounded-md px-2 py-1 text-xs ${
              i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {step.replace(/_/g, " ")}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>City:</strong> {order.cityName}</p>
            <p><strong>Store/Seller:</strong> {order.storeName ?? order.sellerName ?? "Multi-vendor"}</p>
            <p><strong>Partner:</strong> {order.deliveryPartnerName ?? "Not assigned"}</p>
            <p><strong>Created:</strong> {formatDateTime(order.createdAt)}</p>
            <p><strong>Updated:</strong> {formatDateTime(order.updatedAt)}</p>
            <div className="mt-2 space-y-1 border-t pt-3">
              <p>Subtotal: {formatCurrency(order.subtotal)}</p>
              <p>Discount: -{formatCurrency(order.discount)}</p>
              <p>Delivery: {formatCurrency(order.deliveryFee)}</p>
              {order.chargeBreakdown?.length ? (
                order.chargeBreakdown.map((charge) => (
                  <p key={charge.code}>{charge.name}: {formatCurrency(charge.amount)}</p>
                ))
              ) : (
                <p>Platform Fee: {formatCurrency(order.platformFee)}</p>
              )}
              <p>Tax: {formatCurrency(order.tax)}</p>
              <p className="pt-1 text-base font-bold">Total: {formatCurrency(order.total)}</p>
            </div>
          </CardContent>
        </Card>

        {hasSubOrders && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sub Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.subOrders!.map((sub) => (
                <div key={sub.id} className="rounded-lg border border-border/60 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium">{sub.storeName ?? sub.sellerName}</p>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {sub.items.length} item{sub.items.length === 1 ? "" : "s"} · {formatCurrency(sub.subtotal)}
                  </p>
                  <OrderItemsTable items={sub.items} productsById={productsById} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {!hasSubOrders && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderItemsTable items={order.items} productsById={productsById} />
          </CardContent>
        </Card>
      )}

      {assignment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm">
              Eligible: {assignment.eligiblePartners} · Notified: {assignment.notificationsSent} · Accepted:{" "}
              {assignment.acceptedBy ?? "Pending"}
            </p>
            <div className="space-y-2">
              {assignment.history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
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
  );
}
