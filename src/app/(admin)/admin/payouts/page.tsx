"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Payout } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const columns = (onAction: (id: string, status: string) => void, canApprove: boolean): ColumnDef<Payout>[] => [
  { accessorKey: "id", header: "Payout ID" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "recipientName", header: "Recipient" },
  { accessorKey: "grossSales", header: "Gross", cell: ({ row }) => formatCurrency(row.original.grossSales) },
  { accessorKey: "commission", header: "Commission", cell: ({ row }) => formatCurrency(row.original.commission) },
  { accessorKey: "netPayable", header: "Net Payable", cell: ({ row }) => formatCurrency(row.original.netPayable) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.original.createdAt) },
  ...(canApprove ? [{
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Payout } }) => row.original.status === "PENDING" ? (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAction(row.original.id, "APPROVED"); }}>Approve</Button>
        <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onAction(row.original.id, "HELD"); }}>Hold</Button>
      </div>
    ) : null,
  }] : []),
];

export default function PayoutsPage() {
  const { user, can } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["payouts"],
    queryFn: () => repositories.payouts.getAll({ pageSize: 100 }),
  });
  const payouts = data?.data ?? [];

  const handleAction = async (id: string, status: string) => {
    if (!user) return;
    await repositories.payouts.update(id, status, { id: user.id, name: user.name });
    qc.invalidateQueries({ queryKey: ["payouts"] });
    toast.success(`Payout ${status.toLowerCase()}`);
  };

  const sellerPayouts = payouts.filter((p) => p.type === "SELLER");
  const partnerPayouts = payouts.filter((p) => p.type === "DELIVERY_PARTNER");

  return (
    <div>
      <Breadcrumbs items={[{ label: "Payouts" }]} />
      <PageHeader
        title="Payouts"
        description="Release earnings to store owners, independent sellers, and delivery partners on your platform."
      />
      <Tabs defaultValue="seller">
        <TabsList>
          <TabsTrigger value="seller">Store Owners & Sellers ({sellerPayouts.length})</TabsTrigger>
          <TabsTrigger value="partner">Delivery Partners ({partnerPayouts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="seller">
          <DataTable
            columns={columns(handleAction, can("finance.approve_payout"))}
            data={sellerPayouts}
            isLoading={isLoading}
            errorMessage={isError ? "Failed to load payouts. Check your connection and try again." : undefined}
          />
        </TabsContent>
        <TabsContent value="partner">
          <DataTable
            columns={columns(handleAction, can("finance.approve_payout"))}
            data={partnerPayouts}
            isLoading={isLoading}
            errorMessage={isError ? "Failed to load payouts. Check your connection and try again." : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
