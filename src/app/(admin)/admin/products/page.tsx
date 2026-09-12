"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { repositories } from "@/lib/repositories";
import type { Product } from "@/lib/types";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Product" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "categoryName", header: "Category" },
  {
    accessorKey: "storeName",
    header: "Partner",
    cell: ({ row }) => row.original.storeName ?? row.original.sellerName ?? "—",
  },
  { accessorKey: "price", header: "Price", cell: ({ row }) => formatCurrency(row.original.price) },
  { accessorKey: "stock", header: "Stock" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

export default function ProductsPage() {
  const router = useRouter();
  const { data: all, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: () => repositories.products.getAll({ pageSize: 500 }),
  });
  const products = all?.data ?? [];

  const filterByStatus = (status?: string) => status ? products.filter((p) => p.status === status) : products;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Products" }]} />
      <PageHeader
        title="Products"
        description="Catalog listings from store owners and independent sellers. Review pending products before they go live."
      />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({products.length})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({filterByStatus("PENDING").length})</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved ({filterByStatus("APPROVED").length})</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected ({filterByStatus("REJECTED").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={products}
            isLoading={isLoading}
            errorMessage={isError ? "Failed to load products. Check your connection and try again." : undefined}
            onRowClick={(r) => router.push(`/admin/products/${r.id}`)}
          />
        </TabsContent>
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <TabsContent key={s} value={s}>
            <DataTable columns={columns} data={filterByStatus(s)} isLoading={isLoading} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
