"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Restaurant } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<Restaurant>[] = [
  { accessorKey: "name", header: "Restaurant" },
  { accessorKey: "ownerName", header: "Owner" },
  {
    accessorKey: "cuisine",
    header: "Cuisine",
    cell: ({ row }) => row.original.cuisine ?? "—",
  },
  {
    accessorKey: "address.city",
    header: "City",
    cell: ({ row }) => row.original.address.city,
  },
  {
    accessorKey: "totalMenuItems",
    header: "Menu Items",
    cell: ({ row }) => row.original.totalMenuItems,
  },
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
];

export default function RestaurantsPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => repositories.restaurants.getAll({ pageSize: 100 }),
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Restaurants" }]} />
      <PageHeader
        title="Restaurants"
        description="Food partners running restaurants on your platform. Review menus, operating hours, and order performance."
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        errorMessage={
          isError ? "Failed to load restaurants. Check your connection and try again." : undefined
        }
        searchPlaceholder="Search restaurants or owners..."
        onRowClick={(row) => router.push(`/admin/restaurants/${row.id}`)}
      />
    </div>
  );
}
