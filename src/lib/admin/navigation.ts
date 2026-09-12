import type { Permission } from "@/lib/permissions/matrix";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  UserCircle,
  Package,
  FolderTree,
  Truck,
  Wallet,
  Banknote,
  Percent,
  Tag,
  Image,
  BarChart3,
  Bell,
  Settings,
  ScrollText,
  ClipboardList,
  UtensilsCrossed,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  description?: string;
}

export interface NavGroup {
  label: string;
  hint?: string;
  items: NavItem[];
}

/** SaaS-focused navigation — only surfaces what platform admins need day-to-day. */
export const adminNavGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "dashboard.view",
        description: "Platform snapshot and quick actions",
      },
    ],
  },
  {
    label: "Marketplace",
    hint: "Buyer-facing activity",
    items: [
      {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        permission: "orders.view",
        description: "Orders across all store owners and sellers",
      },
      {
        title: "Customers",
        href: "/admin/customers",
        icon: Users,
        permission: "customers.view",
        description: "End-customers shopping on your platform",
      },
      {
        title: "Products",
        href: "/admin/products",
        icon: Package,
        permission: "products.view",
        description: "Catalog from all partners on the platform",
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
        permission: "categories.manage",
        description: "Shared taxonomy for the marketplace",
      },
    ],
  },
  {
    label: "Partners",
    hint: "Store owners, sellers & delivery",
    items: [
      {
        title: "Applications",
        href: "/admin/requests",
        icon: ClipboardList,
        permission: "requests.view",
        description: "Review onboarding requests from new partners",
      },
      {
        title: "Store Owners",
        href: "/admin/stores",
        icon: Store,
        permission: "stores.view",
        description: "Merchants running physical storefronts",
      },
      {
        title: "Restaurants",
        href: "/admin/restaurants",
        icon: UtensilsCrossed,
        permission: "stores.view",
        description: "Food partners running restaurants and menus",
      },
      {
        title: "Independent Sellers",
        href: "/admin/independent-sellers",
        icon: UserCircle,
        permission: "sellers.view",
        description: "Home-based sellers without a retail store",
      },
      {
        title: "Delivery Partners",
        href: "/admin/delivery-partners",
        icon: Truck,
        permission: "delivery.view",
        description: "Fleet partners fulfilling last-mile delivery",
      },
    ],
  },
  {
    label: "Finance",
    hint: "Revenue & partner payouts",
    items: [
      {
        title: "Finance",
        href: "/admin/finance",
        icon: Wallet,
        permission: "finance.view",
        description: "Platform revenue, payments, and payables",
      },
      {
        title: "Payouts",
        href: "/admin/payouts",
        icon: Banknote,
        permission: "finance.view",
        description: "Disburse earnings to store owners and sellers",
      },
      {
        title: "Commission",
        href: "/admin/commission",
        icon: Percent,
        permission: "commission.manage",
        description: "Commission rules per partner type",
      },
      {
        title: "Cart Charges",
        href: "/admin/charges",
        icon: ShoppingCart,
        permission: "charges.manage",
        description: "Handling fees and platform charges at checkout",
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        title: "Offers & Coupons",
        href: "/admin/offers",
        icon: Tag,
        permission: "marketing.offers",
        description: "Promotions across the marketplace",
      },
      {
        title: "Banners",
        href: "/admin/banners",
        icon: Image,
        permission: "marketing.banners",
        description: "Homepage and category banners",
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        permission: "analytics.view",
        description: "GMV, orders, and partner performance",
      },
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
        permission: "notifications.view",
        description: "Platform alerts and announcements",
      },
    ],
  },
  {
    label: "Platform",
    hint: "SaaS configuration",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
        permission: "settings.manage",
        description: "Platform name, fees, and defaults",
      },
      {
        title: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ScrollText,
        permission: "audit.view",
        description: "Activity trail for compliance",
      },
    ],
  },
];

/** Flat list used for route permission checks and search indexing. */
export const adminNavItems: NavItem[] = adminNavGroups.flatMap((group) => group.items);

export function getNavItemForPath(pathname: string): NavItem | undefined {
  return adminNavItems.find(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );
}
