"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Customer } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { formatCurrency, formatDate, maskEmail, maskPhone } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

const columns = (canViewPii: boolean): ColumnDef<Customer>[] => [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => (canViewPii ? row.original.mobile : maskPhone(row.original.mobile)),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (canViewPii ? row.original.email : maskEmail(row.original.email)),
  },
  {
    accessorKey: "registrationDate",
    header: "Joined",
    cell: ({ row }) => formatDate(row.original.registrationDate),
  },
  { accessorKey: "totalOrders", header: "Orders" },
  {
    accessorKey: "totalSpending",
    header: "Spent",
    cell: ({ row }) => formatCurrency(row.original.totalSpending),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const { can } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: () => repositories.customers.getAll({ pageSize: 100 }),
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Customers" }]} />
      <PageHeader
        title="Customers"
        description="End-customers who shop from store owners and independent sellers on your platform."
      />
      <DataTable
        columns={columns(can("customers.view_pii"))}
        data={data?.data ?? []}
        isLoading={isLoading}
        errorMessage={isError ? "Failed to load customers. Check your connection and try again." : undefined}
        searchPlaceholder="Search customers..."
        onRowClick={(row) => router.push(`/admin/customers/${row.id}`)}
      />
    </div>
  );
}
