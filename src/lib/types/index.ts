export type AccountStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING"
  | "BLOCKED";

export type AdminRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_MANAGER"
  | "SELLER_MANAGER"
  | "DELIVERY_MANAGER"
  | "FINANCE_MANAGER"
  | "SUPPORT_AGENT"
  | "CATALOG_MANAGER"
  | "MARKETING_MANAGER";

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "DELIVERY_ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "FAILED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type PayoutStatus =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "HELD";

export type DeliveryPreference = "STORE_ONLY" | "INDEPENDENT_ONLY" | "BOTH";

export type ProductStatus = "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";

export type PartnerRequestType = "KYC_ONBOARDING" | "DELIVERY_PARTNER";

export type PartnerRequestPartnerType =
  | "STORE"
  | "INDEPENDENT_SELLER"
  | "DELIVERY_PARTNER";

export type PartnerRequestStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

export interface PartnerRequestDocument {
  id: string;
  type: string;
  uri: string;
  uploadedAt: string;
}

export interface PartnerRequest {
  userId: string;
  requestType: PartnerRequestType;
  partnerType: PartnerRequestPartnerType;
  name: string;
  phone?: string;
  email?: string;
  status: PartnerRequestStatus;
  approvalStatus?: PartnerRequestStatus;
  onboardingStep?: string;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  documentCount?: number;
  documents?: PartnerRequestDocument[];
  businessDetails?: Record<string, unknown>;
  storeDetails?: Record<string, unknown>;
  sellerSetup?: Record<string, unknown>;
  bankDetails?: Record<string, unknown>;
  preference?: string;
}

export type ChargeType = "FIXED" | "PERCENTAGE" | "FORMULA";

export type CommissionScope =
  | "GLOBAL"
  | "STORE"
  | "SELLER"
  | "CATEGORY"
  | "PRODUCT";

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  name: string;
  cityId: string;
  polygon?: GeoLocation[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl?: string;
  displayOrder: number;
  enabled: boolean;
  children?: Category[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AccountStatus;
  lastLogin?: string;
  createdAt: string;
}

export interface FeatureAccess {
  login: boolean;
  productUpload: boolean;
  orders: boolean;
  delivery: boolean;
  payout: boolean;
  advertisements: boolean;
  multipleStores: boolean;
  staffManagement: boolean;
}

export interface Store {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  categoryId: string;
  categoryName: string;
  businessType: string;
  address: Address;
  registrationDate: string;
  status: AccountStatus;
  isOpen: boolean;
  totalProducts: number;
  todayOrders: number;
  totalOrders: number;
  todaySales: number;
  totalSales: number;
  platformCommission: number;
  commissionOverride?: number;
  rating: number;
  deliveryRadius: number;
  timings: string;
  features: FeatureAccess;
}

export interface IndependentSeller {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  pickupLocation: Address;
  registrationDate: string;
  status: AccountStatus;
  productsCount: number;
  totalOrders: number;
  todayOrders: number;
  totalSales: number;
  totalEarnings: number;
  pendingPayout: number;
  commissionOverride?: number;
  features: FeatureAccess;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  registrationDate: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpending: number;
  status: AccountStatus;
  addresses: Address[];
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  preference: DeliveryPreference;
  status: AccountStatus;
  zoneId: string;
  zoneName: string;
  cityId: string;
  isOnline: boolean;
  currentLat: number;
  currentLng: number;
  activeDeliveryId?: string;
  todayDeliveries: number;
  totalDeliveries: number;
  todayEarnings: number;
  totalEarnings: number;
  rating: number;
  features: FeatureAccess;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  storeId?: string;
  storeName?: string;
  sellerId?: string;
  sellerName?: string;
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface SubOrder {
  id: string;
  parentOrderId: string;
  storeId?: string;
  storeName?: string;
  sellerId?: string;
  sellerName?: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
}

export interface OrderChargeLine {
  code: string;
  name: string;
  amount: number;
}

export interface Order {
  id: string;
  parentOrderId?: string;
  isParent: boolean;
  subOrders?: SubOrder[];
  chargeBreakdown?: OrderChargeLine[];
  customerId: string;
  customerName: string;
  storeId?: string;
  storeName?: string;
  sellerId?: string;
  sellerName?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  cityId: string;
  cityName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  handlingFee: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
}

export interface AssignmentEvent {
  partnerId: string;
  partnerName: string;
  action: "NOTIFIED" | "ACCEPTED" | "DECLINED" | "TIMEOUT";
  timestamp: string;
}

export interface DeliveryAssignment {
  orderId: string;
  status: OrderStatus;
  eligiblePartners: number;
  notificationsSent: number;
  acceptedBy?: string;
  history: AssignmentEvent[];
}

export interface Cart {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  status: "ACTIVE" | "ABANDONED" | "CONVERTED";
  createdAt: string;
  updatedAt: string;
}

export interface ChargeRuleConditions {
  maxCartTotal?: number;
  minCartValue?: number;
  minDistanceKm?: number;
  maxDistanceKm?: number;
  zoneId?: string;
}

export interface ChargeRule {
  id: string;
  code: string;
  name: string;
  type: ChargeType;
  value: number;
  conditions: ChargeRuleConditions;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface ChargeCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  thenCharge: string;
  thenValue: number;
}

export interface DeliverySlab {
  minKm: number;
  maxKm: number | null;
  fee: number;
}

export interface DeliveryPricing {
  id: string;
  name: string;
  baseFee: number;
  minFee: number;
  maxFee: number;
  perKmFee: number;
  freeDeliveryThreshold?: number;
  slabs: DeliverySlab[];
  zoneId?: string;
  storeId?: string;
  enabled: boolean;
}

export interface CommissionRule {
  id: string;
  code?: string;
  name?: string;
  scope: CommissionScope;
  sellerType?: "STORE" | "INDEPENDENT";
  targetId?: string | null;
  targetName?: string | null;
  type?: "PERCENTAGE" | "FIXED";
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority?: number;
  isActive?: boolean;
}

export interface Payout {
  id: string;
  type: "SELLER" | "DELIVERY_PARTNER";
  recipientId: string;
  recipientName: string;
  grossSales: number;
  commission: number;
  refunds: number;
  platformCharges: number;
  netPayable: number;
  status: PayoutStatus;
  createdAt: string;
  processedAt?: string;
}

export type BannerPlacement = "HOME_TOP" | "HOME_MIDDLE" | "CATEGORY";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  placement: BannerPlacement;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  name: string;
  advertiser: string;
  campaign: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  placement: string;
  targetLocation: string;
  impressions: number;
  clicks: number;
  conversions: number;
  enabled: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minCart: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  scopeType: "GLOBAL" | "STORE" | "INDEPENDENT_SELLER";
  storeId?: string;
  independentSellerId?: string;
  fundingSource: "PLATFORM" | "SELLER";
  startDate?: string;
  endDate?: string;
  enabled: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  discountPercent?: number;
  linkedCouponCode?: string;
  startDate?: string;
  endDate?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  reason?: string;
  timestamp: string;
}

export interface PlatformEvent {
  id: string;
  type: string;
  message: string;
  entityType?: string;
  entityId?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  read: boolean;
  timestamp: string;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SystemSettings {
  platformName: string;
  logoUrl?: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  minOrderValue: number;
  maxOrderValue: number;
  defaultDeliveryRadius: number;
  defaultCommission: number;
  defaultPlatformFee: number;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalSellers: number;
  activeSellers: number;
  suspendedSellers: number;
  totalStores: number;
  activeStores: number;
  closedStores: number;
  totalIndependentSellers: number;
  totalDeliveryPartners: number;
  onlineDeliveryPartners: number;
  offlineDeliveryPartners: number;
  activeDeliveryPartners: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  failedOrders: number;
  totalGMV: number;
  todayGMV: number;
  totalPlatformRevenue: number;
  todayPlatformRevenue: number;
  totalSellerEarnings: number;
  totalDeliveryPartnerEarnings: number;
}

export interface FinanceStats {
  totalCustomerPayments: number;
  pendingPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refunds: number;
  sellerPayables: number;
  deliveryPartnerPayables: number;
  platformRevenue: number;
  commission: number;
  taxes: number;
  chargeCollection: number;
}

export interface CartAnalytics {
  activeCarts: number;
  abandonedCarts: number;
  averageCartValue: number;
  conversionRate: number;
  cartDropRate: number;
  mostAddedProducts: { name: string; count: number }[];
  mostAbandonedProducts: { name: string; count: number }[];
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface ListFilters {
  search?: string;
  city?: string;
  state?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  salesMin?: number;
  salesMax?: number;
  ordersMin?: number;
  ordersMax?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
