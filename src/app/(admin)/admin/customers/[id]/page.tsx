"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency, formatDate, maskEmail, maskPhone } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const { data: customer } = useQuery({ queryKey: ["customer", id], queryFn: () => repositories.customers.getById(id) });
  const pii = can("customers.view_pii");

  if (!customer) return <p>Loading...</p>;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Customers", href: "/admin/customers" }, { label: customer.name }]} />
      <h1 className="mb-2 text-2xl font-bold">{customer.name}</h1>
      <StatusBadge status={customer.status} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[["Mobile", pii ? customer.mobile : maskPhone(customer.mobile)], ["Email", pii ? customer.email : maskEmail(customer.email)], ["Registered", formatDate(customer.registrationDate)], ["Total Orders", customer.totalOrders], ["Completed", customer.completedOrders], ["Cancelled", customer.cancelledOrders], ["Total Spending", formatCurrency(customer.totalSpending)], ["Addresses", customer.addresses.length]].map(([l,v]) => (
          <div key={String(l)} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v}</p></div>
        ))}
      </div>
    </div>
  );
}
