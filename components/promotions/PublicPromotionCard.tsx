import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LockKeyhole,
  MapPin,
  Tag,
} from "lucide-react";

import { formatPromotionPrice } from "@/lib/restaurants/promotion-price";

import type {
  PublicRestaurant,
  PublicRestaurantPromotion,
} from "@/types/public-restaurants";

type PublicPromotionCardProps = {
  promotion: PublicRestaurantPromotion;
  restaurant: PublicRestaurant;
  locked?: boolean;
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

  return promotion.days
    .map(formatDay)
    .join(", ");
}

function formatPromotionHours(
  promotion: PublicRestaurantPromotion,
): string | null {
  if (
    !promotion.startTime ||
    !promotion.endTime
  ) {
    return null;
  }

  return `${promotion.startTime} – ${promotion.endTime}`;
}

export function PublicPromotionCard({
  promotion,
  restaurant,
  locked = false,
}: PublicPromotionCardProps) {
  const promotionHours =
    formatPromotionHours(promotion);

  const formattedPrice =
    formatPromotionPrice(promotion.price);

  if (locked) {
    return (
      <article className="group grid h-[31rem] min-w-0 grid-rows-[72%_28%] overflow-hidden rounded-[1.5rem] border border-orange-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-[34rem] sm:rounded-[2rem]">
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600">
          {promotion.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={promotion.image}
              alt={`Promoción de ${restaurant.name}`}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <Tag
              aria-hidden="true"
              className="size-12 text-white/90 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:size-16"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/10" />

          <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-slate-950/75 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-slate-950/20 backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
              <LockKeyhole
                aria-hidden="true"
                className="size-3.5"
              />

              Promoción
            </span>
          </div>

          <div className="absolute inset-x-3 bottom-3 min-w-0 sm:inset-x-5 sm:bottom-5">
            <p className="truncate text-xs font-bold text-white sm:text-sm">
              {restaurant.name}
            </p>

            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-white/85 sm:text-xs">
              <MapPin
                aria-hidden="true"
                className="size-3 shrink-0 sm:size-3.5"
              />

              <span className="truncate">
                {restaurant.zone}
              </span>
            </p>
          </div>
        </div>

        <div className="flex min-h-0 items-center p-3 sm:p-5">
          <Link
            href="/login?redirect=%2Fcomer"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <LockKeyhole
              aria-hidden="true"
              className="size-4"
            />

            Inicia sesión gratis
          </Link>
        </div>
      </article>
    );
  }

  return (
    <Link
      href={`/comer/${restaurant.slug}`}
      className="group grid h-[31rem] min-w-0 grid-rows-[72%_28%] overflow-hidden rounded-[1.5rem] border border-orange-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-[34rem] sm:rounded-[2rem]"
    >
      <div className="relative flex min-h-0 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600">
        {promotion.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promotion.image}
            alt={promotion.title}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <Tag
            aria-hidden="true"
            className="size-12 text-white/90 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:size-16"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/10" />

        {formattedPrice && (
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
            <span className="inline-flex items-center rounded-full border border-white/40 bg-emerald-500 px-3 py-1.5 text-sm font-extrabold text-white shadow-lg shadow-slate-950/20 backdrop-blur-md sm:px-4 sm:py-2 sm:text-base">
              {formattedPrice}
            </span>
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 min-w-0 sm:inset-x-5 sm:bottom-5">
          <p className="truncate text-xs font-bold text-white sm:text-sm">
            {restaurant.name}
          </p>

          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-white/85 sm:text-xs">
            <MapPin
              aria-hidden="true"
              className="size-3 shrink-0 sm:size-3.5"
            />

            <span className="truncate">
              {restaurant.zone}
            </span>
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-col p-3 sm:p-5">
        <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
          <h3 className="line-clamp-2 min-w-0 text-base font-bold leading-tight tracking-tight text-slate-950 sm:text-xl">
            {promotion.title}
          </h3>

          <ArrowRight
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-600 sm:mt-1 sm:size-5"
          />
        </div>

        {promotion.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 sm:mt-3 sm:text-sm sm:leading-6">
            {promotion.description}
          </p>
        )}

        <div className="mt-auto flex min-w-0 flex-wrap gap-1.5 pt-2 sm:gap-2 sm:pt-3">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-700 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
            <CalendarDays
              aria-hidden="true"
              className="size-3 shrink-0 sm:size-3.5"
            />

            <span className="truncate">
              {formatPromotionDays(
                promotion,
              )}
            </span>
          </span>

          {promotionHours && (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
              <Clock3
                aria-hidden="true"
                className="size-3 shrink-0 sm:size-3.5"
              />

              <span className="truncate">
                {promotionHours}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}