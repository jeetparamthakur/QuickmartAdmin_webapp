"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/types";

function CategoryTree({ categories, parentId = null, level = 0 }: { categories: Category[]; parentId?: string | null; level?: number }) {
  const items = categories.filter((c) => c.parentId === parentId);
  return (
    <ul className={level > 0 ? "ml-6 border-l pl-4" : ""}>
      {items.map((cat) => (
        <li key={cat.id} className="mb-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{cat.name}</span>
              <Badge variant="outline">Order: {cat.displayOrder}</Badge>
            </div>
            <Switch checked={cat.enabled} />
          </div>
          <CategoryTree categories={categories} parentId={cat.id} level={level + 1} />
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage() {
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => repositories.dashboard.getCategories() });
  return (
    <div>
      <Breadcrumbs items={[{ label: "Categories" }]} />
      <h1 className="mb-4 text-2xl font-bold">Category Management</h1>
      {categories && <CategoryTree categories={categories} />}
    </div>
  );
}
