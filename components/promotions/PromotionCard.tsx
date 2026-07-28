import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Flame,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatPromotionDays,
  formatPromotionTime,
} from "@/lib/week-days";
import type {
  Restaurant,
  RestaurantPromotion,
} from "@/types/restaurant";

type PromotionCardProps = {
  promotion: RestaurantPromotion;
  restaurant: Restaurant;
  compact?: boolean;
};

export function PromotionCard({
  promotion,
  restaurant,
  compact = false,
}: PromotionCardProps) {
  const promotionTime = formatPromotionTime(
    promotion.startTime,
    promotion.endTime,
  );

  return (
    <article
      className={[
        "group min-w-0 overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        compact ? "w-[82vw] max-w-[340px] shrink-0" : "",
      ].join(" ")}
    >
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-white">
        <Utensils
          aria-hidden="true"
          className="size-14 text-orange-400 transition-transform duration-300 group-hover:scale-110"
        />

        <div className="absolute left-4 top-4">
          <Badge className="rounded-full bg-orange-500 text-white hover:bg-orange-500">
            <Flame aria-hidden="true" className="mr-1 size-3.5" />
            Promoción
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold text-orange-600">
          {restaurant.name}
        </p>

        <h3 className="mt-2 text-xl font-bold leading-tight text-slate-950">
          {promotion.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
          {promotion.description}
        </p>

        <div className="mt-5 space-y-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Flame
              aria-hidden="true"
              className="size-4 shrink-0 text-orange-500"
            />
            <span>{formatPromotionDays(promotion.days)}</span>
          </div>

          {promotionTime && (
            <div className="flex items-center gap-2">
              <Clock3
                aria-hidden="true"
                className="size-4 shrink-0 text-blue-600"
              />
              <span>{promotionTime}</span>
            </div>
          )}
        </div>

        <Link
          href={`/comer/${restaurant.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-950 transition-colors hover:text-orange-600"
        >
          Ver restaurante
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}