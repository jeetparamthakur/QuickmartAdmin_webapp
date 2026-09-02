import { seedData } from "@/lib/mock/seed";
import type { ListFilters, PaginatedResult } from "@/lib/types";
import { addAuditLog } from "@/lib/audit";

function paginate<T>(items: T[], filters?: ListFilters): PaginatedResult<T> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  let filtered = [...items];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q)
    );
  }

  if (filters?.status) {
    filtered = filtered.filter(
      (item) => (item as Record<string, unknown>).status === filters.status
    );
  }

  if (filters?.city) {
    filtered = filtered.filter((item) => {
      const rec = item as Record<string, unknown>;
      const addr = rec.address as { city?: string } | undefined;
      const pickup = rec.pickupLocation as { city?: string } | undefined;
      return addr?.city === filters.city || pickup?.city === filters.city || rec.cityName === filters.city;
    });
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return {
    data: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export const mockStoreRepo = {
  getAll: (filters?: ListFilters) => Promise.resolve(paginate(seedData.stores, filters)),
  getById: (id: string) => Promise.resolve(seedData.stores.find((s) => s.id === id) ?? null),
  update: (id: string, data: Partial<(typeof seedData.stores)[0]>, admin?: { id: string; name: string }, action?: string, reason?: string) => {
    const idx = seedData.stores.findIndex((s) => s.id === id);
    if (idx >= 0) {
      seedData.stores[idx] = { ...seedData.stores[idx], ...data };
      if (admin && action) {
        addAuditLog({ adminId: admin.id, adminName: admin.name, action, entityType: "Store", entityId: id, entityName: seedData.stores[idx].name, reason });
      }
      return Promise.resolve(seedData.stores[idx]);
    }
    return Promise.reject(new Error("Not found"));
  },
};

export const mockSellerRepo = {
  getAll: (filters?: ListFilters) => Promise.resolve(paginate(seedData.sellers, filters)),
  getById: (id: string) => Promise.resolve(seedData.sellers.find((s) => s.id === id) ?? null),
  update: (id: string, data: Partial<(typeof seedData.sellers)[0]>, admin?: { id: string; name: string }, action?: string, reason?: string) => {
    const idx = seedData.sellers.findIndex((s) => s.id === id);
    if (idx >= 0) {
      seedData.sellers[idx] = { ...seedData.sellers[idx], ...data };
      if (admin && action) {
        addAuditLog({ adminId: admin.id, adminName: admin.name, action, entityType: "Seller", entityId: id, entityName: seedData.sellers[idx].businessName, reason });
      }
      return Promise.resolve(seedData.sellers[idx]);
    }
    return Promise.reject(new Error("Not found"));
  },
};

export const mockCustomerRepo = {
  getAll: (filters?: ListFilters) => Promise.resolve(paginate(seedData.customers, filters)),
  getById: (id: string) => Promise.resolve(seedData.customers.find((c) => c.id === id) ?? null),
};

export const mockPartnerRepo = {
  getAll: (filters?: ListFilters) => {
    let items = [...seedData.partners];
    if (filters?.status === "online") items = items.filter((p) => p.isOnline);
    if (filters?.status === "offline") items = items.filter((p) => !p.isOnline);
    return Promise.resolve(paginate(items, filters));
  },
  getById: (id: string) => Promise.resolve(seedData.partners.find((p) => p.id === id) ?? null),
  update: (id: string, data: Partial<(typeof seedData.partners)[0]>, admin?: { id: string; name: string }, action?: string, reason?: string) => {
    const idx = seedData.partners.findIndex((p) => p.id === id);
    if (idx >= 0) {
      seedData.partners[idx] = { ...seedData.partners[idx], ...data };
      if (admin && action) {
        addAuditLog({ adminId: admin.id, adminName: admin.name, action, entityType: "Partner", entityId: id, entityName: seedData.partners[idx].name, reason });
      }
      return Promise.resolve(seedData.partners[idx]);
    }
    return Promise.reject(new Error("Not found"));
  },
};

export const mockOrderRepo = {
  getAll: (filters?: ListFilters) => Promise.resolve(paginate(seedData.orders, filters)),
  getById: (id: string) => Promise.resolve(seedData.orders.find((o) => o.id === id) ?? null),
};

export const mockProductRepo = {
  getAll: (filters?: ListFilters) => {
    let items = [...seedData.products];
    if (filters?.status) items = items.filter((p) => p.status === filters.status);
    return Promise.resolve(paginate(items, filters));
  },
  getById: (id: string) => Promise.resolve(seedData.products.find((p) => p.id === id) ?? null),
  update: (id: string, data: Partial<(typeof seedData.products)[0]>) => {
    const idx = seedData.products.findIndex((p) => p.id === id);
    if (idx >= 0) {
      seedData.products[idx] = { ...seedData.products[idx], ...data };
      return Promise.resolve(seedData.products[idx]);
    }
    return Promise.reject(new Error("Not found"));
  },
};

export const mockPayoutRepo = {
  getAll: (filters?: ListFilters) => {
    let items = [...seedData.payouts];
    if (filters?.status) items = items.filter((p) => p.status === filters.status);
    if (filters?.category) items = items.filter((p) => p.type === filters.category);
    return Promise.resolve(paginate(items, filters));
  },
  getById: (id: string) => Promise.resolve(seedData.payouts.find((p) => p.id === id) ?? null),
  update: (id: string, status: string, admin: { id: string; name: string }) => {
    const idx = seedData.payouts.findIndex((p) => p.id === id);
    if (idx >= 0) {
      seedData.payouts[idx] = { ...seedData.payouts[idx], status: status as (typeof seedData.payouts)[0]["status"] };
      addAuditLog({ adminId: admin.id, adminName: admin.name, action: `Payout ${status}`, entityType: "Payout", entityId: id, entityName: seedData.payouts[idx].recipientName });
      return Promise.resolve(seedData.payouts[idx]);
    }
    return Promise.reject(new Error("Not found"));
  },
};

export const mockDashboardRepo = {
  getStats: () => Promise.resolve(seedData.dashboardStats),
  getFinanceStats: () => Promise.resolve(seedData.financeStats),
  getCartAnalytics: () => Promise.resolve(seedData.cartAnalytics),
  getEvents: () => Promise.resolve(seedData.events),
  getCities: () => Promise.resolve(seedData.cities),
  getCategories: () => Promise.resolve(seedData.categories),
  getCharges: () => Promise.resolve(seedData.charges),
  getChargeConditions: () => Promise.resolve(seedData.chargeConditions),
  getDeliveryPricing: () => Promise.resolve(seedData.deliveryPricing),
  getCommissions: () => Promise.resolve(seedData.commissions),
  getBanners: () => Promise.resolve(seedData.banners),
  getAds: () => Promise.resolve(seedData.ads),
  getCoupons: () => Promise.resolve(seedData.coupons),
  getAdminUsers: () => Promise.resolve(seedData.adminUsers),
  getAuditLogs: () => Promise.resolve(paginate(seedData.auditLogs, { pageSize: 50 })),
  getNotifications: () => Promise.resolve(seedData.notifications),
  getFeatureFlags: () => Promise.resolve(seedData.featureFlags),
  getSystemSettings: () => Promise.resolve(seedData.systemSettings),
  getAssignments: () => Promise.resolve(seedData.assignments),
  getCarts: () => Promise.resolve(paginate(seedData.carts)),
  getZones: () => Promise.resolve(seedData.zones),
};

export const repositories = {
  stores: mockStoreRepo,
  sellers: mockSellerRepo,
  customers: mockCustomerRepo,
  partners: mockPartnerRepo,
  orders: mockOrderRepo,
  products: mockProductRepo,
  payouts: mockPayoutRepo,
  dashboard: mockDashboardRepo,
};
