import { adminApi } from "@/lib/api/admin";
import {
  deriveCitiesFromStores,
  mapBanner,
  mapCategory,
  mapCoupon,
  mapOffer,
  mapCustomer,
  mapFeatureFlag,
  mapFinanceSummary,
  mapOrder,
  mapOverviewToDashboardStats,
  mapPartner,
  mapPartnerRequest,
  mapPayout,
  mapProduct,
  mapSeller,
  mapStore,
  mapCommissionRule,
  mapChargeRule,
  type ApiCommissionRule,
  type ApiCustomer,
  type ApiPartnerRequest,
  type ApiOrder,
  type ApiOverview,
  type ApiPartner,
  type ApiPayout,
  type ApiProduct,
  type ApiSeller,
  type ApiStore,
} from "@/lib/api/mappers";
import type {
  Advertisement,
  AuditLog,
  ChargeCondition,
  ChargeRule,
  CommissionRule,
  DeliveryAssignment,
  DeliveryPricing,
  ListFilters,
  Notification,
  PaginatedResult,
  PlatformEvent,
} from "@/lib/types";

function paginate<T>(items: T[], filters?: ListFilters): PaginatedResult<T> {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  let filtered = [...items];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }

  if (filters?.status) {
    filtered = filtered.filter((item) => (item as Record<string, unknown>).status === filters.status);
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
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

async function findById<T extends { id: string }>(listFn: () => Promise<PaginatedResult<T>>, id: string) {
  const result = await listFn();
  return result.data.find((item) => item.id === id) ?? null;
}

export const repositories = {
  stores: {
    getAll: async (filters?: ListFilters) => {
      const raw = (await adminApi.stores()) as ApiStore[];
      return paginate(raw.map(mapStore), filters);
    },
    getById: async (id: string) => findById(() => repositories.stores.getAll({ pageSize: 500 }), id),
    update: async (
      id: string,
      data: Record<string, unknown>,
      ...args: unknown[]
    ) => {
      void args;
      if (data.status) {
        await adminApi.updateStoreStatus(id, data.status as string);
      }
      return repositories.stores.getById(id);
    },
  },
  customers: {
    getAll: async (filters?: ListFilters) => {
      const raw = (await adminApi.customers()) as ApiCustomer[];
      return paginate(raw.map(mapCustomer), filters);
    },
    getById: async (id: string) => findById(() => repositories.customers.getAll({ pageSize: 500 }), id),
  },
  orders: {
    getAll: async (filters?: ListFilters) => {
      const raw = (await adminApi.orders()) as ApiOrder[];
      return paginate(raw.map(mapOrder), filters);
    },
    getById: async (id: string) => {
      const raw = (await adminApi.order(id)) as ApiOrder;
      return mapOrder(raw);
    },
  },
  sellers: {
    getAll: async (filters?: ListFilters) => {
      const raw = (await adminApi.sellers()) as ApiSeller[];
      return paginate(raw.map(mapSeller), filters);
    },
    getById: async (id: string) => findById(() => repositories.sellers.getAll({ pageSize: 500 }), id),
  },
  requests: {
    getAll: async (filters?: ListFilters & { partnerType?: string }) => {
      const raw = (await adminApi.requests({
        status: filters?.status,
        partnerType: filters?.partnerType,
      })) as ApiPartnerRequest[];
      let items = raw.map(mapPartnerRequest);
      if (filters?.partnerType) {
        items = items.filter((r) => r.partnerType === filters.partnerType);
      }
      return paginate(items, filters);
    },
    getById: async (userId: string) => {
      const raw = (await adminApi.request(userId)) as ApiPartnerRequest;
      return mapPartnerRequest(raw);
    },
    review: async (
      userId: string,
      status: "approved" | "rejected",
      rejectionReason?: string,
    ) => {
      const raw = (await adminApi.reviewRequest(userId, {
        status,
        rejectionReason,
      })) as ApiPartnerRequest;
      return mapPartnerRequest(raw);
    },
  },
  partners: {
    getAll: async (filters?: ListFilters) => {
      let items = ((await adminApi.deliveryPartners()) as ApiPartner[]).map(mapPartner);
      if (filters?.status === "online") items = items.filter((p) => p.isOnline);
      if (filters?.status === "offline") items = items.filter((p) => !p.isOnline);
      return paginate(items, filters);
    },
    getById: async (id: string) => findById(() => repositories.partners.getAll({ pageSize: 500 }), id),
  },
  products: {
    getAll: async (filters?: ListFilters) => {
      const result = (await adminApi.products({ page: 1, limit: filters?.pageSize ?? 500 })) as {
        data: ApiProduct[];
      };
      const items = (result.data ?? []).map(mapProduct);
      if (filters?.status) {
        return paginate(items.filter((p) => p.status === filters.status), filters);
      }
      return paginate(items, filters);
    },
    getById: async (id: string) => {
      const raw = (await adminApi.product(id)) as ApiProduct;
      return mapProduct(raw);
    },
    update: async (id: string, ...args: unknown[]) => {
      void args;
      return repositories.products.getById(id);
    },
  },
  payouts: {
    getAll: async (filters?: ListFilters) => {
      const raw = (await adminApi.payouts()) as ApiPayout[];
      let items = raw.map(mapPayout);
      if (filters?.status) items = items.filter((p) => p.status === filters.status);
      if (filters?.category) items = items.filter((p) => p.type === filters.category);
      return paginate(items, filters);
    },
    getById: async (id: string) => findById(() => repositories.payouts.getAll({ pageSize: 500 }), id),
    update: async (id: string, status: string, ...args: unknown[]) => {
      void args;
      const payout = await repositories.payouts.getById(id);
      if (!payout) throw new Error("Payout not found");
      return { ...payout, status: status as typeof payout.status };
    },
  },
  dashboard: {
    getStats: async () => {
      const overview = (await adminApi.dashboard()) as ApiOverview;
      return mapOverviewToDashboardStats(overview);
    },
    getFinanceStats: async () => {
      const summary = (await adminApi.finance()) as {
        platformRevenue?: number;
        commission?: number;
        chargeCollection?: number;
        sellerPayables?: number;
        deliveryPayables?: number;
        deliveryPartnerPayables?: number;
        pendingPayments?: number;
        refunds?: number;
      };
      return mapFinanceSummary(summary);
    },
    getCartAnalytics: async () => ({
      activeCarts: 0,
      abandonedCarts: 0,
      averageCartValue: 0,
      conversionRate: 0,
      cartDropRate: 0,
      mostAddedProducts: [],
      mostAbandonedProducts: [],
    }),
    getEvents: async (): Promise<PlatformEvent[]> => [],
    getCities: async () => {
      const stores = await repositories.stores.getAll({ pageSize: 500 });
      return deriveCitiesFromStores(stores.data);
    },
    getCategories: async () => {
      const raw = (await adminApi.categories()) as Array<{ id: string; name: string; slug: string; parentId?: string | null; sortOrder: number; isActive: boolean }>;
      return raw.map(mapCategory);
    },
    getCharges: async (): Promise<ChargeRule[]> => {
      const raw = (await adminApi.charges()) as import("@/lib/api/mappers").ApiChargeRule[];
      return raw.map(mapChargeRule);
    },
    createCharge: async (data: {
      code: string;
      name: string;
      type: "FIXED" | "PERCENTAGE";
      value: number;
      conditions?: ChargeRule["conditions"];
      priority?: number;
      isActive?: boolean;
    }) => {
      const raw = (await adminApi.createCharge(data)) as import("@/lib/api/mappers").ApiChargeRule;
      return mapChargeRule(raw);
    },
    updateCharge: async (
      id: string,
      data: Partial<{
        code: string;
        name: string;
        type: "FIXED" | "PERCENTAGE";
        value: number;
        conditions: ChargeRule["conditions"];
        priority: number;
        isActive: boolean;
      }>,
    ) => {
      const raw = (await adminApi.updateCharge(id, data)) as import("@/lib/api/mappers").ApiChargeRule;
      return mapChargeRule(raw);
    },
    deleteCharge: async (id: string) => {
      await adminApi.deleteCharge(id);
    },
    getChargeConditions: async (): Promise<ChargeCondition[]> => [],
    getDeliveryPricing: async (): Promise<DeliveryPricing[]> => [],
    getCommissions: async (): Promise<CommissionRule[]> => {
      const raw = (await adminApi.commissions()) as ApiCommissionRule[];
      return raw.map(mapCommissionRule);
    },
    createCommission: async (data: {
      name: string;
      sellerType: "STORE" | "INDEPENDENT";
      type: "PERCENTAGE" | "FIXED";
      value: number;
      targetId?: string;
      effectiveFrom: string;
      effectiveTo?: string;
      isActive?: boolean;
    }) => {
      const raw = (await adminApi.createCommission(data)) as ApiCommissionRule;
      return mapCommissionRule(raw);
    },
    updateCommission: async (
      id: string,
      data: Partial<{
        name: string;
        sellerType: "STORE" | "INDEPENDENT";
        type: "PERCENTAGE" | "FIXED";
        value: number;
        targetId: string | null;
        effectiveFrom: string;
        effectiveTo: string | null;
        isActive: boolean;
      }>,
    ) => {
      const raw = (await adminApi.updateCommission(id, data)) as ApiCommissionRule;
      return mapCommissionRule(raw);
    },
    deleteCommission: async (id: string) => {
      await adminApi.deleteCommission(id);
    },
    getBanners: async () => {
      const raw = (await adminApi.banners()) as Parameters<typeof mapBanner>[0][];
      return raw.map(mapBanner);
    },
    createBanner: async (body: Record<string, unknown>) => {
      const raw = (await adminApi.createBanner(body)) as Parameters<typeof mapBanner>[0];
      return mapBanner(raw);
    },
    updateBanner: async (id: string, body: Record<string, unknown>) => {
      const raw = (await adminApi.updateBanner(id, body)) as Parameters<typeof mapBanner>[0];
      return mapBanner(raw);
    },
    deleteBanner: async (id: string) => {
      await adminApi.deleteBanner(id);
    },
    getAds: async (): Promise<Advertisement[]> => {
      try {
        return (await adminApi.advertisements()) as Advertisement[];
      } catch {
        return [];
      }
    },
    getCoupons: async () => {
      const raw = (await adminApi.coupons()) as Parameters<typeof mapCoupon>[0][];
      return raw.map(mapCoupon);
    },
    createCoupon: (body: Record<string, unknown>) => adminApi.createCoupon(body),
    updateCoupon: (id: string, body: Record<string, unknown>) => adminApi.updateCoupon(id, body),
    deleteCoupon: (id: string) => adminApi.deleteCoupon(id),
    getOffers: async () => {
      const raw = (await adminApi.offers()) as Parameters<typeof mapOffer>[0][];
      return raw.map(mapOffer);
    },
    createOffer: (body: Record<string, unknown>) => adminApi.createOffer(body),
    updateOffer: (id: string, body: Record<string, unknown>) => adminApi.updateOffer(id, body),
    deleteOffer: (id: string) => adminApi.deleteOffer(id),
    getAdminUsers: async () => [] as import("@/lib/types").AdminUser[],
    getAuditLogs: async (filters?: ListFilters): Promise<PaginatedResult<AuditLog>> =>
      paginate<AuditLog>([], filters),
    getNotifications: async (): Promise<Notification[]> => [],
    getFeatureFlags: async () => {
      try {
        const raw = (await adminApi.featureFlags()) as Array<{ key: string; name: string; description?: string; isEnabled: boolean }>;
        return raw.map(mapFeatureFlag);
      } catch {
        return [];
      }
    },
    getSystemSettings: async () => ({
      platformName: "Quickmart",
      supportEmail: "",
      supportPhone: "",
      currency: "INR",
      timezone: "Asia/Kolkata",
      minOrderValue: 0,
      maxOrderValue: 0,
      defaultDeliveryRadius: 5,
      defaultCommission: 10,
      defaultPlatformFee: 2,
    }),
    getAssignments: async (): Promise<DeliveryAssignment[]> => [],
    getCarts: async (filters?: ListFilters) => paginate([], filters),
    getZones: async () => [],
  },
};
