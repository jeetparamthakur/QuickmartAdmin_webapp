"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { AuditLog } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { formatDateTime } from "@/lib/utils";

const columns: ColumnDef<AuditLog>[] = [
  { accessorKey: "timestamp", header: "Time", cell: ({ row }) => formatDateTime(row.original.timestamp) },
  { accessorKey: "adminName", header: "Admin" },
  { accessorKey: "action", header: "Action" },
  { accessorKey: "entityType", header: "Entity Type" },
  { accessorKey: "entityName", header: "Entity" },
  { accessorKey: "reason", header: "Reason", cell: ({ row }) => row.original.reason ?? "-" },
];

export default function AuditLogsPage() {
  const { data } = useQuery({ queryKey: ["audit-logs"], queryFn: () => repositories.dashboard.getAuditLogs() });
  return (
    <div>
      <Breadcrumbs items={[{ label: "Audit Logs" }]} />
      <h1 className="mb-4 text-2xl font-bold">Audit Logs</h1>
      <DataTable columns={columns} data={data?.data ?? []} searchPlaceholder="Search audit logs..." />
    </div>
  );
}
