import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { FoodItem, FoodSetup } from "@/lib/types";

function formatTimings(foodSetup: FoodSetup) {
  if (foodSetup.is24Hours) return "Open 24 hours";
  if (foodSetup.openingTime && foodSetup.closingTime) {
    return `${foodSetup.openingTime} – ${foodSetup.closingTime}`;
  }
  return "—";
}

function FoodItemCard({ item }: { item: FoodItem }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex gap-3">
        {item.imageUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{item.name}</p>
            <Badge variant={item.isVeg ? "success" : "secondary"}>
              {item.isVeg ? "Veg" : "Non-Veg"}
            </Badge>
          </div>
          {item.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <span className="font-medium">{formatCurrency(item.price)}</span>
            <span className="text-muted-foreground">{item.prepTimeMinutes} min prep</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FoodSetupPanel({ foodSetup }: { foodSetup?: FoodSetup | Record<string, unknown> }) {
  if (!foodSetup || Object.keys(foodSetup).length === 0) {
    return <p className="text-sm text-muted-foreground">No food setup details provided.</p>;
  }

  const setup = foodSetup as FoodSetup;
  const items = Array.isArray(setup.items) ? setup.items : [];

  const details = [
    ["Restaurant Name", setup.name],
    ["Description", setup.description],
    ["Cuisine", setup.cuisine],
    ["FSSAI Number", setup.fssaiNumber],
    ["Contact", setup.contactNumber],
    ["Address", setup.address],
    ["City", setup.city],
    ["Area", setup.area],
    ["Pincode", setup.pincode],
    ["Delivery Radius", setup.deliveryRadius ? `${setup.deliveryRadius} km` : undefined],
    ["Timings", formatTimings(setup)],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium break-words">{String(value)}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Menu Items</h3>
          <Badge variant="outline">{items.length} items</Badge>
        </div>
        {items.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((item, index) => (
              <FoodItemCard key={item.id ?? `${item.name}-${index}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No menu items added yet.</p>
        )}
      </div>
    </div>
  );
}
