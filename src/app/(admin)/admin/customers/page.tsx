"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Customer } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { formatCurrency, formatDate, maskEmail, maskPhone } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

const columns = (canViewPii: boolean): ColumnDef<Customer>[] => [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "mobile", header: "Mobile", cell: ({ row }) => canViewPii ? row.original.mobile : maskPhone(row.original.mobile) },
  { accessorKey: "email", header: "Email", cell: ({ row }) => canViewPii ? row.original.email : maskEmail(row.original.email) },
  { accessorKey: "registrationDate", header: "Registered", cell: ({ row }) => formatDate(row.original.registrationDate) },
  { accessorKey: "totalOrders", header: "Orders" },
  { accessorKey: "completedOrders", header: "Completed" },
  { accessorKey: "cancelledOrders", header: "Cancelled" },
  { accessorKey: "totalSpending", header: "Spending", cell: ({ row }) => formatCurrency(row.original.totalSpending) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

export default function CustomersPage() {
  const router = useRouter();
  const { can } = useAuth();
  const { data } = useQuery({ queryKey: ["customers"], queryFn: () => repositories.customers.getAll({ pageSize: 100 }) });
  const { data: cartAnalytics } = useQuery({ queryKey: ["cart-analytics"], queryFn: () => repositories.dashboard.getCartAnalytics() });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Customers" }]} />
      <h1 className="mb-4 text-2xl font-bold">Customer Management</h1>
      {cartAnalytics && (
        <div className="mb-6 grid gap-3 sm:grid-cols-5">
          {[["Active Carts", cartAnalytics.activeCarts], ["Abandoned", cartAnalytics.abandonedCarts], ["Avg Cart Value", `₹${cartAnalytics.averageCartValue}`], ["Conversion", `${cartAnalytics.conversionRate}%`], ["Drop Rate", `${cartAnalytics.cartDropRate}%`]].map(([l,v]) => (
            <div key={String(l)} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="text-lg font-bold">{v}</p></div>
          ))}
        </div>
      )}
      <DataTable columns={columns(can("customers.view_pii"))} data={data?.data ?? []} onRowClick={(r) => router.push(`/admin/customers/${r.id}`)} />
    </div>
  );
}
