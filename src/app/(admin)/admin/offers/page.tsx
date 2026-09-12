"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import type { Coupon, Offer } from "@/lib/types";
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
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

type CouponForm = {
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  perCustomerLimit: string;
  scopeType: Coupon["scopeType"];
  storeId: string;
  independentSellerId: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

type OfferForm = {
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: string;
  linkedCouponCode: string;
  startsAt: string;
  expiresAt: string;
  status: Offer["status"];
};

const emptyCouponForm = (): CouponForm => ({
  code: "",
  name: "",
  type: "PERCENTAGE",
  value: "10",
  minOrderAmount: "0",
  maxDiscount: "",
  usageLimit: "100",
  perCustomerLimit: "1",
  scopeType: "GLOBAL",
  storeId: "",
  independentSellerId: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
});

const emptyOfferForm = (): OfferForm => ({
  title: "",
  description: "",
  imageUrl: "",
  discountPercent: "",
  linkedCouponCode: "",
  startsAt: "",
  expiresAt: "",
  status: "ACTIVE",
});

function couponSummary(c: Coupon) {
  const discount =
    c.type === "PERCENTAGE"
      ? `${c.value}% off${c.maxDiscount ? ` (max ${formatCurrency(c.maxDiscount)})` : ""}`
      : `${formatCurrency(c.value)} off`;
  return `${discount} · Min ${formatCurrency(c.minCart)} · Used ${c.usedCount}/${c.usageLimit || "∞"}`;
}

export default function OffersPage() {
  const qc = useQueryClient();
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [couponForm, setCouponForm] = useState<CouponForm>(emptyCouponForm);
  const [offerForm, setOfferForm] = useState<OfferForm>(emptyOfferForm);
  const [saving, setSaving] = useState(false);

  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => repositories.dashboard.getCoupons(),
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: () => repositories.dashboard.getOffers(),
  });

  const { data: storePage } = useQuery({
    queryKey: ["stores-picker"],
    queryFn: () => repositories.stores.getAll({ pageSize: 500 }),
  });

  const { data: sellerPage } = useQuery({
    queryKey: ["sellers-picker"],
    queryFn: () => repositories.sellers.getAll({ pageSize: 500 }),
  });

  const storeOptions = useMemo(
    () => (storePage?.data ?? []).map((s) => ({ id: s.id, name: s.name })),
    [storePage],
  );
  const sellerOptions = useMemo(
    () => (sellerPage?.data ?? []).map((s) => ({ id: s.id, name: s.businessName ?? s.name })),
    [sellerPage],
  );

  const openCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm(emptyCouponForm());
    setCouponDialogOpen(true);
  };

  const openEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      name: c.name,
      type: c.type,
      value: String(c.value),
      minOrderAmount: String(c.minCart),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
      usageLimit: String(c.usageLimit || ""),
      perCustomerLimit: String(c.perCustomerLimit),
      scopeType: c.scopeType,
      storeId: c.storeId ?? "",
      independentSellerId: c.independentSellerId ?? "",
      startsAt: c.startDate ? c.startDate.slice(0, 10) : "",
      expiresAt: c.endDate ? c.endDate.slice(0, 10) : "",
      isActive: c.enabled,
    });
    setCouponDialogOpen(true);
  };

  const openCreateOffer = () => {
    setEditingOffer(null);
    setOfferForm(emptyOfferForm());
    setOfferDialogOpen(true);
  };

  const openEditOffer = (o: Offer) => {
    setEditingOffer(o);
    setOfferForm({
      title: o.title,
      description: o.description ?? "",
      imageUrl: o.imageUrl ?? "",
      discountPercent: o.discountPercent ? String(o.discountPercent) : "",
      linkedCouponCode: o.linkedCouponCode ?? "",
      startsAt: o.startDate ? o.startDate.slice(0, 10) : "",
      expiresAt: o.endDate ? o.endDate.slice(0, 10) : "",
      status: o.status,
    });
    setOfferDialogOpen(true);
  };

  const saveCoupon = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        code: couponForm.code.trim().toUpperCase(),
        name: couponForm.name.trim() || couponForm.code.trim(),
        type: couponForm.type,
        value: couponForm.value,
        minOrderAmount: couponForm.minOrderAmount || "0",
        maxDiscount: couponForm.maxDiscount || undefined,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
        perCustomerLimit: Number(couponForm.perCustomerLimit || 1),
        scopeType: couponForm.scopeType,
        isActive: couponForm.isActive,
        startsAt: couponForm.startsAt || undefined,
        expiresAt: couponForm.expiresAt || undefined,
      };
      if (couponForm.scopeType === "STORE") body.storeId = couponForm.storeId;
      if (couponForm.scopeType === "INDEPENDENT_SELLER") {
        body.independentSellerId = couponForm.independentSellerId;
      }

      if (editingCoupon) {
        await repositories.dashboard.updateCoupon(editingCoupon.id, body);
        toast.success("Coupon updated");
      } else {
        await repositories.dashboard.createCoupon(body);
        toast.success("Coupon created");
      }
      setCouponDialogOpen(false);
      await qc.invalidateQueries({ queryKey: ["coupons"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const saveOffer = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: offerForm.title.trim(),
        description: offerForm.description.trim() || undefined,
        imageUrl: offerForm.imageUrl.trim() || undefined,
        discountPercent: offerForm.discountPercent || undefined,
        linkedCouponCode: offerForm.linkedCouponCode.trim().toUpperCase() || undefined,
        status: offerForm.status,
        startsAt: offerForm.startsAt || undefined,
        expiresAt: offerForm.expiresAt || undefined,
      };

      if (editingOffer) {
        await repositories.dashboard.updateOffer(editingOffer.id, body);
        toast.success("Offer updated");
      } else {
        await repositories.dashboard.createOffer(body);
        toast.success("Offer created");
      }
      setOfferDialogOpen(false);
      await qc.invalidateQueries({ queryKey: ["offers"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (c: Coupon) => {
    try {
      await repositories.dashboard.updateCoupon(c.id, { isActive: !c.enabled });
      await qc.invalidateQueries({ queryKey: ["coupons"] });
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await repositories.dashboard.deleteCoupon(id);
      toast.success("Coupon deleted");
      await qc.invalidateQueries({ queryKey: ["coupons"] });
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await repositories.dashboard.deleteOffer(id);
      toast.success("Offer deleted");
      await qc.invalidateQueries({ queryKey: ["offers"] });
    } catch {
      toast.error("Failed to delete offer");
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Offers & Coupons" }]} />
      <PageHeader title="Offers & Coupons" />

      <Tabs defaultValue="coupons">
        <TabsList>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="offers">Marketing Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateCoupon}>Create coupon</Button>
          </div>
          {couponsLoading ? (
            <p className="text-sm text-muted-foreground">Loading coupons…</p>
          ) : (
            <div className="space-y-3">
              {(coupons ?? []).map((c) => (
                <Card key={c.id}>
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono font-bold">{c.code}</p>
                        <Badge variant="outline">{c.type}</Badge>
                        <Badge variant="secondary">{c.scopeType.replace(/_/g, " ")}</Badge>
                        {!c.enabled && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                      <p className="mt-1 text-sm font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{couponSummary(c)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={c.enabled} onCheckedChange={() => toggleCoupon(c)} />
                      <Button variant="outline" size="sm" onClick={() => openEditCoupon(c)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteCoupon(c.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!coupons?.length && (
                <p className="text-sm text-muted-foreground">No coupons yet.</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateOffer}>Create offer</Button>
          </div>
          {offersLoading ? (
            <p className="text-sm text-muted-foreground">Loading offers…</p>
          ) : (
            <div className="space-y-3">
              {(offers ?? []).map((o) => (
                <Card key={o.id}>
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{o.title}</p>
                        <Badge variant="outline">{o.status}</Badge>
                      </div>
                      {o.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {o.discountPercent ? `${o.discountPercent}% off` : "Promotional"}
                        {o.linkedCouponCode ? ` · Code: ${o.linkedCouponCode}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditOffer(o)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteOffer(o.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!offers?.length && (
                <p className="text-sm text-muted-foreground">No marketing offers yet.</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit coupon" : "Create coupon"}</DialogTitle>
            <DialogDescription>
              Coupons apply at checkout. Global coupons are platform-funded; store/seller coupons reduce seller payout.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
              />
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={couponForm.name}
                onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={couponForm.type}
                  onValueChange={(v) => setCouponForm({ ...couponForm, type: v as CouponForm["type"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Value</Label>
                <Input
                  value={couponForm.value}
                  onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Min order (₹)</Label>
                <Input
                  value={couponForm.minOrderAmount}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Max discount (₹)</Label>
                <Input
                  value={couponForm.maxDiscount}
                  onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Usage limit</Label>
                <Input
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Per customer limit</Label>
                <Input
                  value={couponForm.perCustomerLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, perCustomerLimit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Scope</Label>
              <Select
                value={couponForm.scopeType}
                onValueChange={(v) =>
                  setCouponForm({ ...couponForm, scopeType: v as CouponForm["scopeType"] })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Global (platform)</SelectItem>
                  <SelectItem value="STORE">Store</SelectItem>
                  <SelectItem value="INDEPENDENT_SELLER">Independent seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {couponForm.scopeType === "STORE" && (
              <div className="grid gap-2">
                <Label>Store</Label>
                <Select
                  value={couponForm.storeId}
                  onValueChange={(v) => setCouponForm({ ...couponForm, storeId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                  <SelectContent>
                    {storeOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {couponForm.scopeType === "INDEPENDENT_SELLER" && (
              <div className="grid gap-2">
                <Label>Independent seller</Label>
                <Select
                  value={couponForm.independentSellerId}
                  onValueChange={(v) => setCouponForm({ ...couponForm, independentSellerId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select seller" /></SelectTrigger>
                  <SelectContent>
                    {sellerOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Starts</Label>
                <Input
                  type="date"
                  value={couponForm.startsAt}
                  onChange={(e) => setCouponForm({ ...couponForm, startsAt: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Expires</Label>
                <Input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={couponForm.isActive}
                onCheckedChange={(v) => setCouponForm({ ...couponForm, isActive: v })}
              />
              <Label>Active</Label>
            </div>
            <Button onClick={saveCoupon} disabled={saving}>
              {saving ? "Saving…" : editingCoupon ? "Update coupon" : "Create coupon"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Edit offer" : "Create offer"}</DialogTitle>
            <DialogDescription>
              Marketing offers appear in the customer app. Link a coupon code for redemption.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={offerForm.title}
                onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={offerForm.description}
                onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Image URL</Label>
              <Input
                value={offerForm.imageUrl}
                onChange={(e) => setOfferForm({ ...offerForm, imageUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Discount %</Label>
                <Input
                  value={offerForm.discountPercent}
                  onChange={(e) => setOfferForm({ ...offerForm, discountPercent: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Linked coupon code</Label>
                <Input
                  value={offerForm.linkedCouponCode}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, linkedCouponCode: e.target.value.toUpperCase() })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={offerForm.status}
                onValueChange={(v) => setOfferForm({ ...offerForm, status: v as OfferForm["status"] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Starts</Label>
                <Input
                  type="date"
                  value={offerForm.startsAt}
                  onChange={(e) => setOfferForm({ ...offerForm, startsAt: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Expires</Label>
                <Input
                  type="date"
                  value={offerForm.expiresAt}
                  onChange={(e) => setOfferForm({ ...offerForm, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={saveOffer} disabled={saving}>
              {saving ? "Saving…" : editingOffer ? "Update offer" : "Create offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
