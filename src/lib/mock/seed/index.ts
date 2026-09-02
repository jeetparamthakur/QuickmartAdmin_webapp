import type {
  AccountStatus,
  Address,
  AdminUser,
  Advertisement,
  AuditLog,
  Banner,
  Cart,
  CartAnalytics,
  Category,
  ChargeCondition,
  ChargeRule,
  City,
  CommissionRule,
  Coupon,
  Customer,
  DashboardStats,
  DeliveryAssignment,
  DeliveryPartner,
  DeliveryPricing,
  FeatureFlag,
  FinanceStats,
  IndependentSeller,
  Notification,
  Order,
  OrderStatus,
  Payout,
  PlatformEvent,
  Product,
  Store,
  SystemSettings,
  Zone,
} from "@/lib/types";

const CITIES: City[] = [
  { id: "city-1", name: "Ludhiana", state: "Punjab", lat: 30.901, lng: 75.8573 },
  { id: "city-2", name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { id: "city-3", name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { id: "city-4", name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { id: "city-5", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
];

const ZONES: Zone[] = CITIES.flatMap((city, ci) =>
  Array.from({ length: 3 }, (_, zi) => ({
    id: `zone-${ci * 3 + zi + 1}`,
    name: `${city.name} Zone ${zi + 1}`,
    cityId: city.id,
  }))
);

const CATEGORIES: Category[] = [
  { id: "cat-1", name: "Grocery", slug: "grocery", parentId: null, displayOrder: 1, enabled: true },
  { id: "cat-2", name: "Beverages", slug: "beverages", parentId: "cat-1", displayOrder: 1, enabled: true },
  { id: "cat-3", name: "Cold Drinks", slug: "cold-drinks", parentId: "cat-2", displayOrder: 1, enabled: true },
  { id: "cat-4", name: "Pharmacy", slug: "pharmacy", parentId: null, displayOrder: 2, enabled: true },
  { id: "cat-5", name: "Electronics", slug: "electronics", parentId: null, displayOrder: 3, enabled: true },
  { id: "cat-6", name: "Restaurant", slug: "restaurant", parentId: null, displayOrder: 4, enabled: true },
  { id: "cat-7", name: "Fashion", slug: "fashion", parentId: null, displayOrder: 5, enabled: true },
  { id: "cat-8", name: "Dairy", slug: "dairy", parentId: "cat-1", displayOrder: 2, enabled: true },
];

const STORE_NAMES = [
  "ABC Supermarket", "Fresh Mart", "Daily Needs", "City Grocery", "Quick Shop",
  "MedPlus Pharmacy", "HealthCare Store", "MediQuick", "Tech Hub", "Gadget World",
  "Spice Kitchen", "Food Express", "Burger Point", "Style Store", "Fashion Hub",
];

const SELLER_FIRST = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anita", "Raj", "Kavita"];
const SELLER_LAST = ["Sharma", "Patel", "Singh", "Gupta", "Kumar", "Verma", "Reddy", "Joshi"];

const CUSTOMER_FIRST = ["Arjun", "Neha", "Rohan", "Pooja", "Karan", "Divya", "Suresh", "Meera"];
const PARTNER_FIRST = ["Ravi", "Sunil", "Deepak", "Manoj", "Ajay", "Sanjay", "Naveen", "Gopal"];

const STATUSES: AccountStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "PENDING", "SUSPENDED", "INACTIVE"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeAddress(city: City, i: number): Address {
  const offset = i * 0.01;
  return {
    line1: `${100 + i} Main Street`,
    city: city.name,
    state: city.state,
    pincode: `${141000 + i}`,
    lat: city.lat + (Math.random() - 0.5) * 0.1 + offset * 0.001,
    lng: city.lng + (Math.random() - 0.5) * 0.1 + offset * 0.001,
  };
}

function defaultFeatures(active = true) {
  return {
    login: active,
    productUpload: active,
    orders: active,
    delivery: active,
    payout: active,
    advertisements: active,
    multipleStores: Math.random() > 0.7,
    staffManagement: Math.random() > 0.5,
  };
}

function generateStores(): Store[] {
  return Array.from({ length: 85 }, (_, i) => {
    const city = CITIES[i % CITIES.length];
    const cat = CATEGORIES[i % 6];
    const status = randomFrom(STATUSES);
    const isOpen = status === "ACTIVE" && Math.random() > 0.2;
    const totalOrders = randomInt(50, 5000);
    const totalSales = randomInt(50000, 5000000);
    return {
      id: `store-${i + 1}`,
      name: `${STORE_NAMES[i % STORE_NAMES.length]} ${Math.floor(i / STORE_NAMES.length) || ""}`.trim(),
      ownerName: `${randomFrom(SELLER_FIRST)} ${randomFrom(SELLER_LAST)}`,
      ownerPhone: `9${randomInt(100000000, 999999999)}`,
      ownerEmail: `owner${i + 1}@store.com`,
      categoryId: cat.id,
      categoryName: cat.name,
      businessType: cat.name,
      address: makeAddress(city, i),
      registrationDate: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
      status,
      isOpen,
      totalProducts: randomInt(20, 500),
      todayOrders: randomInt(0, 80),
      totalOrders,
      todaySales: randomInt(1000, 150000),
      totalSales,
      platformCommission: i % 5 === 0 ? 8 : 10,
      commissionOverride: i % 5 === 0 ? 8 : undefined,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      deliveryRadius: randomInt(3, 10),
      timings: "8:00 AM - 10:00 PM",
      features: defaultFeatures(status === "ACTIVE"),
    };
  });
}

function generateSellers(): IndependentSeller[] {
  return Array.from({ length: 45 }, (_, i) => {
    const city = CITIES[i % CITIES.length];
    const status = randomFrom(STATUSES);
    const totalSales = randomInt(10000, 800000);
    return {
      id: `seller-${i + 1}`,
      name: `${SELLER_FIRST[i % SELLER_FIRST.length]} ${SELLER_LAST[i % SELLER_LAST.length]}`,
      businessName: `${SELLER_FIRST[i % SELLER_FIRST.length]}'s Shop`,
      mobile: `9${randomInt(100000000, 999999999)}`,
      email: `seller${i + 1}@example.com`,
      pickupLocation: makeAddress(city, i + 100),
      registrationDate: new Date(2024, (i + 3) % 12, (i % 28) + 1).toISOString(),
      status,
      productsCount: randomInt(5, 80),
      totalOrders: randomInt(10, 800),
      todayOrders: randomInt(0, 15),
      totalSales,
      totalEarnings: Math.round(totalSales * 0.88),
      pendingPayout: randomInt(0, 50000),
      commissionOverride: i % 4 === 0 ? 12 : undefined,
      features: defaultFeatures(status === "ACTIVE"),
    };
  });
}

function generateCustomers(): Customer[] {
  return Array.from({ length: 220 }, (_, i) => {
    const city = CITIES[i % CITIES.length];
    const totalOrders = randomInt(0, 100);
    return {
      id: `customer-${i + 1}`,
      name: `${CUSTOMER_FIRST[i % CUSTOMER_FIRST.length]} ${SELLER_LAST[i % SELLER_LAST.length]}`,
      mobile: `9${randomInt(100000000, 999999999)}`,
      email: `customer${i + 1}@email.com`,
      registrationDate: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
      totalOrders,
      completedOrders: Math.floor(totalOrders * 0.85),
      cancelledOrders: Math.floor(totalOrders * 0.1),
      totalSpending: randomInt(0, 200000),
      status: randomFrom(STATUSES.slice(0, 4)),
      addresses: [makeAddress(city, i + 200)],
    };
  });
}

function generatePartners(): DeliveryPartner[] {
  return Array.from({ length: 65 }, (_, i) => {
    const city = CITIES[i % CITIES.length];
    const zone = ZONES.find((z) => z.cityId === city.id)!;
    const status = randomFrom(STATUSES);
    const isOnline = status === "ACTIVE" && Math.random() > 0.4;
    const prefs = ["STORE_ONLY", "INDEPENDENT_ONLY", "BOTH"] as const;
    return {
      id: `partner-${i + 1}`,
      name: `${PARTNER_FIRST[i % PARTNER_FIRST.length]} ${SELLER_LAST[i % SELLER_LAST.length]}`,
      phone: `9${randomInt(100000000, 999999999)}`,
      email: `partner${i + 1}@delivery.com`,
      vehicleType: randomFrom(["Bike", "Scooter", "Bicycle", "EV Bike"]),
      preference: prefs[i % 3],
      status,
      zoneId: zone.id,
      zoneName: zone.name,
      cityId: city.id,
      isOnline,
      currentLat: city.lat + (Math.random() - 0.5) * 0.08,
      currentLng: city.lng + (Math.random() - 0.5) * 0.08,
      activeDeliveryId: isOnline && Math.random() > 0.6 ? `order-${randomInt(1, 500)}` : undefined,
      todayDeliveries: randomInt(0, 25),
      totalDeliveries: randomInt(50, 3000),
      todayEarnings: randomInt(200, 3000),
      totalEarnings: randomInt(10000, 200000),
      rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
      features: defaultFeatures(status === "ACTIVE"),
    };
  });
}

function generateProducts(stores: Store[], sellers: IndependentSeller[]): Product[] {
  const products: Product[] = [];
  const productNames = ["Rice 1kg", "Milk 1L", "Bread", "Eggs Dozen", "Tomatoes 500g", "Onions 1kg", "Cooking Oil", "Sugar 1kg", "Tea 250g", "Biscuits", "Soap", "Shampoo", "Phone Case", "USB Cable", "T-Shirt", "Jeans"];
  const statuses = ["APPROVED", "APPROVED", "APPROVED", "PENDING", "REJECTED", "DISABLED"] as const;

  stores.slice(0, 60).forEach((store, si) => {
    const count = randomInt(5, 8);
    for (let j = 0; j < count; j++) {
      const idx = products.length;
      products.push({
        id: `product-${idx + 1}`,
        name: productNames[(si + j) % productNames.length],
        sku: `SKU-${idx + 1000}`,
        categoryId: store.categoryId,
        categoryName: store.categoryName,
        storeId: store.id,
        storeName: store.name,
        price: randomInt(20, 2000),
        stock: randomInt(0, 200),
        status: randomFrom([...statuses]),
        createdAt: new Date(2024, j % 12, (j % 28) + 1).toISOString(),
      });
    }
  });

  sellers.slice(0, 30).forEach((seller, si) => {
    const count = randomInt(3, 6);
    for (let j = 0; j < count; j++) {
      const idx = products.length;
      products.push({
        id: `product-${idx + 1}`,
        name: productNames[(si + j + 5) % productNames.length],
        sku: `SKU-${idx + 1000}`,
        categoryId: CATEGORIES[si % CATEGORIES.length].id,
        categoryName: CATEGORIES[si % CATEGORIES.length].name,
        sellerId: seller.id,
        sellerName: seller.businessName,
        price: randomInt(50, 1500),
        stock: randomInt(0, 50),
        status: randomFrom([...statuses]),
        createdAt: new Date(2024, j % 12, (j % 28) + 1).toISOString(),
      });
    }
  });

  return products;
}

const ORDER_STATUSES: OrderStatus[] = [
  "PLACED", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP",
  "DELIVERY_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED",
  "CANCELLED", "REFUNDED", "FAILED",
];

function generateOrders(stores: Store[], sellers: IndependentSeller[], customers: Customer[], partners: DeliveryPartner[]): Order[] {
  const orders: Order[] = [];

  for (let i = 0; i < 520; i++) {
    const customer = customers[i % customers.length];
    const city = CITIES[i % CITIES.length];
    const isMultiVendor = i % 8 === 0;
    const status = ORDER_STATUSES[i % ORDER_STATUSES.length];
    const subtotal = randomInt(200, 5000);
    const discount = randomInt(0, Math.floor(subtotal * 0.2));
    const deliveryFee = randomInt(20, 80);
    const platformFee = randomInt(5, 25);
    const handlingFee = randomInt(0, 15);
    const tax = Math.round((subtotal - discount) * 0.05);
    const total = subtotal - discount + deliveryFee + platformFee + handlingFee + tax;
    const createdAt = new Date(2025, 8, (i % 30) + 1, randomInt(8, 22), randomInt(0, 59)).toISOString();

    if (isMultiVendor) {
      const store = stores[i % stores.length];
      const seller = sellers[i % sellers.length];
      const parentId = `order-${i + 1}`;
      const sub1Total = Math.round(subtotal * 0.6);
      const sub2Total = subtotal - sub1Total;

      orders.push({
        id: parentId,
        isParent: true,
        customerId: customer.id,
        customerName: customer.name,
        cityId: city.id,
        cityName: city.name,
        status,
        paymentStatus: status === "FAILED" ? "FAILED" : status === "REFUNDED" ? "REFUNDED" : "SUCCESS",
        items: [],
        subtotal,
        discount,
        deliveryFee,
        platformFee,
        handlingFee,
        tax,
        total,
        createdAt,
        updatedAt: createdAt,
        subOrders: [
          {
            id: `${parentId}-sub-1`,
            parentOrderId: parentId,
            storeId: store.id,
            storeName: store.name,
            items: [{ productId: "p1", productName: "Rice 1kg", quantity: 2, price: 80 }],
            status,
            subtotal: sub1Total,
          },
          {
            id: `${parentId}-sub-2`,
            parentOrderId: parentId,
            sellerId: seller.id,
            sellerName: seller.businessName,
            items: [{ productId: "p2", productName: "Handmade Craft", quantity: 1, price: sub2Total }],
            status,
            subtotal: sub2Total,
          },
        ],
      });
    } else {
      const useStore = i % 3 !== 0;
      const store = useStore ? stores[i % stores.length] : undefined;
      const seller = !useStore ? sellers[i % sellers.length] : undefined;
      const partner = partners[i % partners.length];

      orders.push({
        id: `order-${i + 1}`,
        isParent: false,
        customerId: customer.id,
        customerName: customer.name,
        storeId: store?.id,
        storeName: store?.name,
        sellerId: seller?.id,
        sellerName: seller?.businessName,
        deliveryPartnerId: ["DELIVERY_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? partner.id : undefined,
        deliveryPartnerName: ["DELIVERY_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? partner.name : undefined,
        cityId: city.id,
        cityName: city.name,
        status,
        paymentStatus: status === "FAILED" ? "FAILED" : status === "REFUNDED" ? "REFUNDED" : "SUCCESS",
        items: [{ productId: "p1", productName: "Product Item", quantity: randomInt(1, 5), price: randomInt(50, 500) }],
        subtotal,
        discount,
        deliveryFee,
        platformFee,
        handlingFee,
        tax,
        total,
        createdAt,
        updatedAt: createdAt,
        pickupLat: store?.address.lat ?? seller?.pickupLocation.lat,
        pickupLng: store?.address.lng ?? seller?.pickupLocation.lng,
        deliveryLat: customer.addresses[0]?.lat,
        deliveryLng: customer.addresses[0]?.lng,
      });
    }
  }
  return orders;
}

function generateCarts(customers: Customer[]): Cart[] {
  return Array.from({ length: 120 }, (_, i) => {
    const customer = customers[i % customers.length];
    const subtotal = randomInt(100, 3000);
    const status = randomFrom(["ACTIVE", "ABANDONED", "CONVERTED"] as const);
    const created = new Date(2025, 8, randomInt(1, 30)).toISOString();
    return {
      id: `cart-${i + 1}`,
      customerId: customer.id,
      customerName: customer.name,
      items: [{ productId: "p1", productName: randomFrom(["Rice 1kg", "Milk 1L", "Bread", "Eggs"]), quantity: randomInt(1, 4), price: randomInt(30, 200) }],
      subtotal,
      status,
      createdAt: created,
      updatedAt: created,
    };
  });
}

function generatePayouts(stores: Store[], sellers: IndependentSeller[], partners: DeliveryPartner[]): Payout[] {
  const payouts: Payout[] = [];
  const statuses = ["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "FAILED", "HELD"] as const;

  [...stores.slice(0, 25), ...sellers.slice(0, 15)].forEach((entity, i) => {
    const isStore = "ownerName" in entity;
    const gross = randomInt(10000, 500000);
    const commission = Math.round(gross * 0.1);
    const refunds = randomInt(0, 5000);
    const charges = randomInt(500, 5000);
    payouts.push({
      id: `payout-${i + 1}`,
      type: "SELLER",
      recipientId: entity.id,
      recipientName: isStore ? entity.name : entity.businessName,
      grossSales: gross,
      commission,
      refunds,
      platformCharges: charges,
      netPayable: gross - commission - refunds - charges,
      status: statuses[i % statuses.length],
      createdAt: new Date(2025, 7, (i % 28) + 1).toISOString(),
    });
  });

  partners.slice(0, 15).forEach((partner, i) => {
    const gross = randomInt(5000, 80000);
    payouts.push({
      id: `payout-partner-${i + 1}`,
      type: "DELIVERY_PARTNER",
      recipientId: partner.id,
      recipientName: partner.name,
      grossSales: gross,
      commission: 0,
      refunds: 0,
      platformCharges: Math.round(gross * 0.15),
      netPayable: Math.round(gross * 0.85),
      status: statuses[i % statuses.length],
      createdAt: new Date(2025, 7, (i % 28) + 1).toISOString(),
    });
  });

  return payouts;
}

function generateCharges(): ChargeRule[] {
  return [
    { id: "charge-1", name: "Platform Fee", type: "FIXED", value: 5, applicability: "All Orders", conditions: "None", effectiveFrom: "2024-01-01", enabled: true, visibleInCart: true, visibleInCheckout: true, visibleInInvoice: true },
    { id: "charge-2", name: "Handling Fee", type: "FIXED", value: 10, applicability: "Grocery Orders", conditions: "Category = Grocery", minCartValue: 100, effectiveFrom: "2024-01-01", enabled: true, visibleInCart: true, visibleInCheckout: true, visibleInInvoice: true },
    { id: "charge-3", name: "Small Order Fee", type: "FIXED", value: 20, applicability: "Orders below ₹200", conditions: "Cart Total < ₹200", maxCharge: 20, effectiveFrom: "2024-06-01", enabled: true, visibleInCart: false, visibleInCheckout: true, visibleInInvoice: true },
    { id: "charge-4", name: "Peak Hour Fee", type: "FIXED", value: 10, applicability: "7 PM - 10 PM", conditions: "Time Between 7 PM - 10 PM", effectiveFrom: "2024-01-01", enabled: true, visibleInCart: true, visibleInCheckout: true, visibleInInvoice: true },
    { id: "charge-5", name: "Convenience Fee", type: "PERCENTAGE", value: 2, applicability: "All Orders", conditions: "Minimum Cart ₹100", minCartValue: 100, maxCharge: 50, effectiveFrom: "2024-01-01", enabled: true, visibleInCart: true, visibleInCheckout: true, visibleInInvoice: true },
    { id: "charge-6", name: "Packaging Fee", type: "FIXED", value: 8, applicability: "Restaurant Orders", conditions: "Category = Restaurant", effectiveFrom: "2024-01-01", enabled: true, visibleInCart: true, visibleInCheckout: true, visibleInInvoice: true },
  ];
}

function generateChargeConditions(): ChargeCondition[] {
  return [
    { id: "cond-1", field: "distance", operator: ">", value: "5 KM", thenCharge: "Distance Fee", thenValue: 10 },
    { id: "cond-2", field: "cartTotal", operator: "<", value: "₹200", thenCharge: "Small Order Fee", thenValue: 20 },
    { id: "cond-3", field: "time", operator: "between", value: "7 PM - 10 PM", thenCharge: "Peak Fee", thenValue: 10 },
    { id: "cond-4", field: "category", operator: "=", value: "Grocery", thenCharge: "Handling Fee", thenValue: 5 },
  ];
}

function generateDeliveryPricing(): DeliveryPricing[] {
  return [
    {
      id: "dp-1", name: "Default Delivery", baseFee: 20, minFee: 15, maxFee: 100, perKmFee: 5,
      freeDeliveryThreshold: 500, enabled: true,
      slabs: [
        { minKm: 0, maxKm: 2, fee: 20 },
        { minKm: 2, maxKm: 5, fee: 30 },
        { minKm: 5, maxKm: 8, fee: 45 },
        { minKm: 8, maxKm: null, fee: 60 },
      ],
    },
    {
      id: "dp-2", name: "Ludhiana Zone 1", baseFee: 15, minFee: 10, maxFee: 80, perKmFee: 4,
      freeDeliveryThreshold: 399, zoneId: "zone-1", enabled: true,
      slabs: [
        { minKm: 0, maxKm: 3, fee: 15 },
        { minKm: 3, maxKm: null, fee: 35 },
      ],
    },
  ];
}

function generateCommissions(stores: Store[]): CommissionRule[] {
  const rules: CommissionRule[] = [
    { id: "comm-1", scope: "GLOBAL", rate: 10, effectiveFrom: "2024-01-01" },
    { id: "comm-2", scope: "CATEGORY", targetId: "cat-1", targetName: "Grocery", rate: 8, effectiveFrom: "2024-01-01" },
    { id: "comm-3", scope: "CATEGORY", targetId: "cat-6", targetName: "Restaurant", rate: 15, effectiveFrom: "2024-01-01" },
  ];
  stores.slice(0, 5).forEach((s, i) => {
    rules.push({ id: `comm-store-${i}`, scope: "STORE", targetId: s.id, targetName: s.name, rate: 8, effectiveFrom: "2024-06-01" });
  });
  return rules;
}

function generateBanners(): Banner[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `banner-${i + 1}`,
    title: `Promo Banner ${i + 1}`,
    mobileImageUrl: `/banners/mobile-${i + 1}.jpg`,
    webImageUrl: `/banners/web-${i + 1}.jpg`,
    position: randomFrom(["HOME_TOP", "HOME_MIDDLE", "CATEGORY_TOP"]),
    startDate: "2025-09-01",
    endDate: "2025-10-31",
    enabled: i < 6,
    redirectType: randomFrom(["PRODUCT", "STORE", "CATEGORY", "CAMPAIGN"] as const),
    redirectTarget: `target-${i + 1}`,
    impressions: randomInt(1000, 50000),
    clicks: randomInt(50, 5000),
  }));
}

function generateAds(): Advertisement[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `ad-${i + 1}`,
    name: `Campaign ${i + 1}`,
    advertiser: randomFrom(STORE_NAMES),
    campaign: `Summer Sale ${i + 1}`,
    budget: randomInt(10000, 100000),
    spent: randomInt(1000, 80000),
    startDate: "2025-08-01",
    endDate: "2025-09-30",
    placement: randomFrom(["HOMEPAGE", "CATEGORY", "SEARCH", "SPONSORED_PRODUCTS"]),
    targetLocation: randomFrom(CITIES.map((c) => c.name)),
    impressions: randomInt(5000, 100000),
    clicks: randomInt(200, 10000),
    conversions: randomInt(10, 500),
    enabled: i < 7,
  }));
}

function generateCoupons(): Coupon[] {
  return [
    { id: "coupon-1", code: "WELCOME50", type: "FLAT", value: 50, minCart: 299, usageLimit: 1000, usedCount: 342, perCustomerLimit: 1, startDate: "2025-01-01", endDate: "2025-12-31", enabled: true },
    { id: "coupon-2", code: "SAVE10", type: "PERCENTAGE", value: 10, minCart: 500, maxDiscount: 100, usageLimit: 5000, usedCount: 1200, perCustomerLimit: 3, startDate: "2025-01-01", endDate: "2025-12-31", enabled: true },
    { id: "coupon-3", code: "FREEDEL", type: "FREE_DELIVERY", value: 0, minCart: 399, usageLimit: 2000, usedCount: 890, perCustomerLimit: 2, startDate: "2025-06-01", endDate: "2025-12-31", enabled: true },
    { id: "coupon-4", code: "FIRST100", type: "FIRST_ORDER", value: 100, minCart: 199, usageLimit: 10000, usedCount: 4500, perCustomerLimit: 1, startDate: "2025-01-01", endDate: "2025-12-31", enabled: true },
  ];
}

function generateAdminUsers(): AdminUser[] {
  const roles = ["SUPER_ADMIN", "OPERATIONS_MANAGER", "SELLER_MANAGER", "DELIVERY_MANAGER", "FINANCE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "MARKETING_MANAGER"] as const;
  return roles.map((role, i) => ({
    id: `admin-${i + 1}`,
    name: `${CUSTOMER_FIRST[i]} Admin`,
    email: `${role.toLowerCase().replace(/_/g, ".")}@m3ad.com`,
    role,
    status: "ACTIVE" as const,
    lastLogin: new Date(2025, 8, 1, 9 + i).toISOString(),
    createdAt: new Date(2024, 0, 1).toISOString(),
  }));
}

function generateAuditLogs(stores: Store[], admins: AdminUser[]): AuditLog[] {
  const actions = ["Store Suspended", "Orders Disabled", "Payout Approved", "Product Rejected", "Partner Activated", "Commission Changed", "Charge Enabled"];
  return Array.from({ length: 200 }, (_, i) => ({
    id: `audit-${i + 1}`,
    adminId: admins[i % admins.length].id,
    adminName: admins[i % admins.length].name,
    action: actions[i % actions.length],
    entityType: randomFrom(["Store", "Seller", "Partner", "Product", "Payout", "Charge"]),
    entityId: stores[i % stores.length].id,
    entityName: stores[i % stores.length].name,
    reason: i % 3 === 0 ? "Policy Violation" : undefined,
    timestamp: new Date(2025, 8, (i % 30) + 1, randomInt(8, 20), randomInt(0, 59)).toISOString(),
  }));
}

function generateNotifications(): Notification[] {
  return [
    { id: "notif-1", type: "CANCELLATION_SPIKE", title: "High Order Cancellation", message: "Cancellation rate increased 15% in Ludhiana", severity: "warning", read: false, timestamp: new Date().toISOString() },
    { id: "notif-2", type: "STORE_OFFLINE", title: "Store Offline", message: "ABC Supermarket went offline unexpectedly", severity: "info", read: false, timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: "notif-3", type: "LOW_PARTNERS", title: "Low Delivery Availability", message: "Only 12 partners online in Zone 1", severity: "error", read: true, timestamp: new Date(Date.now() - 600000).toISOString() },
    { id: "notif-4", type: "PAYMENT_FAILURE", title: "Payment Failure Spike", message: "Payment failures up 8% in last hour", severity: "warning", read: false, timestamp: new Date(Date.now() - 900000).toISOString() },
    { id: "notif-5", type: "REFUND_RATE", title: "High Refund Rate", message: "Refund rate above threshold for Store ABC", severity: "warning", read: true, timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: "notif-6", type: "PAYOUT_FAILURE", title: "Payout Failed", message: "Payout #payout-12 failed for Fresh Mart", severity: "error", read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
  ];
}

function generateEvents(): PlatformEvent[] {
  const types = [
    { type: "CUSTOMER_REGISTERED", message: "New Customer Registered" },
    { type: "STORE_CREATED", message: "Store Created" },
    { type: "ORDER_PLACED", message: "Order Placed" },
    { type: "PARTNER_ACCEPTED", message: "Delivery Partner Accepted Order" },
    { type: "ORDER_DELIVERED", message: "Order Delivered" },
    { type: "PARTNER_ONLINE", message: "Delivery Partner Online" },
  ];
  return Array.from({ length: 30 }, (_, i) => {
    const t = types[i % types.length];
    return {
      id: `event-${i + 1}`,
      type: t.type,
      message: t.message,
      entityType: t.type.includes("ORDER") ? "Order" : t.type.includes("STORE") ? "Store" : "Customer",
      entityId: `entity-${i + 1}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
    };
  });
}

function generateAssignments(orders: Order[], partners: DeliveryPartner[]): DeliveryAssignment[] {
  return orders
    .filter((o) => o.status === "READY_FOR_PICKUP" || o.status === "DELIVERY_ASSIGNED")
    .slice(0, 20)
    .map((order, i) => ({
      orderId: order.id,
      status: order.status,
      eligiblePartners: randomInt(8, 20),
      notificationsSent: randomInt(3, 8),
      acceptedBy: order.deliveryPartnerName,
      history: [
        { partnerId: partners[i % partners.length].id, partnerName: partners[i % partners.length].name, action: "NOTIFIED" as const, timestamp: new Date(Date.now() - 600000).toISOString() },
        { partnerId: partners[(i + 1) % partners.length].id, partnerName: partners[(i + 1) % partners.length].name, action: "DECLINED" as const, timestamp: new Date(Date.now() - 540000).toISOString() },
        { partnerId: partners[(i + 2) % partners.length].id, partnerName: partners[(i + 2) % partners.length].name, action: "TIMEOUT" as const, timestamp: new Date(Date.now() - 480000).toISOString() },
        ...(order.deliveryPartnerName ? [{ partnerId: order.deliveryPartnerId!, partnerName: order.deliveryPartnerName, action: "ACCEPTED" as const, timestamp: new Date(Date.now() - 420000).toISOString() }] : []),
      ],
    }));
}

function computeDashboardStats(stores: Store[], sellers: IndependentSeller[], customers: Customer[], partners: DeliveryPartner[], orders: Order[]): DashboardStats {
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today || o.createdAt.startsWith("2025-09-01"));
  return {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "ACTIVE").length,
    totalSellers: stores.length + sellers.length,
    activeSellers: [...stores, ...sellers].filter((s) => s.status === "ACTIVE").length,
    suspendedSellers: [...stores, ...sellers].filter((s) => s.status === "SUSPENDED").length,
    totalStores: stores.length,
    activeStores: stores.filter((s) => s.status === "ACTIVE").length,
    closedStores: stores.filter((s) => !s.isOpen).length,
    totalIndependentSellers: sellers.length,
    totalDeliveryPartners: partners.length,
    onlineDeliveryPartners: partners.filter((p) => p.isOnline).length,
    offlineDeliveryPartners: partners.filter((p) => !p.isOnline).length,
    activeDeliveryPartners: partners.filter((p) => p.status === "ACTIVE").length,
    totalOrders: orders.length,
    todayOrders: todayOrders.length || randomInt(180, 350),
    pendingOrders: orders.filter((o) => ["PLACED", "ACCEPTED", "PREPARING"].includes(o.status)).length,
    completedOrders: orders.filter((o) => o.status === "DELIVERED").length,
    cancelledOrders: orders.filter((o) => o.status === "CANCELLED").length,
    failedOrders: orders.filter((o) => o.status === "FAILED").length,
    totalGMV: orders.reduce((s, o) => s + o.total, 0),
    todayGMV: todayOrders.reduce((s, o) => s + o.total, 0) || randomInt(1500000, 3500000),
    totalPlatformRevenue: Math.round(orders.reduce((s, o) => s + o.platformFee + o.deliveryFee, 0)),
    todayPlatformRevenue: randomInt(50000, 150000),
    totalSellerEarnings: stores.reduce((s, st) => s + st.totalSales * 0.88, 0) + sellers.reduce((s, sl) => s + sl.totalEarnings, 0),
    totalDeliveryPartnerEarnings: partners.reduce((s, p) => s + p.totalEarnings, 0),
  };
}

function computeFinanceStats(orders: Order[], payouts: Payout[]): FinanceStats {
  return {
    totalCustomerPayments: orders.reduce((s, o) => s + o.total, 0),
    pendingPayments: orders.filter((o) => o.paymentStatus === "PENDING").length * 500,
    successfulPayments: orders.filter((o) => o.paymentStatus === "SUCCESS").reduce((s, o) => s + o.total, 0),
    failedPayments: orders.filter((o) => o.paymentStatus === "FAILED").reduce((s, o) => s + o.total, 0),
    refunds: orders.filter((o) => o.paymentStatus === "REFUNDED").reduce((s, o) => s + o.total, 0),
    sellerPayables: payouts.filter((p) => p.type === "SELLER" && p.status === "PENDING").reduce((s, p) => s + p.netPayable, 0),
    deliveryPartnerPayables: payouts.filter((p) => p.type === "DELIVERY_PARTNER" && p.status === "PENDING").reduce((s, p) => s + p.netPayable, 0),
    platformRevenue: orders.reduce((s, o) => s + o.platformFee, 0),
    commission: orders.reduce((s, o) => s + o.subtotal * 0.1, 0),
    taxes: orders.reduce((s, o) => s + o.tax, 0),
    chargeCollection: orders.reduce((s, o) => s + o.handlingFee + o.deliveryFee, 0),
  };
}

function computeCartAnalytics(carts: Cart[]): CartAnalytics {
  return {
    activeCarts: carts.filter((c) => c.status === "ACTIVE").length,
    abandonedCarts: carts.filter((c) => c.status === "ABANDONED").length,
    averageCartValue: Math.round(carts.reduce((s, c) => s + c.subtotal, 0) / carts.length),
    conversionRate: 32.5,
    cartDropRate: 45.2,
    mostAddedProducts: [
      { name: "Rice 1kg", count: 245 },
      { name: "Milk 1L", count: 198 },
      { name: "Bread", count: 156 },
    ],
    mostAbandonedProducts: [
      { name: "Electronics Item", count: 89 },
      { name: "Fashion Item", count: 67 },
      { name: "Premium Grocery", count: 54 },
    ],
  };
}

const FEATURE_FLAGS: FeatureFlag[] = [
  { key: "customer_ads_enabled", label: "Customer Ads", description: "Enable advertisements in customer app", enabled: true },
  { key: "seller_ads_enabled", label: "Seller Ads", description: "Enable seller advertisement features", enabled: true },
  { key: "multi_store_enabled", label: "Multi Store", description: "Allow sellers to manage multiple stores", enabled: true },
  { key: "independent_seller_enabled", label: "Independent Sellers", description: "Enable independent seller marketplace", enabled: true },
  { key: "cash_on_delivery_enabled", label: "Cash on Delivery", description: "Allow COD payments", enabled: true },
  { key: "multi_vendor_cart_enabled", label: "Multi Vendor Cart", description: "Allow cart from multiple vendors", enabled: true },
  { key: "batch_delivery_enabled", label: "Batch Delivery", description: "Enable batch delivery for partners", enabled: false },
];

const SYSTEM_SETTINGS: SystemSettings = {
  platformName: "M3AD Marketplace",
  supportEmail: "support@m3ad.com",
  supportPhone: "+91 9876543210",
  currency: "INR",
  timezone: "Asia/Kolkata",
  minOrderValue: 99,
  maxOrderValue: 50000,
  defaultDeliveryRadius: 8,
  defaultCommission: 10,
  defaultPlatformFee: 5,
};

// Generate all data
const stores = generateStores();
const sellers = generateSellers();
const customers = generateCustomers();
const partners = generatePartners();
const products = generateProducts(stores, sellers);
const orders = generateOrders(stores, sellers, customers, partners);
const carts = generateCarts(customers);
const payouts = generatePayouts(stores, sellers, partners);
const adminUsers = generateAdminUsers();
const auditLogs = generateAuditLogs(stores, adminUsers);
const assignments = generateAssignments(orders, partners);

export const seedData = {
  cities: CITIES,
  zones: ZONES,
  categories: CATEGORIES,
  stores,
  sellers,
  customers,
  partners,
  products,
  orders,
  carts,
  payouts,
  charges: generateCharges(),
  chargeConditions: generateChargeConditions(),
  deliveryPricing: generateDeliveryPricing(),
  commissions: generateCommissions(stores),
  banners: generateBanners(),
  ads: generateAds(),
  coupons: generateCoupons(),
  adminUsers,
  auditLogs,
  notifications: generateNotifications(),
  events: generateEvents(),
  assignments,
  featureFlags: FEATURE_FLAGS,
  systemSettings: SYSTEM_SETTINGS,
  dashboardStats: computeDashboardStats(stores, sellers, customers, partners, orders),
  financeStats: computeFinanceStats(orders, payouts),
  cartAnalytics: computeCartAnalytics(carts),
};

export type SeedData = typeof seedData;
