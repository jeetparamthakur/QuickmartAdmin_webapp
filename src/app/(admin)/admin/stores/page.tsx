"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Store } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<Store>[] = [
  { accessorKey: "name", header: "Store" },
  { accessorKey: "ownerName", header: "Owner" },
  { accessorKey: "address.city", header: "City", cell: ({ row }) => row.original.address.city },
  {
    accessorKey: "status",
    header: "Account",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "isOpen",
    header: "Open Now",
    cell: ({ row }) => (
      <Badge variant={row.original.isOpen ? "success" : "secondary"}>
        {row.original.isOpen ? "Open" : "Closed"}
      </Badge>
    ),
  },
  { accessorKey: "totalProducts", header: "Products" },
  { accessorKey: "totalOrders", header: "Orders" },
];

export default function StoresPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["stores"],
    queryFn: () => repositories.stores.getAll({ pageSize: 100 }),
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Store Owners" }]} />
      <PageHeader
        title="Store Owners"
        description="Merchants running physical storefronts on your platform. Each store owner can manage inventory, staff, and orders from their store app."
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        errorMessage={isError ? "Failed to load store owners. Check your connection and try again." : undefined}
        searchPlaceholder="Search stores or owners..."
        onRowClick={(row) => router.push(`/admin/stores/${row.id}`)}
      />
    </div>
  );
}
