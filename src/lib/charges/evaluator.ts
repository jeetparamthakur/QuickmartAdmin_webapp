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
  const activeRules = (rules ?? seedData.charges).filter((r) => r.isActive);
  const items: ChargeLineItem[] = [];

  for (const rule of activeRules.sort((a, b) => a.priority - b.priority)) {
    if (
      rule.conditions.maxCartTotal !== undefined &&
      cart.subtotal >= rule.conditions.maxCartTotal
    ) {
      continue;
    }
    if (
      rule.conditions.minCartValue !== undefined &&
      cart.subtotal < rule.conditions.minCartValue
    ) {
      continue;
    }

    let amount = 0;
    if (rule.type === "FIXED") amount = rule.value;
    else if (rule.type === "PERCENTAGE") amount = Math.round(cart.subtotal * (rule.value / 100));

    if (amount > 0) {
      items.push({
        name: rule.name,
        amount,
        visibleInCart: true,
        visibleInCheckout: true,
        visibleInInvoice: true,
      });
    }
  }

  const distance = cart.distance ?? 3;
  const slab = seedData.deliveryPricing[0].slabs.find(
    (s) => distance >= s.minKm && (s.maxKm === null || distance < s.maxKm),
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
