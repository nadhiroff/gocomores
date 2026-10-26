import { StarRating } from "@/components/site/star-rating";
import { formatDateLong } from "@/lib/format";
import type { ReviewData } from "@/lib/types";

export function ReviewItem({ review }: { review: ReviewData }) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="font-semibold">{review.authorName}</p>
        <time dateTime={review.createdAt.toISOString()} className="text-sm text-muted-foreground">
          {formatDateLong(review.createdAt)}
        </time>
      </header>
      <StarRating value={review.rating} className="mt-2" />
      <p className="mt-3 whitespace-pre-line break-words text-[0.9375rem] leading-relaxed">{review.comment}</p>
    </article>
  );
}
