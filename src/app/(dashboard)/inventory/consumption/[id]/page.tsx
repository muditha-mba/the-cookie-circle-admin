"use client";

import { useParams } from "next/navigation";

import { ConsumptionProposalDetail } from "@/components/inventory/ConsumptionProposalDetail";

export default function ConsumptionProposalDetailPage() {
  const params = useParams<{ id: string }>();
  return <ConsumptionProposalDetail proposalId={params.id} />;
}
