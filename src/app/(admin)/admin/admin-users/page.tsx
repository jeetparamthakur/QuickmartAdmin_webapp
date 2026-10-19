"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { PageHeader } from "@/components/admin/page-header";
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
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => repositories.dashboard.getAdminUsers(),
  });
  return (
    <div>
      <PageHeader
        breadcrumbItems={[{ label: "Admin Users" }]}
        title="Admin Users"
        description="Manage platform administrators and access"
      >
        <Button asChild variant="outline">
          <Link href="/admin/admin-users/roles">Roles & Permissions</Link>
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={users ?? []} isLoading={isLoading} />
    </div>
  );
}
