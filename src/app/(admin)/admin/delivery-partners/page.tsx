"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { DeliveryPartner } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<DeliveryPartner>[] = [
  { accessorKey: "name", header: "Partner" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "vehicleType", header: "Vehicle" },
  { accessorKey: "preference", header: "Preference" },
  { accessorKey: "zoneName", header: "Zone" },
  { accessorKey: "isOnline", header: "Status", cell: ({ row }) => (
    <Badge variant={row.original.isOnline ? "success" : "secondary"}>{row.original.isOnline ? "Online" : "Offline"}</Badge>
  )},
  { accessorKey: "status", header: "Account", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "todayDeliveries", header: "Today" },
  { accessorKey: "totalDeliveries", header: "Total" },
  { accessorKey: "todayEarnings", header: "Today ₹", cell: ({ row }) => formatCurrency(row.original.todayEarnings) },
  { accessorKey: "rating", header: "Rating" },
];

export default function DeliveryPartnersPage() {
  const router = useRouter();
  const { data } = useQuery({ queryKey: ["partners"], queryFn: () => repositories.partners.getAll({ pageSize: 100 }) });
  return (
    <div>
      <Breadcrumbs items={[{ label: "Delivery Partners" }]} />
      <h1 className="mb-4 text-2xl font-bold">Delivery Partner Management</h1>
      <DataTable columns={columns} data={data?.data ?? []} onRowClick={(r) => router.push(`/admin/delivery-partners/${r.id}`)} />
    </div>
  );
}
