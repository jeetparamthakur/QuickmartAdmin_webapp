"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import type { CommissionRule } from "@/lib/types";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type FormState = {
  name: string;
  sellerType: "STORE" | "INDEPENDENT";
  scope: "GLOBAL" | "STORE" | "SELLER";
  type: "PERCENTAGE" | "FIXED";
  value: string;
  targetId: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  sellerType: "STORE",
  scope: "GLOBAL",
  type: "PERCENTAGE",
  value: "10",
  targetId: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
  isActive: true,
});

function scopeLabel(rule: CommissionRule) {
  if (rule.scope === "GLOBAL") {
    return rule.sellerType === "INDEPENDENT" ? "All Independent Sellers" : "All Store Owners";
  }
  return rule.targetName ?? rule.targetId ?? rule.scope;
}

function rateLabel(rule: CommissionRule) {
  return rule.type === "FIXED" ? `₹${rule.rate}` : `${rule.rate}%`;
}

export default function CommissionPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CommissionRule | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: commissions, isLoading } = useQuery({
    queryKey: ["commissions"],
    queryFn: () => repositories.dashboard.getCommissions(),
  });

  const { data: storesData } = useQuery({
    queryKey: ["stores-for-commission"],
    queryFn: () => repositories.stores.getAll({ pageSize: 500 }),
  });

  const { data: sellersData } = useQuery({
    queryKey: ["sellers-for-commission"],
    queryFn: () => repositories.sellers.getAll({ pageSize: 500 }),
  });

  const storeDefaults = useMemo(
    () => commissions?.filter((c) => c.scope === "GLOBAL" && c.sellerType === "STORE") ?? [],
    [commissions],
  );
  const independentDefaults = useMemo(
    () => commissions?.filter((c) => c.scope === "GLOBAL" && c.sellerType === "INDEPENDENT") ?? [],
    [commissions],
  );
  const overrides = useMemo(
    () => commissions?.filter((c) => c.scope !== "GLOBAL") ?? [],
    [commissions],
  );

  const openCreate = (sellerType: "STORE" | "INDEPENDENT", scope: FormState["scope"] = "GLOBAL") => {
    setEditing(null);
    setForm({ ...emptyForm(), sellerType, scope });
    setDialogOpen(true);
  };

  const openEdit = (rule: CommissionRule) => {
    const scope: FormState["scope"] =
      rule.scope === "STORE" || rule.scope === "SELLER" ? rule.scope : "GLOBAL";
    setEditing(rule);
    setForm({
      name: rule.name ?? "",
      sellerType: rule.sellerType ?? "STORE",
      scope,
      type: rule.type ?? "PERCENTAGE",
      value: String(rule.rate),
      targetId: rule.targetId ?? "",
      effectiveFrom: rule.effectiveFrom.slice(0, 10),
      effectiveTo: rule.effectiveTo?.slice(0, 10) ?? "",
      isActive: rule.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    if ((form.scope === "STORE" || form.scope === "SELLER") && !form.targetId) {
      toast.error("Select a store or seller for this override");
      return;
    }

    const payload = {
      name: form.name.trim(),
      sellerType: form.sellerType,
      type: form.type,
      value: Number(form.value),
      targetId: form.scope === "GLOBAL" ? undefined : form.targetId,
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || undefined,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editing) {
        await repositories.dashboard.updateCommission(editing.id, payload);
        toast.success("Commission rule updated");
      } else {
        await repositories.dashboard.createCommission(payload);
        toast.success("Commission rule scheduled");
      }
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["commissions"] });
    } catch {
      toast.error("Failed to save commission rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rule: CommissionRule) => {
    if (!window.confirm(`Delete commission rule "${rule.name ?? rule.id}"?`)) return;
    try {
      await repositories.dashboard.deleteCommission(rule.id);
      toast.success("Commission rule deleted");
      qc.invalidateQueries({ queryKey: ["commissions"] });
    } catch {
      toast.error("Failed to delete commission rule");
    }
  };

  const renderRuleList = (rules: CommissionRule[], emptyMessage: string) => {
    if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
    if (!rules.length) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;

    return (
      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div>
              <p className="font-medium">{rule.name ?? scopeLabel(rule)}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant="outline">{rule.scope}</Badge>
                {!rule.isActive && <Badge variant="secondary">Inactive</Badge>}
                {rule.effectiveTo && <Badge variant="outline">Until {formatDate(rule.effectiveTo)}</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {scopeLabel(rule)} · From {formatDate(rule.effectiveFrom)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xl font-bold">{rateLabel(rule)}</p>
                <p className="text-xs text-muted-foreground">{rule.type ?? "PERCENTAGE"}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(rule)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(rule)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const storeDefault = storeDefaults.find((r) => r.isActive !== false);
  const independentDefault = independentDefaults.find((r) => r.isActive !== false);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Commission" }]} />
      <PageHeader
        title="Commission"
        description="Set platform commission for store owners and independent sellers. Rates apply on schedule and deduct from seller earnings in the partner app."
      >
        <Button variant="outline" onClick={() => openCreate("STORE")}>Add Store Rule</Button>
        <Button onClick={() => openCreate("INDEPENDENT")}>Add Seller Rule</Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Store Owners (default)</p>
            <p className="text-3xl font-bold">{storeDefault ? rateLabel(storeDefault) : "—"}</p>
            {storeDefault && (
              <p className="text-xs text-muted-foreground">Effective from {formatDate(storeDefault.effectiveFrom)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Independent Sellers (default)</p>
            <p className="text-3xl font-bold">{independentDefault ? rateLabel(independentDefault) : "—"}</p>
            {independentDefault && (
              <p className="text-xs text-muted-foreground">Effective from {formatDate(independentDefault.effectiveFrom)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="defaults">
        <TabsList>
          <TabsTrigger value="defaults">Default Rates</TabsTrigger>
          <TabsTrigger value="overrides">Per-Partner Overrides</TabsTrigger>
        </TabsList>
        <TabsContent value="defaults" className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium">Store Owner Defaults</h3>
            {renderRuleList(storeDefaults, "No default commission set for store owners.")}
          </div>
          <div>
            <h3 className="mb-2 font-medium">Independent Seller Defaults</h3>
            {renderRuleList(independentDefaults, "No default commission set for independent sellers.")}
          </div>
        </TabsContent>
        <TabsContent value="overrides">
          {renderRuleList(overrides, "No per-store or per-seller overrides yet.")}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Commission Rule" : "Schedule Commission Rule"}</DialogTitle>
            <DialogDescription>
              Commission is deducted from seller earnings at order settlement. Future effective dates let you schedule rate changes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Rule Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Q4 Store Commission"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Partner Type</Label>
                <Select
                  value={form.sellerType}
                  onValueChange={(value: "STORE" | "INDEPENDENT") =>
                    setForm({
                      ...form,
                      sellerType: value,
                      scope: value === "STORE" ? "GLOBAL" : "GLOBAL",
                      targetId: "",
                    })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STORE">Store Owner</SelectItem>
                    <SelectItem value="INDEPENDENT">Independent Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Applies To</Label>
                <Select
                  value={form.scope}
                  onValueChange={(value: FormState["scope"]) => {
                    const sellerType =
                      value === "SELLER"
                        ? "INDEPENDENT"
                        : value === "STORE"
                          ? "STORE"
                          : form.sellerType;
                    setForm({
                      ...form,
                      scope: value,
                      sellerType,
                      targetId: value === "GLOBAL" ? "" : form.targetId,
                    });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">Default for all partners of this type</SelectItem>
                    <SelectItem value="STORE">Specific store</SelectItem>
                    <SelectItem value="SELLER">Specific independent seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(form.scope === "STORE" || form.scope === "SELLER") && (
              <div>
                <Label>{form.scope === "STORE" ? "Store" : "Independent Seller"}</Label>
                <Select value={form.targetId} onValueChange={(value) => setForm({ ...form, targetId: value })}>
                  <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                  <SelectContent>
                    {form.scope === "STORE"
                      ? storesData?.data.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))
                      : sellersData?.data.map((seller) => (
                          <SelectItem key={seller.id} value={seller.id}>
                            {seller.businessName}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Commission Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: "PERCENTAGE" | "FIXED") => setForm({ ...form, type: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed (₹ per order)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{form.type === "PERCENTAGE" ? "Rate (%)" : "Amount (₹)"}</Label>
                <Input
                  type="number"
                  min={0}
                  step={form.type === "PERCENTAGE" ? 0.1 : 1}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                />
              </div>
              <div>
                <Label>Effective To (optional)</Label>
                <Input
                  type="date"
                  value={form.effectiveTo}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive rules are ignored until re-enabled</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Update Rule" : "Schedule Rule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
