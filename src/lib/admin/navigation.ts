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
  Map,
  Wallet,
  Banknote,
  Receipt,
  Percent,
  Tag,
  Image,
  Megaphone,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Shield,
  ScrollText,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
}

export const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard.view" },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: "orders.view" },
  { title: "Customers", href: "/admin/customers", icon: Users, permission: "customers.view" },
  { title: "Stores", href: "/admin/stores", icon: Store, permission: "stores.view" },
  { title: "Independent Sellers", href: "/admin/independent-sellers", icon: UserCircle, permission: "sellers.view" },
  { title: "Products", href: "/admin/products", icon: Package, permission: "products.view" },
  { title: "Categories", href: "/admin/categories", icon: FolderTree, permission: "categories.manage" },
  { title: "Delivery Partners", href: "/admin/delivery-partners", icon: Truck, permission: "delivery.view" },
  { title: "Live Map", href: "/admin/live-map", icon: Map, permission: "delivery.live_map" },
  { title: "Finance", href: "/admin/finance", icon: Wallet, permission: "finance.view" },
  { title: "Payouts", href: "/admin/payouts", icon: Banknote, permission: "finance.view" },
  { title: "Charges & Pricing", href: "/admin/charges", icon: Receipt, permission: "charges.manage" },
  { title: "Commission", href: "/admin/commission", icon: Percent, permission: "commission.manage" },
  { title: "Offers & Coupons", href: "/admin/offers", icon: Tag, permission: "marketing.offers" },
  { title: "Banners", href: "/admin/banners", icon: Image, permission: "marketing.banners" },
  { title: "Advertisements", href: "/admin/advertisements", icon: Megaphone, permission: "marketing.ads" },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics.view" },
  { title: "Reports", href: "/admin/reports", icon: FileText, permission: "reports.export" },
  { title: "Notifications", href: "/admin/notifications", icon: Bell, permission: "notifications.view" },
  { title: "Settings", href: "/admin/settings", icon: Settings, permission: "settings.manage" },
  { title: "Admin Users", href: "/admin/admin-users", icon: Shield, permission: "admin.users" },
  { title: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText, permission: "audit.view" },
];
