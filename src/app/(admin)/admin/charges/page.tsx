"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { RuleBuilder } from "@/components/admin/rule-builder";
import { evaluateCharges, calculateTotal } from "@/lib/charges/evaluator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ChargesPage() {
  const { data: charges } = useQuery({ queryKey: ["charges"], queryFn: () => repositories.dashboard.getCharges() });
  const { data: conditions } = useQuery({ queryKey: ["charge-conditions"], queryFn: () => repositories.dashboard.getChargeConditions() });
  const { data: deliveryPricing } = useQuery({ queryKey: ["delivery-pricing"], queryFn: () => repositories.dashboard.getDeliveryPricing() });

  const [previewCart, setPreviewCart] = useState({ subtotal: 500, distance: 3, category: "Grocery" });
  const chargeItems = evaluateCharges({ subtotal: previewCart.subtotal, distance: previewCart.distance, category: previewCart.category });
  const total = calculateTotal(previewCart.subtotal, 50, chargeItems);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Charges & Pricing" }]} />
      <h1 className="mb-4 text-2xl font-bold">Charges & Pricing Engine</h1>
      <Tabs defaultValue="charges">
        <TabsList>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Pricing</TabsTrigger>
          <TabsTrigger value="rules">Rule Builder</TabsTrigger>
          <TabsTrigger value="preview">Cart Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="charges" className="space-y-3">
          {charges?.map((charge) => (
            <Card key={charge.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{charge.name}</p>
                  <p className="text-sm text-muted-foreground">{charge.type} · {charge.applicability}</p>
                  <div className="mt-1 flex gap-1">
                    {charge.visibleInCart && <Badge variant="outline">Cart</Badge>}
                    {charge.visibleInCheckout && <Badge variant="outline">Checkout</Badge>}
                    {charge.visibleInInvoice && <Badge variant="outline">Invoice</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{charge.type === "PERCENTAGE" ? `${charge.value}%` : formatCurrency(charge.value)}</span>
                  <Switch checked={charge.enabled} />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="delivery">
          {deliveryPricing?.map((dp) => (
            <Card key={dp.id} className="mb-4">
              <CardHeader><CardTitle className="text-base">{dp.name}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm">Base: {formatCurrency(dp.baseFee)} · Min: {formatCurrency(dp.minFee)} · Max: {formatCurrency(dp.maxFee)}</p>
                <p className="text-sm">Free delivery above: {dp.freeDeliveryThreshold ? formatCurrency(dp.freeDeliveryThreshold) : "N/A"}</p>
                <div className="mt-3 space-y-1">
                  {dp.slabs.map((s, i) => (
                    <div key={i} className="flex justify-between rounded border px-3 py-1 text-sm">
                      <span>{s.minKm}–{s.maxKm ?? "∞"} KM</span>
                      <span>{formatCurrency(s.fee)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rules">
          {conditions && <RuleBuilder conditions={conditions} />}
        </TabsContent>

        <TabsContent value="preview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Simulate Cart</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Cart Subtotal (₹)</Label><Input type="number" value={previewCart.subtotal} onChange={(e) => setPreviewCart({ ...previewCart, subtotal: Number(e.target.value) })} /></div>
                <div><Label>Distance (KM)</Label><Input type="number" value={previewCart.distance} onChange={(e) => setPreviewCart({ ...previewCart, distance: Number(e.target.value) })} /></div>
                <div><Label>Category</Label><Input value={previewCart.category} onChange={(e) => setPreviewCart({ ...previewCart, category: e.target.value })} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Price Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Items Total</span><span>{formatCurrency(previewCart.subtotal)}</span></div>
                <div className="flex justify-between text-red-600"><span>Discount</span><span>-{formatCurrency(50)}</span></div>
                {chargeItems.map((c) => (
                  <div key={c.name} className="flex justify-between"><span>{c.name}</span><span>{formatCurrency(c.amount)}</span></div>
                ))}
                <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total Payable</span><span>{formatCurrency(total)}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
