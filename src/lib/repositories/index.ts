import { adminApi } from "@/lib/api/admin";
import { repositories as mockRepositories } from "@/lib/repositories/mock";
import type { PaginatedResult } from "@/lib/types";

const USE_API = Boolean(process.env.NEXT_PUBLIC_API_URL?.includes("localhost:3000"));

async function withFallback<T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> {
  if (!USE_API) return mockCall();
  try {
    return await apiCall();
  } catch {
    return mockCall();
  }
}

function paginate<T>(data: T[]): PaginatedResult<T> {
  return { data, total: data.length, page: 1, limit: 100 };
}

export const repositories = {
  stores: {
    getAll: (filters?: unknown) =>
      withFallback(
        () => adminApi.stores().then((data) => paginate(data as never[])),
        () => mockRepositories.stores.getAll(filters as never),
      ),
    getById: (id: string) =>
      withFallback(
        async () => {
          const list = (await adminApi.stores()) as { id: string }[];
          return (list.find((s) => s.id === id) as never) ?? null;
        },
        () => mockRepositories.stores.getById(id),
      ),
    update: (id: string, data: Record<string, unknown>) =>
      withFallback(
        () => adminApi.updateStoreStatus(id, data.status as string) as Promise<never>,
        () => mockRepositories.stores.update(id, data as never),
      ),
  },
  customers: {
    getAll: (filters?: unknown) =>
      withFallback(
        () => adminApi.customers().then((data) => paginate(data as never[])),
        () => mockRepositories.customers.getAll(filters as never),
      ),
    getById: (id: string) => mockRepositories.customers.getById(id),
  },
  orders: {
    getAll: (filters?: unknown) =>
      withFallback(
        () => adminApi.orders().then((data) => paginate(data as never[])),
        () => mockRepositories.orders.getAll(filters as never),
      ),
    getById: (id: string) =>
      withFallback(() => adminApi.order(id) as Promise<never>, () => mockRepositories.orders.getById(id)),
  },
  sellers: {
    getAll: (filters?: unknown) =>
      withFallback(
        () => adminApi.sellers().then((data) => paginate(data as never[])),
        () => mockRepositories.sellers.getAll(filters as never),
      ),
    getById: (id: string) => mockRepositories.sellers.getById(id),
  },
  partners: {
    getAll: (filters?: unknown) =>
      withFallback(
        () => adminApi.deliveryPartners().then((data) => paginate(data as never[])),
        () => mockRepositories.partners.getAll(filters as never),
      ),
    getById: (id: string) => mockRepositories.partners.getById(id),
  },
  products: mockRepositories.products,
  payouts: mockRepositories.payouts,
  dashboard: mockRepositories.dashboard,
};
