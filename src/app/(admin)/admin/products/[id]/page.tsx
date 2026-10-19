"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product } = useQuery({ queryKey: ["product", id], queryFn: () => repositories.products.getById(id) });
  if (!product) return <p>Loading...</p>;
  return (
    <div>
      <PageHeader
        breadcrumbItems={[{ label: "Products", href: "/admin/products" }, { label: product.name }]}
        title={product.name}
        afterTitle={<StatusBadge status={product.status} />}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {[["SKU", product.sku], ["Category", product.categoryName], ["Store/Seller", product.storeName ?? product.sellerName], ["Price", formatCurrency(product.price)], ["Stock", product.stock]].map(([l,v]) => (
          <div key={String(l)} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v}</p></div>
        ))}
      </div>
    </div>
  );
}
