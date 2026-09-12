import { repositories } from "@/lib/repositories";
import type { SearchResult } from "@/lib/types";

let cachedIndex: SearchResult[] | null = null;

async function buildSearchIndex(): Promise<SearchResult[]> {
  const [customers, stores, sellers, partners, orders, products] = await Promise.all([
    repositories.customers.getAll({ pageSize: 100 }),
    repositories.stores.getAll({ pageSize: 100 }),
    repositories.sellers.getAll({ pageSize: 100 }),
    repositories.partners.getAll({ pageSize: 100 }),
    repositories.orders.getAll({ pageSize: 100 }),
    repositories.products.getAll({ pageSize: 100 }),
  ]);

  const results: SearchResult[] = [];

  customers.data.forEach((c) => {
    results.push({
      id: c.id,
      type: "Customer",
      title: c.name,
      subtitle: c.mobile,
      href: `/admin/customers/${c.id}`,
    });
  });

  stores.data.forEach((s) => {
    results.push({
      id: s.id,
      type: "Store Owner",
      title: s.name,
      subtitle: `${s.ownerName} · ${s.address.city}`,
      href: `/admin/stores/${s.id}`,
    });
  });

  sellers.data.forEach((s) => {
    results.push({
      id: s.id,
      type: "Independent Seller",
      title: s.businessName,
      subtitle: s.mobile,
      href: `/admin/independent-sellers/${s.id}`,
    });
  });

  partners.data.forEach((p) => {
    results.push({
      id: p.id,
      type: "Delivery Partner",
      title: p.name,
      subtitle: p.phone,
      href: `/admin/delivery-partners/${p.id}`,
    });
  });

  products.data.forEach((p) => {
    results.push({
      id: p.id,
      type: "Product",
      title: p.name,
      subtitle: p.sku,
      href: `/admin/products/${p.id}`,
    });
  });

  orders.data.forEach((o) => {
    results.push({
      id: o.id,
      type: "Order",
      title: o.id,
      subtitle: `${o.customerName} · ${o.status}`,
      href: `/admin/orders/${o.parentOrderId ?? o.id}`,
    });
  });

  return results;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  if (!cachedIndex) {
    try {
      cachedIndex = await buildSearchIndex();
    } catch {
      return [];
    }
  }

  const q = query.toLowerCase();
  return cachedIndex
    .filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    )
    .slice(0, 20);
}

export function clearSearchCache() {
  cachedIndex = null;
}
