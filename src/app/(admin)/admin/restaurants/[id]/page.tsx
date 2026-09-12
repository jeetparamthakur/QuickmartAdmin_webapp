"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { DetailTabs } from "@/components/admin/detail-tabs";
import { StatusBadge } from "@/components/admin/status-badge";
import { FoodSetupPanel } from "@/components/admin/food-setup-panel";
import { EntityActionDialog } from "@/components/admin/entity-action-dialog";
import { MapView } from "@/components/admin/map-view";
import { useAuth } from "@/lib/auth/context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, can } = useAuth();
  const qc = useQueryClient();
  const [action, setAction] = useState<{
    type: string;
    title: string;
    desc: string;
    data: Partial<import("@/lib/types").Restaurant>;
  } | null>(null);

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => repositories.restaurants.getById(id),
  });

  if (!restaurant) return <p>Loading...</p>;

  const handleAction = async (reason?: string) => {
    if (!action || !user) return;
    await repositories.restaurants.update(id, action.data, { id: user.id, name: user.name }, action.title, reason);
    qc.invalidateQueries({ queryKey: ["restaurant", id] });
    qc.invalidateQueries({ queryKey: ["restaurants"] });
    setAction(null);
  };

  const tabs = [
    {
      value: "basic",
      label: "Basic Info",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Restaurant", restaurant.name],
            ["Owner", restaurant.ownerName],
            ["Phone", restaurant.ownerPhone],
            ["Email", restaurant.ownerEmail],
            ["Cuisine", restaurant.cuisine ?? "—"],
            ["Address", `${restaurant.address.line1}, ${restaurant.address.city}`],
            ["Timings", restaurant.timings],
            ["Delivery Radius", `${restaurant.deliveryRadius} km`],
            ["Registration", formatDate(restaurant.registrationDate)],
            ["Status", null],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">
                {label === "Status" ? <StatusBadge status={restaurant.status} /> : value}
              </p>
            </div>
          ))}
          <div className="col-span-full">
            <MapView
              center={{ lat: restaurant.address.lat, lng: restaurant.address.lng }}
              zoom={14}
              markers={[
                {
                  id: restaurant.id,
                  lat: restaurant.address.lat,
                  lng: restaurant.address.lng,
                  label: restaurant.name,
                  type: "store",
                },
              ]}
              height="250px"
            />
          </div>
        </div>
      ),
    },
    {
      value: "menu",
      label: `Menu (${restaurant.totalMenuItems})`,
      content: <FoodSetupPanel foodSetup={restaurant.foodSetup} />,
    },
    {
      value: "performance",
      label: "Performance",
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Today's Orders", restaurant.todayOrders],
            ["Total Orders", restaurant.totalOrders],
            ["Today's Sales", formatCurrency(restaurant.todaySales)],
            ["Total Sales", formatCurrency(restaurant.totalSales)],
            ["Rating", restaurant.rating],
            ["Commission", `${restaurant.commissionOverride ?? restaurant.platformCommission}%`],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    {
      value: "controls",
      label: "Admin Controls",
      content: can("stores.manage") ? (
        <div className="flex flex-wrap gap-2">
          {[
            {
              type: "Activate",
              title: "Restaurant Activated",
              desc: "Activate this restaurant",
              data: { status: "ACTIVE" as const },
            },
            {
              type: "Suspend",
              title: "Restaurant Suspended",
              desc: "Suspend this restaurant",
              data: { status: "SUSPENDED" as const },
            },
          ].map((item) => (
            <Button
              key={item.type}
              variant={item.type === "Suspend" ? "destructive" : "outline"}
              size="sm"
              onClick={() =>
                setAction({
                  type: item.type,
                  title: item.title,
                  desc: item.desc,
                  data: item.data,
                })
              }
            >
              {item.type}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No permission</p>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Restaurants", href: "/admin/restaurants" },
          { label: restaurant.name },
        ]}
      />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <StatusBadge status={restaurant.status} />
        </div>
      </div>
      <DetailTabs tabs={tabs} />
      <EntityActionDialog
        open={!!action}
        onOpenChange={() => setAction(null)}
        title={action?.title ?? ""}
        description={action?.desc ?? ""}
        onConfirm={handleAction}
        destructive={action?.type === "Suspend"}
      />
    </div>
  );
}
