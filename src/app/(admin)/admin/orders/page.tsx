"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Order } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const columns: ColumnDef<Order>[] = [
  { accessorKey: "id", header: "Order ID" },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "storeName", header: "Store", cell: ({ row }) => row.original.storeName ?? row.original.sellerName ?? "-" },
  { accessorKey: "cityName", header: "City" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} /> },
  { accessorKey: "total", header: "Total", cell: ({ row }) => formatCurrency(row.original.total) },
  { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDateTime(row.original.createdAt) },
];

export default function OrdersPage() {
  const router = useRouter();
  const { data } = useQuery({ queryKey: ["orders"], queryFn: () => repositories.orders.getAll({ pageSize: 200 }) });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Orders" }]} />
      <h1 className="mb-4 text-2xl font-bold">Order Management</h1>
      <DataTable columns={columns} data={data?.data ?? []} searchPlaceholder="Search orders..." onRowClick={(r) => router.push(`/admin/orders/${r.id}`)} />
    </div>
  );
}
