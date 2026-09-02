import { seedData } from "@/lib/mock/seed";
import type { SearchResult } from "@/lib/types";

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  seedData.customers.forEach((c) => {
    results.push({
      id: c.id,
      type: "Customer",
      title: c.name,
      subtitle: c.mobile,
      href: `/admin/customers/${c.id}`,
    });
  });

  seedData.stores.forEach((s) => {
    results.push({
      id: s.id,
      type: "Store",
      title: s.name,
      subtitle: `${s.ownerName} · ${s.address.city}`,
      href: `/admin/stores/${s.id}`,
    });
  });

  seedData.sellers.forEach((s) => {
    results.push({
      id: s.id,
      type: "Independent Seller",
      title: s.businessName,
      subtitle: s.mobile,
      href: `/admin/independent-sellers/${s.id}`,
    });
  });

  seedData.partners.forEach((p) => {
    results.push({
      id: p.id,
      type: "Delivery Partner",
      title: p.name,
      subtitle: p.phone,
      href: `/admin/delivery-partners/${p.id}`,
    });
  });

  seedData.products.forEach((p) => {
    results.push({
      id: p.id,
      type: "Product",
      title: p.name,
      subtitle: p.sku,
      href: `/admin/products/${p.id}`,
    });
  });

  seedData.orders.forEach((o) => {
    results.push({
      id: o.id,
      type: "Order",
      title: o.id,
      subtitle: `${o.customerName} · ${o.status}`,
      href: `/admin/orders/${o.id}`,
    });
  });

  return results;
}

export function searchAll(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return buildSearchIndex()
    .filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    )
    .slice(0, 20);
}
