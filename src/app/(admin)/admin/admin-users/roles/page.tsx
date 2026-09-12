"use client";

import { PERMISSIONS, ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/permissions/matrix";
import type { AdminRole } from "@/lib/types";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const ROLES = Object.keys(ROLE_LABELS) as AdminRole[];
const ALL_PERMISSIONS = Object.keys(PERMISSIONS);

export default function RolesPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Admin Users", href: "/admin/admin-users" }, { label: "Roles & Permissions" }]} />
      <PageHeader title="Roles & Permissions Matrix" />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="sticky left-0 bg-muted/50 px-4 py-3 text-left font-medium">Permission</th>
              {ROLES.map((role) => (
                <th key={role} className="px-3 py-3 text-center font-medium whitespace-nowrap">{ROLE_LABELS[role]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_PERMISSIONS.map((perm) => (
              <tr key={perm} className="border-b">
                <td className="sticky left-0 bg-background px-4 py-2">
                  <p className="font-medium">{PERMISSIONS[perm as keyof typeof PERMISSIONS]}</p>
                  <code className="text-xs text-muted-foreground">{perm}</code>
                </td>
                {ROLES.map((role) => {
                  const has = ROLE_PERMISSIONS[role].includes(perm as keyof typeof PERMISSIONS);
                  return (
                    <td key={role} className="px-3 py-2 text-center">
                      {has ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <X className="mx-auto h-4 w-4 text-muted-foreground/30" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {ROLES.map((role) => (
          <Badge key={role} variant="outline">{ROLE_LABELS[role]}: {ROLE_PERMISSIONS[role].length} permissions</Badge>
        ))}
      </div>
    </div>
  );
}
