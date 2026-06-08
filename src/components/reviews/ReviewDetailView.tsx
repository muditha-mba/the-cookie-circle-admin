"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { routes } from "@/config/routes";
import type { OrderReview } from "@/lib/api/reviews";
import { formatCount, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type ReviewDetailViewProps = {
  review: OrderReview;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold-accent" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-text-muted">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewDetailView({ review }: ReviewDetailViewProps) {
  return (
    <div className="space-y-8">
      <DetailMetadataCard>
        <DetailField label="Order" value={review.order_number} />
        <DetailField
          label="Customer"
          value={
            <Link
              href={routes.customers.detail(review.customer_id)}
              className="text-primary hover:underline"
            >
              {review.customer_name}
            </Link>
          }
        />
        <DetailField label="Overall rating" value={<Stars rating={review.rating} />} />
        <DetailField label="Submitted" value={formatDateTime(review.created_at)} />
      </DetailMetadataCard>

      {review.order_tag_labels.length > 0 ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Order feedback
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {review.order_tag_labels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-border bg-surface-hover px-3 py-1 text-xs text-text-primary"
              >
                {label}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {review.comment ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Customer comment
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{review.comment}</p>
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Item feedback
        </h3>
        <ul className="mt-4 space-y-3">
          {review.items.map((item) => (
            <li
              key={item.product_id}
              className="rounded-md border border-border bg-surface-hover/40 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-text-primary">{item.product_name}</p>
                  <p className="text-xs text-text-muted">
                    Qty {formatCount(item.quantity)}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    item.sentiment === "positive"
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger",
                  )}
                >
                  {item.sentiment === "positive" ? (
                    <ThumbsUp size={14} />
                  ) : (
                    <ThumbsDown size={14} />
                  )}
                  {item.sentiment === "positive" ? "Thumbs up" : "Thumbs down"}
                </span>
              </div>
              {item.tag_labels.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.tag_labels.map((label) => (
                    <span key={label} className="text-xs text-text-secondary">
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
