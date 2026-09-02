"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { DetailTabs } from "@/components/admin/detail-tabs";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function SellerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: seller } = useQuery({ queryKey: ["seller", id], queryFn: () => repositories.sellers.getById(id) });

  if (!seller) return <p>Loading...</p>;

  const tabs = [
    { value: "basic", label: "Basic Details", content: (
      <div className="grid gap-3 sm:grid-cols-2">
        {[["Name", seller.name], ["Business", seller.businessName], ["Mobile", seller.mobile], ["Email", seller.email], ["Location", seller.pickupLocation.city], ["Registered", formatDate(seller.registrationDate)]].map(([l,v]) => (
          <div key={String(l)} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v}</p></div>
        ))}
      </div>
    )},
    { value: "products", label: "Products", content: (
      <div className="grid gap-3 sm:grid-cols-4">
        {[["Total", seller.productsCount], ["Active", Math.floor(seller.productsCount * 0.8)], ["Pending", Math.floor(seller.productsCount * 0.1)], ["Rejected", Math.floor(seller.productsCount * 0.05)]].map(([l,v]) => (
          <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></CardContent></Card>
        ))}
      </div>
    )},
    { value: "sales", label: "Sales", content: (
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Daily", formatCurrency(seller.totalSales / 30)], ["Monthly", formatCurrency(seller.totalSales / 6)], ["Lifetime", formatCurrency(seller.totalSales)]].map(([l,v]) => (
          <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></CardContent></Card>
        ))}
      </div>
    )},
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Independent Sellers", href: "/admin/independent-sellers" }, { label: seller.businessName }]} />
      <h1 className="mb-2 text-2xl font-bold">{seller.businessName}</h1>
      <StatusBadge status={seller.status} />
      <div className="mt-4"><DetailTabs tabs={tabs} /></div>
    </div>
  );
}
