import { apiRequest, setStoredTokens, clearStoredTokens } from "./client";

export type AuthResponse = {
  token: string;
  refreshToken: string;
  user: { id: string; email: string; role: string; name?: string };
};

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiRequest<AuthResponse>("/auth/admin/login", {
      method: "POST",
      body: { email, password },
    });
    setStoredTokens(res.token, res.refreshToken);
    return res;
  },
  logout: async () => {
    try {
      await apiRequest<void>("/auth/logout", { method: "POST" });
    } finally {
      clearStoredTokens();
    }
  },
  me: () => apiRequest<{ user: AuthResponse["user"]; permissions?: string[] }>("/auth/me"),
  permissions: () => apiRequest<string[]>("/admin/permissions/effective"),
};

export const adminApi = {
  dashboard: () => apiRequest("/dashboard/overview"),
  stores: () => apiRequest("/admin/stores"),
  updateStoreStatus: (id: string, status: string) =>
    apiRequest(`/admin/stores/${id}/status`, { method: "PATCH", body: { status } }),
  customers: () => apiRequest("/admin/customers"),
  orders: () => apiRequest("/admin/orders"),
  order: (id: string) => apiRequest(`/admin/orders/${id}`),
  sellers: () => apiRequest("/admin/sellers"),
  deliveryPartners: () => apiRequest("/admin/delivery-partners"),
  liveDeliveries: () => apiRequest("/admin/delivery/live"),
  finance: () => apiRequest("/admin/finance/summary"),
  coupons: () => apiRequest("/admin/coupons"),
  banners: () => apiRequest("/admin/banners"),
  payouts: () => apiRequest("/payouts"),
};
