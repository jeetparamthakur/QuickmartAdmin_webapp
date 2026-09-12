"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { IndependentSeller } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";

const columns: ColumnDef<IndependentSeller>[] = [
  { accessorKey: "name", header: "Seller" },
  { accessorKey: "businessName", header: "Business" },
  {
    accessorKey: "pickupLocation.city",
    header: "City",
    cell: ({ row }) => row.original.pickupLocation.city,
  },
  { accessorKey: "productsCount", header: "Products" },
  { accessorKey: "totalOrders", header: "Orders" },
  {
    accessorKey: "status",
    header: "Account",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function IndependentSellersPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => repositories.sellers.getAll({ pageSize: 100 }),
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Independent Sellers" }]} />
      <PageHeader
        title="Independent Sellers"
        description="Home-based sellers who list products without a physical store. They operate from a pickup location and sell through your marketplace."
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        errorMessage={isError ? "Failed to load sellers. Check your connection and try again." : undefined}
        searchPlaceholder="Search sellers..."
        onRowClick={(r) => router.push(`/admin/independent-sellers/${r.id}`)}
      />
    </div>
  );
}
