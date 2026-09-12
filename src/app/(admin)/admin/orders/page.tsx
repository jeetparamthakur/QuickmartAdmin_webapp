"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Order } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const columns: ColumnDef<Order>[] = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "customerName", header: "Customer" },
  {
    accessorKey: "storeName",
    header: "Partner",
    cell: ({ row }) => row.original.storeName ?? row.original.sellerName ?? "—",
  },
  { accessorKey: "cityName", header: "City" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.original.total),
  },
  {
    accessorKey: "createdAt",
    header: "Placed",
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: () => repositories.orders.getAll({ pageSize: 200 }),
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Orders" }]} />
      <PageHeader
        title="Orders"
        description="All orders across store owners and independent sellers on your marketplace."
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        errorMessage={isError ? "Failed to load orders. Check your connection and try again." : undefined}
        searchPlaceholder="Search orders..."
        onRowClick={(r) => router.push(`/admin/orders/${r.parentOrderId ?? r.id}`)}
      />
    </div>
  );
}
