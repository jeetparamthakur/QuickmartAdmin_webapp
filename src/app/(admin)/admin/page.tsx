"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { StatCard, MetricGrid } from "@/components/admin/stat-card";
import { PageSection } from "@/components/admin/page-section";
import {
  Users,
  Store,
  UserRound,
  Truck,
  ClipboardList,
  ShoppingCart,
  ArrowRight,
  Settings,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PARTNER_METRICS = [
  {
    key: "customers",
    title: "Customers",
    description: "Shoppers on your marketplace",
    href: "/admin/customers",
    icon: Users,
    accentClass: "bg-sky-50 text-sky-600 ring-sky-100",
    getValue: (stats: Awaited<ReturnType<typeof repositories.dashboard.getStats>>) =>
      stats.totalCustomers,
  },
  {
    key: "storeOwners",
    title: "Store Owners",
    description: "Merchants with physical storefronts",
    href: "/admin/stores",
    icon: Store,
    accentClass: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    getValue: (stats: Awaited<ReturnType<typeof repositories.dashboard.getStats>>) =>
      stats.totalStores,
  },
  {
    key: "independentSellers",
    title: "Independent Sellers",
    description: "Home-based sellers on the platform",
    href: "/admin/independent-sellers",
    icon: UserRound,
    accentClass: "bg-violet-50 text-violet-600 ring-violet-100",
    getValue: (stats: Awaited<ReturnType<typeof repositories.dashboard.getStats>>) =>
      stats.totalIndependentSellers,
  },
  {
    key: "deliveryPartners",
    title: "Delivery Partners",
    description: "Fleet fulfilling last-mile orders",
    href: "/admin/delivery-partners",
    icon: Truck,
    accentClass: "bg-amber-50 text-amber-600 ring-amber-100",
    getValue: (stats: Awaited<ReturnType<typeof repositories.dashboard.getStats>>) =>
      stats.totalDeliveryPartners,
  },
] as const;

const QUICK_ACTIONS = [
  {
    title: "Review applications",
    description: "Approve new store owners, sellers, and delivery partners",
    href: "/admin/requests?status=pending",
    icon: ClipboardList,
  },
  {
    title: "Manage orders",
    description: "Track orders across all partners",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Process payouts",
    description: "Release earnings to partners",
    href: "/admin/payouts",
    icon: Banknote,
  },
  {
    title: "Platform settings",
    description: "Fees, defaults, and configuration",
    href: "/admin/settings",
    icon: Settings,
  },
] as const;

export default function DashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => repositories.dashboard.getStats() });

  const { data: pendingApplications = 0 } = useQuery({
    queryKey: ["requests-pending-count"],
    queryFn: async () => {
      const result = await repositories.requests.getAll({ pageSize: 500 });
      return result.data.filter(
        (r) => r.status === "pending" || r.status === "under_review"
      ).length;
    },
  });

  if (statsLoading) return <DashboardSkeleton />;
  if (statsError || !stats) {
    return (
      <div className="space-y-8">
        <DashboardHeader />
        <div className="rounded-2xl border border-border/50 bg-card/80 px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <p className="text-sm text-muted-foreground">
            Unable to load dashboard data. Make sure the backend is running and you are logged in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <DashboardHeader pendingApplications={pendingApplications} />

      <PageSection
        title="Partner ecosystem"
        description="Your SaaS tenants — store owners, independent sellers, and delivery partners"
      >
        <MetricGrid variant="overview">
          {PARTNER_METRICS.map((metric) => (
            <StatCard
              key={metric.key}
              title={metric.title}
              value={metric.getValue(stats)}
              description={metric.description}
              href={metric.href}
              icon={metric.icon}
              accentClass={metric.accentClass}
            />
          ))}
        </MetricGrid>
      </PageSection>

      <PageSection title="Today's pulse" description="What needs attention right now">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            title="Pending Applications"
            value={pendingApplications}
            description="Partners waiting for onboarding review"
            href="/admin/requests?status=pending"
            icon={ClipboardList}
            accentClass="bg-orange-50 text-orange-600 ring-orange-100"
          />
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders}
            description="Orders placed across the marketplace today"
            href="/admin/orders"
            icon={ShoppingCart}
            accentClass="bg-blue-50 text-blue-600 ring-blue-100"
          />
        </div>
      </PageSection>

      <PageSection title="Quick actions" description="Common tasks for platform admins">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "group flex flex-col rounded-2xl border border-border/40 bg-card/60 p-5 transition-all duration-200",
                "hover:border-primary/25 hover:bg-card hover:shadow-[var(--shadow-md)]"
              )}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                <action.icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-foreground">{action.title}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                {action.description}
              </p>
              <span className="mt-3 flex items-center gap-1 text-xs font-medium text-primary/80 group-hover:text-primary">
                Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </PageSection>
    </div>
  );
}

function DashboardHeader({ pendingApplications = 0 }: { pendingApplications?: number }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-secondary/40 p-6 shadow-[var(--shadow-sm)] sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent/60 blur-3xl" />
      </div>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Marketplace overview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Manage your multi-tenant SaaS platform — onboard partners, monitor orders, and keep
            operations running smoothly.
          </p>
        </div>
        {pendingApplications > 0 && (
          <Link
            href="/admin/requests?status=pending"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-orange-200/80 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
          >
            <ClipboardList className="h-4 w-4" />
            {pendingApplications} application{pendingApplications === 1 ? "" : "s"} to review
          </Link>
        )}
      </div>
    </header>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="h-36 animate-pulse rounded-2xl bg-muted/60" />
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
