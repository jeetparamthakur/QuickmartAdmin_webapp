import type { AccountStatus, OrderStatus, PayoutStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  SUSPENDED: "warning",
  PENDING: "warning",
  pending: "warning",
  under_review: "warning",
  approved: "success",
  rejected: "destructive",
  BLOCKED: "destructive",
  DELIVERED: "success",
  CANCELLED: "destructive",
  FAILED: "destructive",
  REFUNDED: "secondary",
  PLACED: "outline",
  ACCEPTED: "default",
  PREPARING: "default",
  READY_FOR_PICKUP: "warning",
  DELIVERY_ASSIGNED: "default",
  PICKED_UP: "default",
  OUT_FOR_DELIVERY: "default",
  COMPLETED: "success",
  APPROVED: "success",
  PROCESSING: "default",
  HELD: "warning",
  APPROVED_PRODUCT: "success",
  REJECTED: "destructive",
  DISABLED: "secondary",
};

export function StatusBadge({ status }: { status: AccountStatus | OrderStatus | PayoutStatus | string }) {
  const variant = statusVariants[status] ?? "outline";
  return (
    <Badge variant={variant} className="font-mono text-[10px]">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
