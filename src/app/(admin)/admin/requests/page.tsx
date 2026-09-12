"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { PartnerRequest, PartnerRequestPartnerType } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { formatDateTime } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const PARTNER_TYPE_LABELS: Record<string, string> = {
  STORE: "Store Owner",
  INDEPENDENT_SELLER: "Independent Seller",
  DELIVERY_PARTNER: "Delivery Partner",
};

const columns: ColumnDef<PartnerRequest>[] = [
  { accessorKey: "name", header: "Applicant" },
  {
    accessorKey: "partnerType",
    header: "Type",
    cell: ({ row }) => PARTNER_TYPE_LABELS[row.original.partnerType] ?? row.original.partnerType,
  },
  { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "-" },
  {
    accessorKey: "documentCount",
    header: "Documents",
    cell: ({ row }) => row.original.documentCount ?? row.original.documents?.length ?? 0,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => formatDateTime(row.original.submittedAt ?? row.original.createdAt),
  },
];

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

const TYPE_FILTERS: Array<{ value: "all" | PartnerRequestPartnerType; label: string }> = [
  { value: "all", label: "All Types" },
  { value: "STORE", label: "Store Owners" },
  { value: "INDEPENDENT_SELLER", label: "Independent Sellers" },
  { value: "DELIVERY_PARTNER", label: "Delivery Partners" },
];

export default function RequestsPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<"all" | PartnerRequestPartnerType>("all");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["requests"],
    queryFn: () => repositories.requests.getAll({ pageSize: 500 }),
  });
  const requests = useMemo(() => data?.data ?? [], [data?.data]);

  const filteredByType = useMemo(
    () =>
      typeFilter === "all"
        ? requests
        : requests.filter((r) => r.partnerType === typeFilter),
    [requests, typeFilter],
  );

  const filterByStatus = (status?: string) =>
    status ? filteredByType.filter((r) => r.status === status) : filteredByType;

  const pendingCount = requests.filter(
    (r) => r.status === "pending" || r.status === "under_review",
  ).length;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Applications" }]} />
      <PageHeader
        title="Partner Applications"
        description={`Review onboarding for store owners, independent sellers, and delivery partners. ${pendingCount} awaiting review.`}
      >
        <div className="flex flex-wrap gap-1">
          {TYPE_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              size="sm"
              variant={typeFilter === filter.value ? "default" : "outline"}
              onClick={() => setTypeFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </PageHeader>

      <Tabs defaultValue="all">
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tab.value !== "all" && ` (${filterByStatus(tab.value).length})`}
            </TabsTrigger>
          ))}
        </TabsList>
        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <DataTable
              columns={columns}
              data={filterByStatus(tab.value === "all" ? undefined : tab.value)}
              isLoading={isLoading}
              errorMessage={
                isError
                  ? "Failed to load requests. Check your connection and try again."
                  : undefined
              }
              onRowClick={(r) => router.push(`/admin/requests/${r.userId}`)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
