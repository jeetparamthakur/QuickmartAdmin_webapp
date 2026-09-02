"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { IndependentSeller } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { formatCurrency } from "@/lib/utils";

const columns: ColumnDef<IndependentSeller>[] = [
  { accessorKey: "name", header: "Seller Name" },
  { accessorKey: "businessName", header: "Business" },
  { accessorKey: "pickupLocation.city", header: "Location", cell: ({ row }) => row.original.pickupLocation.city },
  { accessorKey: "productsCount", header: "Products" },
  { accessorKey: "totalOrders", header: "Total Orders" },
  { accessorKey: "todayOrders", header: "Today" },
  { accessorKey: "totalSales", header: "Sales", cell: ({ row }) => formatCurrency(row.original.totalSales) },
  { accessorKey: "totalEarnings", header: "Earnings", cell: ({ row }) => formatCurrency(row.original.totalEarnings) },
  { accessorKey: "pendingPayout", header: "Pending Payout", cell: ({ row }) => formatCurrency(row.original.pendingPayout) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

export default function IndependentSellersPage() {
  const router = useRouter();
  const { data } = useQuery({ queryKey: ["sellers"], queryFn: () => repositories.sellers.getAll({ pageSize: 100 }) });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Independent Sellers" }]} />
      <h1 className="mb-4 text-2xl font-bold">Independent Seller Management</h1>
      <DataTable columns={columns} data={data?.data ?? []} onRowClick={(r) => router.push(`/admin/independent-sellers/${r.id}`)} />
    </div>
  );
}
