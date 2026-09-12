"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { ApiClientError } from "@/lib/api/client";
import { repositories } from "@/lib/repositories";
import type { Banner, BannerPlacement } from "@/lib/types";
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
import { toast } from "sonner";

type FormState = {
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: BannerPlacement;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  imageUrl: "",
  linkUrl: "",
  placement: "HOME_TOP",
  sortOrder: "0",
  isActive: true,
});

const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  HOME_TOP: "Home — Top carousel",
  HOME_MIDDLE: "Home — Middle / announcements",
  CATEGORY: "Category page",
};

export default function BannersPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: banners, isLoading, isError } = useQuery({
    queryKey: ["banners"],
    queryFn: () => repositories.dashboard.getBanners(),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? "",
      placement: banner.placement,
      sortOrder: String(banner.sortOrder),
      isActive: banner.isActive,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a JPEG, PNG, or WebP image");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await adminApi.uploadFile(file, "banners");
      setForm((f) => ({ ...f, imageUrl: uploaded.url }));
      toast.success("Image uploaded");
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to upload image to Cloudinary";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    imageUrl: form.imageUrl.trim(),
    linkUrl: form.linkUrl.trim() || undefined,
    placement: form.placement,
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive,
  });

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error("Title and image URL are required");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await repositories.dashboard.updateBanner(editing.id, buildPayload());
        toast.success("Banner updated");
      } else {
        await repositories.dashboard.createBanner(buildPayload());
        toast.success("Banner created");
      }
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["banners"] });
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner: Banner, isActive: boolean) => {
    try {
      await repositories.dashboard.updateBanner(banner.id, { isActive });
      qc.invalidateQueries({ queryKey: ["banners"] });
    } catch {
      toast.error("Failed to update banner");
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
    try {
      await repositories.dashboard.deleteBanner(banner.id);
      toast.success("Banner deleted");
      qc.invalidateQueries({ queryKey: ["banners"] });
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Banners" }]} />
      <PageHeader
        title="Banner Management"
        description="Create homepage and category banners shown in the customer and store apps."
      >
        <Button onClick={openCreate}>Add Banner</Button>
      </PageHeader>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading banners...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load banners.</p>
      ) : !banners?.length ? (
        <p className="text-sm text-muted-foreground">No banners yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="relative aspect-[8/3] bg-muted">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
                {!banner.isActive && (
                  <Badge variant="secondary" className="absolute right-2 top-2">
                    Inactive
                  </Badge>
                )}
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="font-medium">{banner.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline">{PLACEMENT_LABELS[banner.placement]}</Badge>
                    <Badge variant="outline">Order: {banner.sortOrder}</Badge>
                  </div>
                  {banner.linkUrl && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{banner.linkUrl}</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.isActive}
                      onCheckedChange={(checked) => handleToggle(banner, checked)}
                    />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(banner)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(banner)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Add Banner"}</DialogTitle>
            <DialogDescription>
              Banners appear on the customer home screen and store partner dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Weekend Sale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Banner image</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://res.cloudinary.com/..."
                  className="min-w-[220px] flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageUpload(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Uploads go to your Cloudinary account (same as KYC). Max 5MB — JPEG, PNG, or WebP.
              </p>
              {form.imageUrl && (
                <div className="relative aspect-[8/3] overflow-hidden rounded-md border">
                  <Image src={form.imageUrl} alt="Preview" fill unoptimized className="object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link URL (optional)</Label>
              <Input
                id="linkUrl"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/category/uuid, /store/uuid, /product/uuid, or https://..."
              />
              <p className="text-xs text-muted-foreground">
                Use /category/&#123;id&#125;, /store/&#123;id&#125;, /product/&#123;id&#125;, or an external https URL.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Placement</Label>
                <Select
                  value={form.placement}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, placement: value as BannerPlacement }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME_TOP">Home — Top carousel</SelectItem>
                    <SelectItem value="HOME_MIDDLE">Home — Middle / announcements</SelectItem>
                    <SelectItem value="CATEGORY">Category page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
