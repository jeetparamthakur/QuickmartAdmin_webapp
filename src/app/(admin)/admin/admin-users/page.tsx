"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { ROLE_LABELS } from "@/lib/permissions/matrix";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import type { AdminUser } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";

const columns: ColumnDef<AdminUser>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role", cell: ({ row }) => ROLE_LABELS[row.original.role] },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "lastLogin", header: "Last Login", cell: ({ row }) => row.original.lastLogin ? formatDateTime(row.original.lastLogin) : "-" },
];

export default function AdminUsersPage() {
  const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: () => repositories.dashboard.getAdminUsers() });
  return (
    <div>
      <Breadcrumbs items={[{ label: "Admin Users" }]} />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Users</h1>
        <Button asChild variant="outline"><Link href="/admin/admin-users/roles">Roles & Permissions</Link></Button>
      </div>
      <DataTable columns={columns} data={users ?? []} />
    </div>
  );
}
