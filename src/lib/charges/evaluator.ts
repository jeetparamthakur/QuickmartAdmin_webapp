import type { ChargeRule } from "@/lib/types";
import { seedData } from "@/lib/mock/seed";

export interface CartContext {
  subtotal: number;
  distance?: number;
  category?: string;
  time?: Date;
  storeId?: string;
  sellerId?: string;
}

export interface ChargeLineItem {
  name: string;
  amount: number;
  visibleInCart: boolean;
  visibleInCheckout: boolean;
  visibleInInvoice: boolean;
}

export function evaluateCharges(cart: CartContext, rules?: ChargeRule[]): ChargeLineItem[] {
  const activeRules = (rules ?? seedData.charges).filter((r) => r.enabled);
  const items: ChargeLineItem[] = [];
  const now = cart.time ?? new Date();
  const hour = now.getHours();

  for (const rule of activeRules) {
    let applies = false;
    let amount = 0;

    if (rule.minCartValue && cart.subtotal < rule.minCartValue) continue;

    if (rule.conditions.includes("Cart Total <")) {
      applies = cart.subtotal < 200;
    } else if (rule.conditions.includes("7 PM - 10 PM")) {
      applies = hour >= 19 && hour <= 22;
    } else if (rule.conditions.includes("Category = Grocery")) {
      applies = cart.category === "Grocery" || cart.category === "cat-1";
    } else if (rule.conditions.includes("Distance >") && cart.distance) {
      if (cart.distance > 5) {
        applies = true;
        amount = Math.ceil(cart.distance - 5) * 10;
      }
    } else {
      applies = rule.applicability === "All Orders" || !rule.conditions || rule.conditions === "None";
    }

    if (!applies && rule.conditions.includes("Distance >")) continue;

    if (applies && amount === 0) {
      if (rule.type === "FIXED") amount = rule.value;
      else if (rule.type === "PERCENTAGE") amount = Math.round(cart.subtotal * (rule.value / 100));
    }

    if (rule.maxCharge) amount = Math.min(amount, rule.maxCharge);

    if (applies && amount > 0) {
      items.push({
        name: rule.name,
        amount,
        visibleInCart: rule.visibleInCart,
        visibleInCheckout: rule.visibleInCheckout,
        visibleInInvoice: rule.visibleInInvoice,
      });
    }
  }

  // Delivery fee from slabs
  const distance = cart.distance ?? 3;
  const slab = seedData.deliveryPricing[0].slabs.find(
    (s) => distance >= s.minKm && (s.maxKm === null || distance < s.maxKm)
  );
  if (slab) {
    items.push({
      name: "Delivery Fee",
      amount: slab.fee,
      visibleInCart: true,
      visibleInCheckout: true,
      visibleInInvoice: true,
    });
  }

  // Tax
  const taxable = cart.subtotal + items.reduce((s, i) => s + i.amount, 0);
  items.push({
    name: "Taxes",
    amount: Math.round(taxable * 0.05),
    visibleInCart: false,
    visibleInCheckout: true,
    visibleInInvoice: true,
  });

  return items;
}

export function calculateTotal(subtotal: number, discount: number, charges: ChargeLineItem[]) {
  return subtotal - discount + charges.reduce((s, c) => s + c.amount, 0);
}
