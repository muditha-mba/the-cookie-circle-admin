"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { PageActions, PrimaryLink } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ReviewDetailView } from "@/components/reviews/ReviewDetailView";
import { routes } from "@/config/routes";
import { reviewsApi } from "@/lib/api/reviews";

export default function ReviewDetailPage() {
  const params = useParams<{ id: string }>();

  const reviewQuery = useQuery({
    queryKey: ["reviews", params.id],
    queryFn: () => reviewsApi.get(params.id),
    enabled: Boolean(params.id),
  });

  if (reviewQuery.isLoading) {
    return (
      <DashboardPageShell title="Review" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <DashboardPageShell title="Review" description="Not found">
        <p className="text-sm text-danger">Review not found.</p>
        <PageActions backHref={routes.reviews.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  const review = reviewQuery.data;

  return (
    <DashboardPageShell
      title={`Review · ${review.order_number}`}
      description={`${review.customer_name} · ${review.rating}/5 overall`}
    >
      <PageActions backHref={routes.reviews.list} className="mb-6">
        <PrimaryLink href={routes.orders.detail(review.order_id)}>View order</PrimaryLink>
      </PageActions>
      <ReviewDetailView review={review} />
    </DashboardPageShell>
  );
}
