"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => repositories.dashboard.getSystemSettings() });
  const { data: flags } = useQuery({ queryKey: ["feature-flags"], queryFn: () => repositories.dashboard.getFeatureFlags() });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <PageHeader
        title="Platform Settings"
        description="Configure your SaaS marketplace — branding, fees, defaults, and feature flags."
      />
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {settings && (
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                {[["Platform Name", settings.platformName], ["Support Email", settings.supportEmail], ["Support Phone", settings.supportPhone], ["Currency", settings.currency], ["Timezone", settings.timezone]].map(([l, v]) => (
                  <div key={String(l)}><Label>{l}</Label><Input defaultValue={String(v)} /></div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="defaults">
          {settings && (
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                {[["Min Order Value", settings.minOrderValue], ["Max Order Value", settings.maxOrderValue], ["Default Delivery Radius", settings.defaultDeliveryRadius], ["Default Commission %", settings.defaultCommission], ["Default Platform Fee", settings.defaultPlatformFee]].map(([l, v]) => (
                  <div key={String(l)}><Label>{l}</Label><Input type="number" defaultValue={Number(v)} /></div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flags">
          <div className="space-y-3">
            {flags?.map((f) => (
              <div key={f.key} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{f.label}</p>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                  <code className="text-xs text-muted-foreground">{f.key}</code>
                </div>
                <Switch checked={f.enabled} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
