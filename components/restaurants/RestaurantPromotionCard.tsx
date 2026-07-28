import {
  CalendarDays,
  Clock3,
  Tag,
} from "lucide-react";

import { formatPromotionPrice } from "@/lib/restaurants/promotion-price";

import type { PublicRestaurantPromotion } from "@/types/public-restaurants";

type RestaurantPromotionCardProps = {
  promotion: PublicRestaurantPromotion;
};

function formatDay(day: string): string {
  return (
    day.charAt(0).toLocaleUpperCase("es-MX") +
    day.slice(1)
  );
}

function formatPromotionDays(
  promotion: PublicRestaurantPromotion,
): string {
  if (promotion.days.length === 0) {
    return "Consulta disponibilidad";
  }

  return promotion.days.map(formatDay).join(", ");
}

function formatPromotionHours(
  promotion: PublicRestaurantPromotion,
): string | null {
  if (!promotion.startTime || !promotion.endTime) {
    return null;
  }

  return `${promotion.startTime} – ${promotion.endTime}`;
}

export function RestaurantPromotionCard({
  promotion,
}: RestaurantPromotionCardProps) {
  const promotionHours =
    formatPromotionHours(promotion);

  const formattedPrice =
    formatPromotionPrice(promotion.price);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-orange-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-700">
        {promotion.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promotion.image}
            alt={promotion.title}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute -left-16 -top-16 size-44 rounded-full bg-white/20 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-20 right-0 size-48 rounded-full bg-blue-500/30 blur-3xl"
            />

            <div className="relative flex size-20 items-center justify-center rounded-[1.5rem] bg-white/15 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
              <Tag
                aria-hidden="true"
                className="size-9 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
              />
            </div>
          </>
        )}

        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-orange-600 shadow-sm backdrop-blur-md">
          Promoción
        </span>

        {formattedPrice && (
          <span className="absolute right-4 top-4 inline-flex items-center rounded-full border border-white/40 bg-emerald-500 px-4 py-2 text-base font-extrabold text-white shadow-lg shadow-slate-950/20 backdrop-blur-md">
            {formattedPrice}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-bold tracking-tight text-slate-950">
          {promotion.title}
        </h3>

        {promotion.description ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {promotion.description}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Consulta los detalles directamente con el restaurante.
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
            <CalendarDays
              aria-hidden="true"
              className="size-3.5"
            />

            {formatPromotionDays(promotion)}
          </span>

          {promotionHours && (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <Clock3
                aria-hidden="true"
                className="size-3.5"
              />

              {promotionHours}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}