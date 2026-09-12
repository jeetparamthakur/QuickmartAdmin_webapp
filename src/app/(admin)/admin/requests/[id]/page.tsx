"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { DetailTabs } from "@/components/admin/detail-tabs";
import { StatusBadge } from "@/components/admin/status-badge";
import { EntityActionDialog } from "@/components/admin/entity-action-dialog";
import { useAuth } from "@/lib/auth/context";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FoodSetupPanel } from "@/components/admin/food-setup-panel";
import { PARTNER_TYPE_LABELS } from "@/lib/constants/partnerTypes";

const DOCUMENT_LABELS: Record<string, string> = {
  pan: "PAN Card",
  gst: "GST Certificate",
  business: "Business Proof",
  address_proof: "Address Proof",
};

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function renderDetails(data?: Record<string, unknown>) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-muted-foreground">No details provided.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">{formatLabel(key)}</p>
          <p className="font-medium break-words">
            {typeof value === "object" ? JSON.stringify(value) : String(value ?? "-")}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const qc = useQueryClient();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => repositories.requests.getById(id),
  });

  if (isLoading || !request) {
    return <p>Loading...</p>;
  }

  const canReview =
    can("requests.manage") &&
    (request.status === "pending" || request.status === "under_review");

  const handleReview = async (reason?: string) => {
    if (!action) return;
    await repositories.requests.review(
      id,
      action === "approve" ? "approved" : "rejected",
      reason,
    );
    qc.invalidateQueries({ queryKey: ["request", id] });
    qc.invalidateQueries({ queryKey: ["requests"] });
    setAction(null);
  };

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Applicant", request.name],
            ["Type", PARTNER_TYPE_LABELS[request.partnerType] ?? request.partnerType],
            ["Phone", request.phone ?? "-"],
            ["Email", request.email ?? "-"],
            ["Request Type", request.requestType === "KYC_ONBOARDING" ? "KYC / Onboarding" : "Delivery Partner"],
            ["Onboarding Step", request.onboardingStep?.replace(/_/g, " ") ?? "-"],
            ["Submitted", formatDateTime(request.submittedAt ?? request.createdAt)],
            ["Reviewed", request.reviewedAt ? formatDateTime(request.reviewedAt) : "-"],
            ["Rejection Reason", request.rejectionReason ?? "-"],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      value: "documents",
      label: `Documents (${request.documents?.length ?? 0})`,
      content: request.documents?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {request.documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{DOCUMENT_LABELS[doc.type] ?? doc.type}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {formatDateTime(doc.uploadedAt)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.uri} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      View
                    </a>
                  </Button>
                </div>
                {doc.uri.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={doc.uri}
                      alt={DOCUMENT_LABELS[doc.type] ?? doc.type}
                      fill
                      unoptimized
                      className="rounded-md border object-contain bg-muted"
                    />
                  </div>
                ) : (
                  <div className="rounded-md border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
                    Document preview not available. Use View to open the file.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No documents uploaded.</p>
      ),
    },
    {
      value: "business",
      label: "Business Details",
      content: renderDetails(request.businessDetails),
    },
    {
      value: "store",
      label: "Store Details",
      content: renderDetails(request.storeDetails),
    },
    {
      value: "seller",
      label: "Seller Setup",
      content: renderDetails(request.sellerSetup),
    },
    {
      value: "food",
      label: "Food Setup",
      content: <FoodSetupPanel foodSetup={request.foodSetup} />,
    },
    {
      value: "bank",
      label: "Bank Details",
      content: renderDetails(request.bankDetails),
    },
  ].filter((tab) => {
    if (tab.value === "store" && request.partnerType !== "STORE") return false;
    if (tab.value === "seller" && request.partnerType !== "INDEPENDENT_SELLER") return false;
    if (tab.value === "food" && request.partnerType !== "FOOD_STORE") return false;
    if (tab.value === "business" && request.partnerType === "DELIVERY_PARTNER") return false;
    if (tab.value === "bank" && request.partnerType === "DELIVERY_PARTNER") return false;
    return true;
  });

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Requests", href: "/admin/requests" },
          { label: request.name },
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{request.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <span className="text-sm text-muted-foreground">
              {PARTNER_TYPE_LABELS[request.partnerType] ?? request.partnerType}
            </span>
          </div>
        </div>
        {canReview && (
          <div className="flex gap-2">
            <Button onClick={() => setAction("approve")}>Approve</Button>
            <Button variant="destructive" onClick={() => setAction("reject")}>
              Reject
            </Button>
          </div>
        )}
      </div>

      <DetailTabs tabs={tabs} />

      <EntityActionDialog
        open={action === "approve"}
        onOpenChange={(open) => !open && setAction(null)}
        title="Approve Request"
        description={`Approve ${request.name}'s application? They will be activated on the platform.`}
        requireReason={false}
        onConfirm={handleReview}
      />
      <EntityActionDialog
        open={action === "reject"}
        onOpenChange={(open) => !open && setAction(null)}
        title="Reject Request"
        description={`Reject ${request.name}'s application. Provide a reason so they can resubmit.`}
        requireReason
        destructive
        onConfirm={handleReview}
      />
    </div>
  );
}
