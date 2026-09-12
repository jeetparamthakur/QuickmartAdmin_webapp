import type {
  AccountStatus,
  Address,
  Banner,
  Category,
  City,
  Coupon,
  Offer,
  Customer,
  DashboardStats,
  DeliveryPartner,
  FeatureFlag,
  FinanceStats,
  IndependentSeller,
  Order,
  OrderItem,
  OrderStatus,
  Payout,
  PartnerRequest,
  Product,
  Store,
} from "@/lib/types";

type ApiUser = {
  email?: string;
  phone?: string;
  status?: string;
};

type ApiStore = {
  id: string;
  name: string;
  address?: string | null;
  lat?: string | null;
  lng?: string | null;
  status: string;
  createdAt: string;
  storeOwner?: { fullName?: string; user?: ApiUser };
};

type ApiCustomer = {
  id: string;
  fullName: string;
  address?: string | null;
  createdAt: string;
  user?: ApiUser;
};

type ApiOrder = {
  id: string;
  orderNumber?: string;
  customerId: string;
  status: string;
  subtotal?: string;
  discountTotal?: string;
  deliveryFee?: string;
  taxTotal?: string;
  platformFee?: string;
  chargeBreakdown?: Array<{ code: string; name: string; type?: string; amount: number }>;
  totalPayable: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt?: string;
  customer?: { fullName?: string };
  subOrders?: Array<{
    id: string;
    status: string;
    storeId?: string;
    items?: Array<{
      productName?: string;
      quantity?: number;
      unitPrice?: string;
      price?: string;
    }>;
  }>;
};

type ApiSeller = {
  id: string;
  businessName: string;
  status: string;
  pickupLat?: string | null;
  pickupLng?: string | null;
  createdAt: string;
  sellerProfile?: { fullName?: string; user?: ApiUser };
};

type ApiPartner = {
  id: string;
  fullName: string;
  preference?: string;
  isOnline: boolean;
  currentLat?: string | null;
  currentLng?: string | null;
  user?: ApiUser;
};

type ApiOverview = {
  users: { total: number; active: number; newToday: number };
  stores: { total: number; active: number; inactive: number; suspended: number };
  independentSellers: { total: number; active: number; pendingVerification: number };
  delivery: { totalPartners: number; onlinePartners: number; activeDeliveries: number };
  orders: { today: number; active: number; delivered: number; cancelled: number };
  finance: {
    todayGmv: number;
    totalGmv: number;
    platformRevenue: number;
    sellerPayables: number;
    deliveryPartnerPayables: number;
  };
};

type ApiProduct = {
  id: string;
  title: string;
  sellingPrice: string;
  mrp?: string;
  isActive: boolean;
  createdAt: string;
  storeId?: string | null;
  independentSellerId?: string | null;
  masterProduct?: {
    sku?: string;
    category?: { id: string; name: string };
  };
  store?: { name?: string };
  independentSeller?: { businessName?: string };
  inventory?: { quantity?: number };
};

type ApiPayout = {
  id: string;
  beneficiaryId: string;
  beneficiaryType: string;
  amount: string;
  status: string;
  createdAt: string;
  approvedAt?: string | null;
  metadata?: Record<string, unknown>;
};

type ApiBanner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  placement?: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
};

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
};

type ApiCoupon = {
  id: string;
  code: string;
  name?: string;
  type: string;
  value: string;
  minOrderAmount?: string;
  maxDiscount?: string | null;
  usageLimit?: number | null;
  usedCount?: number;
  perCustomerLimit?: number;
  scopeType?: string;
  storeId?: string | null;
  independentSellerId?: string | null;
  fundingSource?: string;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt?: string;
};

type ApiOffer = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  discountPercent?: string | null;
  linkedCouponCode?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  status: string;
};

type ApiFeatureFlag = {
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
};

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toAccountStatus(status?: string): AccountStatus {
  const allowed: AccountStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING", "BLOCKED"];
  return allowed.includes(status as AccountStatus) ? (status as AccountStatus) : "ACTIVE";
}

function toOrderStatus(status: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    PLACED: "PLACED",
    CONFIRMED: "ACCEPTED",
    PARTIALLY_CANCELLED: "CANCELLED",
    CANCELLED: "CANCELLED",
    COMPLETED: "DELIVERED",
    ACCEPTED: "ACCEPTED",
    PREPARING: "PREPARING",
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    DELIVERY_ASSIGNED: "DELIVERY_ASSIGNED",
    PICKED_UP: "PICKED_UP",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    REFUNDED: "REFUNDED",
    FAILED: "FAILED",
  };
  return map[status] ?? "PLACED";
}

function toAddress(address?: string | null, lat?: string | null, lng?: string | null): Address {
  const parts = address?.split(",").map((part) => part.trim()).filter(Boolean) ?? [];
  const city = parts.length > 1 ? parts[parts.length - 1] : parts[0] ?? "Unknown";
  return {
    line1: address ?? "",
    city,
    state: parts.length > 2 ? parts[parts.length - 2] : "",
    pincode: "",
    lat: toNumber(lat),
    lng: toNumber(lng),
  };
}

const defaultFeatures = {
  login: true,
  productUpload: true,
  orders: true,
  delivery: true,
  payout: true,
  advertisements: true,
  multipleStores: true,
  staffManagement: true,
};

export function mapStore(raw: ApiStore): Store {
  const owner = raw.storeOwner;
  return {
    id: raw.id,
    name: raw.name,
    ownerName: owner?.fullName ?? "—",
    ownerPhone: owner?.user?.phone ?? "—",
    ownerEmail: owner?.user?.email ?? "—",
    categoryId: "",
    categoryName: "—",
    businessType: "—",
    address: toAddress(raw.address, raw.lat, raw.lng),
    registrationDate: raw.createdAt,
    status: toAccountStatus(raw.status),
    isOpen: raw.status === "ACTIVE",
    totalProducts: 0,
    todayOrders: 0,
    totalOrders: 0,
    todaySales: 0,
    totalSales: 0,
    platformCommission: 0,
    rating: 0,
    deliveryRadius: 5,
    timings: "—",
    features: defaultFeatures,
  };
}

export function mapCustomer(raw: ApiCustomer): Customer {
  return {
    id: raw.id,
    name: raw.fullName,
    mobile: raw.user?.phone ?? "—",
    email: raw.user?.email ?? "—",
    registrationDate: raw.createdAt,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalSpending: 0,
    status: toAccountStatus(raw.user?.status),
    addresses: raw.address ? [toAddress(raw.address)] : [],
  };
}

export function mapOrder(raw: ApiOrder): Order {
  const items: OrderItem[] =
    raw.subOrders?.flatMap((sub) =>
      (sub.items ?? []).map((item) => ({
        productId: "",
        productName: item.productName ?? "Item",
        quantity: item.quantity ?? 1,
        price: toNumber(item.unitPrice ?? item.price),
      })),
    ) ?? [];

  return {
    id: raw.orderNumber ?? raw.id,
    parentOrderId: raw.id,
    isParent: true,
    customerId: raw.customerId,
    customerName: raw.customer?.fullName ?? "—",
    cityId: "",
    cityName: "—",
    status: toOrderStatus(raw.status),
    paymentStatus: raw.paymentStatus as Order["paymentStatus"],
    items,
    subtotal: toNumber(raw.subtotal),
    discount: toNumber(raw.discountTotal),
    deliveryFee: toNumber(raw.deliveryFee),
    platformFee: toNumber(raw.platformFee),
    handlingFee:
      raw.chargeBreakdown?.find((c) => c.code === "HANDLING_FEE")?.amount ??
      raw.chargeBreakdown?.reduce((sum, c) => sum + c.amount, 0) ??
      0,
    chargeBreakdown: raw.chargeBreakdown?.map((c) => ({
      code: c.code,
      name: c.name,
      amount: c.amount,
    })),
    tax: toNumber(raw.taxTotal),
    total: toNumber(raw.totalPayable),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}

export function mapSeller(raw: ApiSeller): IndependentSeller {
  const profile = raw.sellerProfile;
  return {
    id: raw.id,
    name: profile?.fullName ?? raw.businessName,
    businessName: raw.businessName,
    mobile: profile?.user?.phone ?? "—",
    email: profile?.user?.email ?? "—",
    pickupLocation: toAddress(undefined, raw.pickupLat, raw.pickupLng),
    registrationDate: raw.createdAt,
    status: toAccountStatus(raw.status),
    productsCount: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalSales: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    features: defaultFeatures,
  };
}

export function mapPartner(raw: ApiPartner): DeliveryPartner {
  return {
    id: raw.id,
    name: raw.fullName,
    phone: raw.user?.phone ?? "—",
    email: raw.user?.email ?? "—",
    vehicleType: "—",
    preference: (raw.preference as DeliveryPartner["preference"]) ?? "BOTH",
    status: toAccountStatus(raw.user?.status),
    zoneId: "",
    zoneName: "—",
    cityId: "",
    isOnline: raw.isOnline,
    currentLat: toNumber(raw.currentLat),
    currentLng: toNumber(raw.currentLng),
    todayDeliveries: 0,
    totalDeliveries: 0,
    todayEarnings: 0,
    totalEarnings: 0,
    rating: 0,
    features: defaultFeatures,
  };
}

export function mapProduct(raw: ApiProduct): Product {
  return {
    id: raw.id,
    name: raw.title,
    sku: raw.masterProduct?.sku ?? raw.id.slice(0, 8),
    categoryId: raw.masterProduct?.category?.id ?? "",
    categoryName: raw.masterProduct?.category?.name ?? "—",
    storeId: raw.storeId ?? undefined,
    storeName: raw.store?.name,
    sellerId: raw.independentSellerId ?? undefined,
    sellerName: raw.independentSeller?.businessName,
    price: toNumber(raw.sellingPrice),
    stock: raw.inventory?.quantity ?? 0,
    status: raw.isActive ? "APPROVED" : "DISABLED",
    createdAt: raw.createdAt,
  };
}

export function mapPayout(raw: ApiPayout): Payout {
  const amount = toNumber(raw.amount);
  const name = typeof raw.metadata?.recipientName === "string" ? raw.metadata.recipientName : "—";
  return {
    id: raw.id,
    type: raw.beneficiaryType === "DELIVERY_PARTNER" ? "DELIVERY_PARTNER" : "SELLER",
    recipientId: raw.beneficiaryId,
    recipientName: name,
    grossSales: amount,
    commission: 0,
    refunds: 0,
    platformCharges: 0,
    netPayable: amount,
    status: raw.status as Payout["status"],
    createdAt: raw.createdAt,
    processedAt: raw.approvedAt ?? undefined,
  };
}

export function mapBanner(raw: ApiBanner): Banner {
  const placement = raw.placement ?? "HOME_TOP";
  return {
    id: raw.id,
    title: raw.title,
    imageUrl: raw.imageUrl,
    linkUrl: raw.linkUrl ?? undefined,
    placement:
      placement === "HOME_MIDDLE" || placement === "CATEGORY" ? placement : "HOME_TOP",
    sortOrder: raw.sortOrder ?? 0,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
  };
}

export function mapCategory(raw: ApiCategory): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    parentId: raw.parentId ?? null,
    displayOrder: raw.sortOrder,
    enabled: raw.isActive,
  };
}

export function mapCoupon(raw: ApiCoupon): Coupon {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name ?? raw.code,
    type: raw.type === "FIXED" || raw.type === "PERCENTAGE" ? raw.type : "FIXED",
    value: toNumber(raw.value),
    minCart: toNumber(raw.minOrderAmount),
    maxDiscount: raw.maxDiscount ? toNumber(raw.maxDiscount) : undefined,
    usageLimit: raw.usageLimit ?? 0,
    usedCount: raw.usedCount ?? 0,
    perCustomerLimit: raw.perCustomerLimit ?? 1,
    scopeType: (raw.scopeType as Coupon["scopeType"]) ?? "GLOBAL",
    storeId: raw.storeId ?? undefined,
    independentSellerId: raw.independentSellerId ?? undefined,
    fundingSource: (raw.fundingSource as Coupon["fundingSource"]) ?? "PLATFORM",
    startDate: raw.startsAt ?? undefined,
    endDate: raw.expiresAt ?? undefined,
    enabled: raw.isActive,
  };
}

export function mapOffer(raw: ApiOffer): Offer {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? undefined,
    imageUrl: raw.imageUrl ?? undefined,
    discountPercent: raw.discountPercent ? toNumber(raw.discountPercent) : undefined,
    linkedCouponCode: raw.linkedCouponCode ?? undefined,
    startDate: raw.startsAt ?? undefined,
    endDate: raw.expiresAt ?? undefined,
    status: (raw.status as Offer["status"]) ?? "ACTIVE",
  };
}

export function mapFeatureFlag(raw: ApiFeatureFlag): FeatureFlag {
  return {
    key: raw.key,
    label: raw.name,
    description: raw.description ?? "",
    enabled: raw.isEnabled,
  };
}

export function mapOverviewToDashboardStats(overview: ApiOverview): DashboardStats {
  const sellerTotal = overview.independentSellers.total;
  const storeTotal = overview.stores.total;
  return {
    totalCustomers: overview.users.total,
    activeCustomers: overview.users.active,
    totalSellers: storeTotal + sellerTotal,
    activeSellers: overview.stores.active + overview.independentSellers.active,
    suspendedSellers: overview.stores.suspended + (sellerTotal - overview.independentSellers.active - overview.independentSellers.pendingVerification),
    totalStores: storeTotal,
    activeStores: overview.stores.active,
    closedStores: overview.stores.inactive,
    totalIndependentSellers: sellerTotal,
    totalDeliveryPartners: overview.delivery.totalPartners,
    onlineDeliveryPartners: overview.delivery.onlinePartners,
    offlineDeliveryPartners: Math.max(0, overview.delivery.totalPartners - overview.delivery.onlinePartners),
    activeDeliveryPartners: overview.delivery.totalPartners,
    totalOrders: overview.orders.active,
    todayOrders: overview.orders.today,
    pendingOrders: overview.orders.active - overview.orders.delivered - overview.orders.cancelled,
    completedOrders: overview.orders.delivered,
    cancelledOrders: overview.orders.cancelled,
    failedOrders: 0,
    totalGMV: overview.finance.totalGmv,
    todayGMV: overview.finance.todayGmv,
    totalPlatformRevenue: overview.finance.platformRevenue,
    todayPlatformRevenue: overview.finance.todayGmv * 0.05,
    totalSellerEarnings: overview.finance.sellerPayables,
    totalDeliveryPartnerEarnings: overview.finance.deliveryPartnerPayables,
  };
}

export function mapFinanceSummary(summary: {
  platformRevenue?: number;
  commission?: number;
  chargeCollection?: number;
  sellerPayables?: number;
  deliveryPayables?: number;
  deliveryPartnerPayables?: number;
  pendingPayments?: number;
  refunds?: number;
}): FinanceStats {
  return {
    totalCustomerPayments: 0,
    pendingPayments: summary.pendingPayments ?? 0,
    successfulPayments: 0,
    failedPayments: 0,
    refunds: summary.refunds ?? 0,
    sellerPayables: summary.sellerPayables ?? 0,
    deliveryPartnerPayables: summary.deliveryPartnerPayables ?? summary.deliveryPayables ?? 0,
    platformRevenue: summary.platformRevenue ?? 0,
    commission: summary.commission ?? 0,
    taxes: 0,
    chargeCollection: summary.chargeCollection ?? summary.platformRevenue ?? 0,
  };
}

export type ApiChargeRule = {
  id: string;
  code: string;
  name: string;
  type: "FIXED" | "PERCENTAGE" | "FORMULA";
  value: number;
  conditions?: Record<string, unknown>;
  priority: number;
  isActive: boolean;
  createdAt: string;
};

export function mapChargeRule(rule: ApiChargeRule): import("@/lib/types").ChargeRule {
  const conditions = (rule.conditions ?? {}) as import("@/lib/types").ChargeRuleConditions;
  return {
    id: rule.id,
    code: rule.code,
    name: rule.name,
    type: rule.type === "FORMULA" ? "FIXED" : rule.type,
    value: rule.value,
    conditions,
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt,
  };
}

export type ApiCommissionRule = {
  id: string;
  code?: string;
  name?: string;
  scope: "GLOBAL" | "STORE" | "SELLER";
  sellerType?: "STORE" | "INDEPENDENT" | null;
  targetId?: string | null;
  targetName?: string | null;
  type?: "PERCENTAGE" | "FIXED";
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority?: number;
  isActive?: boolean;
};

export function mapCommissionRule(rule: ApiCommissionRule): import("@/lib/types").CommissionRule {
  return {
    id: rule.id,
    code: rule.code,
    name: rule.name,
    scope: rule.scope === "SELLER" ? "SELLER" : rule.scope,
    sellerType: rule.sellerType ?? undefined,
    targetId: rule.targetId,
    targetName: rule.targetName,
    type: rule.type,
    rate: rule.rate,
    effectiveFrom: rule.effectiveFrom,
    effectiveTo: rule.effectiveTo,
    priority: rule.priority,
    isActive: rule.isActive,
  };
}

type ApiPartnerRequest = {
  userId: string;
  requestType: "KYC_ONBOARDING" | "DELIVERY_PARTNER";
  partnerType: "STORE" | "INDEPENDENT_SELLER" | "DELIVERY_PARTNER";
  name: string;
  phone?: string;
  email?: string;
  status: string;
  approvalStatus?: string;
  onboardingStep?: string;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  documentCount?: number;
  documents?: Array<{ id: string; type: string; uri: string; uploadedAt: string }>;
  businessDetails?: Record<string, unknown>;
  storeDetails?: Record<string, unknown>;
  sellerSetup?: Record<string, unknown>;
  bankDetails?: Record<string, unknown>;
  preference?: string;
};

export function mapPartnerRequest(raw: ApiPartnerRequest): PartnerRequest {
  return {
    userId: raw.userId,
    requestType: raw.requestType,
    partnerType: raw.partnerType,
    name: raw.name,
    phone: raw.phone,
    email: raw.email,
    status: raw.status as PartnerRequest["status"],
    approvalStatus: raw.approvalStatus as PartnerRequest["approvalStatus"],
    onboardingStep: raw.onboardingStep,
    rejectionReason: raw.rejectionReason,
    submittedAt: raw.submittedAt,
    reviewedAt: raw.reviewedAt,
    createdAt: raw.createdAt,
    documentCount: raw.documentCount,
    documents: raw.documents,
    businessDetails: raw.businessDetails,
    storeDetails: raw.storeDetails,
    sellerSetup: raw.sellerSetup,
    bankDetails: raw.bankDetails,
    preference: raw.preference,
  };
}

export function deriveCitiesFromStores(stores: Store[]): City[] {
  const seen = new Map<string, City>();
  for (const store of stores) {
    const city = store.address.city;
    if (!city || city === "Unknown" || seen.has(city)) continue;
    seen.set(city, {
      id: city.toLowerCase().replace(/\s+/g, "-"),
      name: city,
      state: store.address.state,
      lat: store.address.lat,
      lng: store.address.lng,
    });
  }
  return Array.from(seen.values());
}

export type {
  ApiStore,
  ApiCustomer,
  ApiOrder,
  ApiSeller,
  ApiPartner,
  ApiProduct,
  ApiPayout,
  ApiOverview,
  ApiPartnerRequest,
};
