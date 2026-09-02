"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ChargeCondition } from "@/lib/types";

interface RuleBuilderProps {
  conditions: ChargeCondition[];
  onChange?: (conditions: ChargeCondition[]) => void;
}

export function RuleBuilder({ conditions: initial, onChange }: RuleBuilderProps) {
  const [conditions, setConditions] = useState(initial);

  const addRule = () => {
    const newRule: ChargeCondition = {
      id: `cond-${Date.now()}`,
      field: "cartTotal",
      operator: "<",
      value: "₹200",
      thenCharge: "Small Order Fee",
      thenValue: 20,
    };
    const updated = [...conditions, newRule];
    setConditions(updated);
    onChange?.(updated);
  };

  const removeRule = (id: string) => {
    const updated = conditions.filter((c) => c.id !== id);
    setConditions(updated);
    onChange?.(updated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Advanced Charge Rules</CardTitle>
        <Button size="sm" onClick={addRule}>
          <Plus className="mr-1 h-4 w-4" /> Add Rule
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.map((rule) => (
          <div key={rule.id} className="rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-xs">IF Field</Label>
                <Select defaultValue={rule.field}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="cartTotal">Cart Total</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Operator</Label>
                <Select defaultValue={rule.operator}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">&gt;</SelectItem>
                    <SelectItem value="<">&lt;</SelectItem>
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Value</Label>
                <Input defaultValue={rule.value} />
              </div>
              <div>
                <Label className="text-xs">THEN Charge (₹)</Label>
                <Input type="number" defaultValue={rule.thenValue} />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                THEN add <strong>{rule.thenCharge}</strong> = ₹{rule.thenValue}
              </p>
              <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function FeatureToggleGrid({
  features,
  onToggle,
}: {
  features: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}) {
  const labels: Record<string, string> = {
    login: "Enable Login",
    productUpload: "Product Upload",
    orders: "Orders",
    delivery: "Delivery",
    payout: "Payout",
    advertisements: "Advertisements",
    multipleStores: "Multiple Stores",
    staffManagement: "Staff Management",
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(features).map(([key, enabled]) => (
        <div key={key} className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm">{labels[key] ?? key}</span>
          <Switch checked={enabled} onCheckedChange={(v) => onToggle(key, v)} />
        </div>
      ))}
    </div>
  );
}
