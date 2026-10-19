"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

type PaySlab = {
  id: string;
  partnerProfileId: string | null;
  minKm: number;
  maxKm: number;
  fee: number;
  isActive: boolean;
};

type FormState = {
  minKm: string;
  maxKm: string;
  fee: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  minKm: "0",
  maxKm: "5",
  fee: "40",
  isActive: true,
});

export default function DeliveryPartnerPayPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaySlab | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: slabs, isLoading } = useQuery({
    queryKey: ["delivery-partner-pay-slabs", "global"],
    queryFn: () => adminApi.deliveryPartnerPaySlabs(),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(slab: PaySlab) {
    setEditing(slab);
    setForm({
      minKm: String(slab.minKm),
      maxKm: String(slab.maxKm),
      fee: String(slab.fee),
      isActive: slab.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        minKm: Number(form.minKm),
        maxKm: Number(form.maxKm),
        fee: Number(form.fee),
        isActive: form.isActive,
      };
      if (editing) {
        await adminApi.updateDeliveryPartnerPaySlab(editing.id, body);
        toast.success("Slab updated");
      } else {
        await adminApi.createDeliveryPartnerPaySlab(body);
        toast.success("Slab created");
      }
      setDialogOpen(false);
      await qc.invalidateQueries({ queryKey: ["delivery-partner-pay-slabs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save slab");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slab: PaySlab) {
    if (!confirm("Delete this pay slab?")) return;
    try {
      await adminApi.deleteDeliveryPartnerPaySlab(slab.id);
      toast.success("Slab deleted");
      await qc.invalidateQueries({ queryKey: ["delivery-partner-pay-slabs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  }

  async function handleToggle(slab: PaySlab, isActive: boolean) {
    try {
      await adminApi.updateDeliveryPartnerPaySlab(slab.id, { isActive });
      await qc.invalidateQueries({ queryKey: ["delivery-partner-pay-slabs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Partner Pay" }]} />
      <PageHeader
        title="Delivery partner pay"
        description="Global per-order pay by pickup-to-customer distance. Partners without overrides use these slabs."
      >
        <Button onClick={openCreate}>Add slab</Button>
      </PageHeader>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !slabs?.length ? (
        <p className="text-sm text-muted-foreground">No global pay slabs yet.</p>
      ) : (
        <div className="space-y-3">
          {slabs.map((slab) => (
            <Card key={slab.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {slab.minKm}–{slab.maxKm} km
                  </p>
                  <p className="text-sm text-muted-foreground">Global default</p>
                  {!slab.isActive && <Badge variant="secondary">Inactive</Badge>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{formatCurrency(slab.fee)}</span>
                  <Switch
                    checked={slab.isActive}
                    onCheckedChange={(checked) => handleToggle(slab, checked)}
                  />
                  <Button size="sm" variant="outline" onClick={() => openEdit(slab)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(slab)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit pay slab" : "Add pay slab"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min km</Label>
                <Input
                  type="number"
                  value={form.minKm}
                  onChange={(e) => setForm((f) => ({ ...f, minKm: e.target.value }))}
                />
              </div>
              <div>
                <Label>Max km</Label>
                <Input
                  type="number"
                  value={form.maxKm}
                  onChange={(e) => setForm((f) => ({ ...f, maxKm: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Partner earns (₹)</Label>
              <Input
                type="number"
                value={form.fee}
                onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
