"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { DeliveryPartner } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<DeliveryPartner>[] = [
  { accessorKey: "name", header: "Partner" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "vehicleType", header: "Vehicle" },
  { accessorKey: "zoneName", header: "Zone" },
  {
    accessorKey: "isOnline",
    header: "Live",
    cell: ({ row }) => (
      <Badge variant={row.original.isOnline ? "success" : "secondary"}>
        {row.original.isOnline ? "Online" : "Offline"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Account",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: "todayDeliveries", header: "Today" },
  { accessorKey: "totalDeliveries", header: "Total" },
];

export default function DeliveryPartnersPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["partners"],
    queryFn: () => repositories.partners.getAll({ pageSize: 100 }),
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Delivery Partners" }]} />
      <PageHeader
        title="Delivery Partners"
        description="Fleet partners who fulfill last-mile delivery for orders from store owners and independent sellers."
      />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        errorMessage={
          isError ? "Failed to load delivery partners. Check your connection and try again." : undefined
        }
        searchPlaceholder="Search delivery partners..."
        onRowClick={(r) => router.push(`/admin/delivery-partners/${r.id}`)}
      />
    </div>
  );
}
