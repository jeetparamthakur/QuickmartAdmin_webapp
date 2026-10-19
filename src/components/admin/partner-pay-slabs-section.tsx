"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  fee: "50",
  isActive: true,
});

export function PartnerPaySlabsSection({ partnerProfileId }: { partnerProfileId: string }) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaySlab | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: slabs, isLoading } = useQuery({
    queryKey: ["delivery-partner-pay-slabs", partnerProfileId],
    queryFn: () => adminApi.deliveryPartnerPaySlabs(partnerProfileId),
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
        partnerProfileId,
        minKm: Number(form.minKm),
        maxKm: Number(form.maxKm),
        fee: Number(form.fee),
        isActive: form.isActive,
      };
      if (editing) {
        await adminApi.updateDeliveryPartnerPaySlab(editing.id, body);
        toast.success("Override updated");
      } else {
        await adminApi.createDeliveryPartnerPaySlab(body);
        toast.success("Override added");
      }
      setDialogOpen(false);
      await qc.invalidateQueries({ queryKey: ["delivery-partner-pay-slabs", partnerProfileId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slab: PaySlab) {
    if (!confirm("Remove this override slab?")) return;
    try {
      await adminApi.deleteDeliveryPartnerPaySlab(slab.id);
      await qc.invalidateQueries({ queryKey: ["delivery-partner-pay-slabs", partnerProfileId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Pay override</CardTitle>
          <p className="text-sm text-muted-foreground">
            {slabs?.length
              ? "This partner uses custom distance slabs instead of global rules."
              : "No override — global Partner Pay slabs apply."}
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>Add override</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading pay rules…</p>
        ) : !slabs?.length ? (
          <p className="text-sm text-muted-foreground">Using global rules</p>
        ) : (
          slabs.map((slab) => (
            <div
              key={slab.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
            >
              <div>
                <span className="font-medium">{slab.minKm}–{slab.maxKm} km</span>
                {!slab.isActive && (
                  <Badge variant="secondary" className="ml-2">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatCurrency(slab.fee)}</span>
                <Button size="sm" variant="outline" onClick={() => openEdit(slab)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(slab)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit override" : "Add pay override"}</DialogTitle>
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
    </Card>
  );
}
