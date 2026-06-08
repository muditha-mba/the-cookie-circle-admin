"use client";

import { useQuery } from "@tanstack/react-query";

import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ReviewList } from "@/components/reviews/ReviewList";
import { reviewsApi } from "@/lib/api/reviews";

export default function ReviewsPage() {
  const reviewsQuery = useQuery({
    queryKey: ["reviews", { page: 1 }],
    queryFn: () => reviewsApi.list({ page: 1, page_size: 50 }),
  });

  const analyticsQuery = useQuery({
    queryKey: ["reviews", "analytics"],
    queryFn: () => reviewsApi.analyticsSummary(),
  });

  const analytics = analyticsQuery.data;

  return (
    <DashboardPageShell
      title="Customer Reviews"
      description="Read-only visibility into order reviews submitted by customers."
    >
      {analytics ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Total reviews</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {analytics.total_reviews}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Average rating</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {analytics.average_rating?.toFixed(1) ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Thumbs up</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {analytics.positive_item_feedback}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Most liked item</p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {analytics.most_liked_product ?? "—"}
            </p>
          </div>
        </div>
      ) : null}

      {reviewsQuery.isLoading ? (
        <p className="text-sm text-text-muted">Loading reviews…</p>
      ) : reviewsQuery.isError ? (
        <p className="text-sm text-danger">Unable to load reviews.</p>
      ) : (
        <ReviewList
          reviews={reviewsQuery.data?.items ?? []}
          isLoading={reviewsQuery.isLoading}
        />
      )}
    </DashboardPageShell>
  );
}
