import type { OrderItem, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Package } from "lucide-react";

interface OrderItemsTableProps {
  items: OrderItem[];
  productsById?: Map<string, Product>;
}

export function OrderItemsTable({ items, productsById }: OrderItemsTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items in this order.</p>;
  }

  const itemsSubtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              SKU
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Qty
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Unit Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Line Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const product = productsById?.get(item.productId);
            const lineTotal = item.quantity * item.price;

            return (
              <tr key={`${item.productId}-${index}`} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">ID: {item.productId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {product?.sku ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{product?.categoryName ?? "—"}</td>
                <td className="px-4 py-3 text-right font-medium">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(lineTotal)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-muted/20">
            <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Items subtotal
            </td>
            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(itemsSubtotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
