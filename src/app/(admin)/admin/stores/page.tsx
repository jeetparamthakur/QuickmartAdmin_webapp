"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Store } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<Store>[] = [
  { accessorKey: "name", header: "Store Name" },
  { accessorKey: "ownerName", header: "Owner" },
  { accessorKey: "categoryName", header: "Category" },
  { accessorKey: "address.city", header: "City", cell: ({ row }) => row.original.address.city },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "isOpen", header: "Open", cell: ({ row }) => (
    <Badge variant={row.original.isOpen ? "success" : "secondary"}>{row.original.isOpen ? "Open" : "Closed"}</Badge>
  )},
  { accessorKey: "totalProducts", header: "Products" },
  { accessorKey: "todayOrders", header: "Today Orders" },
  { accessorKey: "totalOrders", header: "Total Orders" },
  { accessorKey: "todaySales", header: "Today Sales", cell: ({ row }) => formatCurrency(row.original.todaySales) },
  { accessorKey: "totalSales", header: "Total Sales", cell: ({ row }) => formatCurrency(row.original.totalSales) },
  { accessorKey: "rating", header: "Rating" },
  { accessorKey: "registrationDate", header: "Registered", cell: ({ row }) => formatDate(row.original.registrationDate) },
];

export default function StoresPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: () => repositories.stores.getAll({ pageSize: 100 }),
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Stores" }]} />
      <h1 className="mb-4 text-2xl font-bold">Store Management</h1>
      {isLoading ? <p>Loading...</p> : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          searchPlaceholder="Search stores..."
          onRowClick={(row) => router.push(`/admin/stores/${row.id}`)}
        />
      )}
    </div>
  );
}
