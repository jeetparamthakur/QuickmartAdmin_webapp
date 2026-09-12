"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import type { ChargeRule } from "@/lib/types";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

type FormState = {
  code: string;
  name: string;
  type: "FIXED" | "PERCENTAGE";
  value: string;
  minCartValue: string;
  maxCartTotal: string;
  priority: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  code: "",
  name: "",
  type: "FIXED",
  value: "10",
  minCartValue: "",
  maxCartTotal: "",
  priority: "0",
  isActive: true,
});

function conditionsSummary(rule: ChargeRule) {
  const parts: string[] = [];
  if (rule.conditions.minCartValue !== undefined) {
    parts.push(`Min cart ${formatCurrency(rule.conditions.minCartValue)}`);
  }
  if (rule.conditions.maxCartTotal !== undefined) {
    parts.push(`Cart below ${formatCurrency(rule.conditions.maxCartTotal)}`);
  }
  return parts.length ? parts.join(" · ") : "All carts";
}

function valueLabel(rule: ChargeRule) {
  return rule.type === "PERCENTAGE" ? `${rule.value}%` : formatCurrency(rule.value);
}

function evaluatePreview(
  rules: ChargeRule[],
  subtotal: number,
): Array<{ name: string; amount: number }> {
  const active = rules.filter((r) => r.isActive);
  const lines: Array<{ name: string; amount: number }> = [];

  for (const rule of active.sort((a, b) => a.priority - b.priority)) {
    if (
      rule.conditions.maxCartTotal !== undefined &&
      subtotal >= rule.conditions.maxCartTotal
    ) {
      continue;
    }
    if (
      rule.conditions.minCartValue !== undefined &&
      subtotal < rule.conditions.minCartValue
    ) {
      continue;
    }

    const amount =
      rule.type === "PERCENTAGE"
        ? (subtotal * rule.value) / 100
        : rule.value;
    lines.push({ name: rule.name, amount });
  }

  return lines;
}

export default function ChargesPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ChargeRule | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [previewSubtotal, setPreviewSubtotal] = useState(500);

  const { data: charges, isLoading } = useQuery({
    queryKey: ["charges"],
    queryFn: () => repositories.dashboard.getCharges(),
  });

  const previewLines = useMemo(
    () => evaluatePreview(charges ?? [], previewSubtotal),
    [charges, previewSubtotal],
  );
  const previewTotal = previewSubtotal + previewLines.reduce((s, l) => s + l.amount, 0);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (rule: ChargeRule) => {
    setEditing(rule);
    setForm({
      code: rule.code,
      name: rule.name,
      type: rule.type === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
      value: String(rule.value),
      minCartValue: rule.conditions.minCartValue !== undefined ? String(rule.conditions.minCartValue) : "",
      maxCartTotal: rule.conditions.maxCartTotal !== undefined ? String(rule.conditions.maxCartTotal) : "",
      priority: String(rule.priority),
      isActive: rule.isActive,
    });
    setDialogOpen(true);
  };

  const buildConditions = () => {
    const conditions: ChargeRule["conditions"] = {};
    if (form.minCartValue) conditions.minCartValue = Number(form.minCartValue);
    if (form.maxCartTotal) conditions.maxCartTotal = Number(form.maxCartTotal);
    return conditions;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and code are required");
      return;
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      conditions: buildConditions(),
      priority: Number(form.priority) || 0,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editing) {
        await repositories.dashboard.updateCharge(editing.id, payload);
        toast.success("Charge updated");
      } else {
        await repositories.dashboard.createCharge(payload);
        toast.success("Charge created");
      }
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["charges"] });
    } catch {
      toast.error("Failed to save charge");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: ChargeRule, isActive: boolean) => {
    try {
      await repositories.dashboard.updateCharge(rule.id, { isActive });
      qc.invalidateQueries({ queryKey: ["charges"] });
    } catch {
      toast.error("Failed to update charge");
    }
  };

  const handleDelete = async (rule: ChargeRule) => {
    if (!window.confirm(`Delete charge "${rule.name}"?`)) return;
    try {
      await repositories.dashboard.deleteCharge(rule.id);
      toast.success("Charge deleted");
      qc.invalidateQueries({ queryKey: ["charges"] });
    } catch {
      toast.error("Failed to delete charge");
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Cart Charges" }]} />
      <PageHeader
        title="Cart Charges"
        description="Manage handling fees and platform charges shown to customers at checkout. These go to platform revenue and are not added to seller payouts."
      >
        <Button onClick={openCreate}>Add Charge</Button>
      </PageHeader>

      <Tabs defaultValue="charges">
        <TabsList>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="preview">Cart Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="charges" className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !charges?.length ? (
            <p className="text-sm text-muted-foreground">No cart charges configured yet.</p>
          ) : (
            charges.map((charge) => (
              <Card key={charge.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{charge.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {charge.code} · {charge.type} · {conditionsSummary(charge)}
                    </p>
                    <div className="mt-1 flex gap-1">
                      <Badge variant="outline">Cart</Badge>
                      <Badge variant="outline">Checkout</Badge>
                      {!charge.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{valueLabel(charge)}</span>
                    <Switch
                      checked={charge.isActive}
                      onCheckedChange={(checked) => handleToggle(charge, checked)}
                    />
                    <Button size="sm" variant="outline" onClick={() => openEdit(charge)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(charge)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="preview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Simulate Cart</CardTitle>
              </CardHeader>
              <CardContent>
                <Label>Cart Subtotal (₹)</Label>
                <Input
                  type="number"
                  value={previewSubtotal}
                  onChange={(e) => setPreviewSubtotal(Number(e.target.value))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Bill Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span>{formatCurrency(previewSubtotal)}</span>
                </div>
                {previewLines.map((line) => (
                  <div key={line.name} className="flex justify-between">
                    <span>{line.name}</span>
                    <span>{formatCurrency(line.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>Subtotal + Charges</span>
                  <span>{formatCurrency(previewTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Charge" : "Add Cart Charge"}</DialogTitle>
            <DialogDescription>
              This charge appears in the customer cart and checkout. It is collected as platform revenue.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Charge Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Handling Fee"
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="HANDLING_FEE"
                disabled={!!editing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as FormState["type"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed (₹)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Cart Value (optional)</Label>
                <Input
                  type="number"
                  value={form.minCartValue}
                  onChange={(e) => setForm({ ...form, minCartValue: e.target.value })}
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <Label>Max Cart Total (optional)</Label>
                <Input
                  type="number"
                  value={form.maxCartTotal}
                  onChange={(e) => setForm({ ...form, maxCartTotal: e.target.value })}
                  placeholder="e.g. 200"
                />
              </div>
            </div>
            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Charge" : "Create Charge"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
