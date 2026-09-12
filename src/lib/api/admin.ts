import { apiRequest, apiUploadFile, setStoredTokens, clearStoredTokens } from "./client";

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
  analytics: () => apiRequest("/admin/analytics/dashboard"),
  coupons: () => apiRequest("/admin/coupons"),
  createCoupon: (body: Record<string, unknown>) =>
    apiRequest("/admin/coupons", { method: "POST", body }),
  updateCoupon: (id: string, body: Record<string, unknown>) =>
    apiRequest(`/admin/coupons/${id}`, { method: "PATCH", body }),
  deleteCoupon: (id: string) =>
    apiRequest(`/admin/coupons/${id}`, { method: "DELETE" }),
  offers: () => apiRequest("/admin/offers"),
  createOffer: (body: Record<string, unknown>) =>
    apiRequest("/admin/offers", { method: "POST", body }),
  updateOffer: (id: string, body: Record<string, unknown>) =>
    apiRequest(`/admin/offers/${id}`, { method: "PATCH", body }),
  deleteOffer: (id: string) =>
    apiRequest(`/admin/offers/${id}`, { method: "DELETE" }),
  banners: () => apiRequest("/admin/banners"),
  createBanner: (body: Record<string, unknown>) =>
    apiRequest("/admin/banners", { method: "POST", body }),
  updateBanner: (id: string, body: Record<string, unknown>) =>
    apiRequest(`/admin/banners/${id}`, { method: "PATCH", body }),
  deleteBanner: (id: string) =>
    apiRequest(`/admin/banners/${id}`, { method: "DELETE" }),
  uploadFile: (file: File, folder = "banners") =>
    apiUploadFile("/uploads", file, { folder }),
  advertisements: () => apiRequest("/admin/advertisements"),
  categories: () => apiRequest("/categories"),
  products: (params?: { page?: number; limit?: number }) =>
    apiRequest("/products", { params }),
  product: (id: string) => apiRequest(`/products/${id}`),
  payouts: () => apiRequest("/payouts"),
  featureFlags: () => apiRequest("/admin/feature-flags"),
  requests: (params?: { status?: string; partnerType?: string }) =>
    apiRequest("/admin/requests", { params }),
  request: (userId: string) => apiRequest(`/admin/requests/${userId}`),
  reviewRequest: (userId: string, body: { status: "approved" | "rejected"; rejectionReason?: string }) =>
    apiRequest(`/admin/requests/${userId}`, { method: "PATCH", body }),
  commissions: () => apiRequest("/admin/commissions"),
  createCommission: (body: Record<string, unknown>) =>
    apiRequest("/admin/commissions", { method: "POST", body }),
  updateCommission: (id: string, body: Record<string, unknown>) =>
    apiRequest(`/admin/commissions/${id}`, { method: "PATCH", body }),
  deleteCommission: (id: string) =>
    apiRequest(`/admin/commissions/${id}`, { method: "DELETE" }),
  charges: () => apiRequest("/admin/charges"),
  createCharge: (body: Record<string, unknown>) =>
    apiRequest("/admin/charges", { method: "POST", body }),
  updateCharge: (id: string, body: Record<string, unknown>) =>
    apiRequest(`/admin/charges/${id}`, { method: "PATCH", body }),
  deleteCharge: (id: string) =>
    apiRequest(`/admin/charges/${id}`, { method: "DELETE" }),
};
