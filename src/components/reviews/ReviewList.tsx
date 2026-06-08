"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

import { DataTable } from "@/components/data/DataTable";
import { routes } from "@/config/routes";
import type { OrderReview } from "@/lib/api/reviews";
import { formatDateTime } from "@/lib/format";

type ReviewListProps = {
  reviews: OrderReview[];
  isLoading?: boolean;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold-accent" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-text-muted">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  const columns = useMemo<ColumnDef<OrderReview>[]>(
    () => [
      {
        header: "Rating",
        id: "rating",
        cell: ({ row }) => <Stars rating={row.original.rating} />,
      },
      {
        header: "Order",
        id: "order",
        cell: ({ row }) => (
          <div>
            <Link
              href={routes.reviews.detail(row.original.id)}
              className="font-medium text-text-primary hover:text-accent"
            >
              {row.original.order_number}
            </Link>
            <p className="text-xs text-text-muted">
              {row.original.items.length} item
              {row.original.items.length === 1 ? "" : "s"} reviewed
            </p>
          </div>
        ),
      },
      {
        header: "Customer",
        id: "customer",
        cell: ({ row }) => (
          <Link
            href={routes.customers.detail(row.original.customer_id)}
            className="text-text-primary hover:text-accent"
          >
            {row.original.customer_name}
          </Link>
        ),
      },
      {
        header: "Order tags",
        id: "tags",
        cell: ({ row }) => (
          <p className="max-w-xs truncate text-text-secondary">
            {row.original.order_tag_labels.join(", ") || "—"}
          </p>
        ),
      },
      {
        header: "Comment",
        id: "comment",
        cell: ({ row }) => (
          <p className="max-w-md truncate text-text-secondary">
            {row.original.comment ?? "—"}
          </p>
        ),
      },
      {
        header: "Submitted",
        id: "created",
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={reviews}
      isLoading={isLoading}
      emptyMessage="No customer reviews yet."
    />
  );
}
