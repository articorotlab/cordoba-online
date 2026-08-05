import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  LockKeyhole,
  MapPin,
  Store,
  Tag,
} from "lucide-react";

import {
  getImageVariantUrl,
} from "@/lib/images/storage-url";
import {
  formatPromotionPrice,
} from "@/lib/restaurants/promotion-price";

import type {
  PublicPromotionRestaurantSummary,
  PublicRestaurantPromotion,
} from "@/types/public-restaurants";

type PublicPromotionCardProps = {
  promotion:
    PublicRestaurantPromotion;
  restaurant:
    PublicPromotionRestaurantSummary;
  locked?: boolean;
};

function formatDay(
  day: string,
): string {
  return (
    day
      .charAt(0)
      .toLocaleUpperCase("es-MX") +
    day.slice(1)
  );
}

function formatPromotionDays(
  promotion:
    PublicRestaurantPromotion,
): string {
  if (
    promotion.days.length === 0
  ) {
    return "Consulta disponibilidad";
  }

  return promotion.days
    .map(formatDay)
    .join(", ");
}

function formatPromotionHours(
  promotion:
    PublicRestaurantPromotion,
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
    formatPromotionHours(
      promotion,
    );

  const formattedPrice =
    formatPromotionPrice(
      promotion.price,
    );

  const restaurantLogoUrl =
    getImageVariantUrl(
      restaurant.logo,
      "card",
    );

  const restaurantIdentity = (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm sm:size-16">
        {restaurantLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={
              restaurantLogoUrl
            }
            alt={`Logo de ${restaurant.name}`}
            width={256}
            height={256}
            loading="lazy"
            decoding="async"
            className="size-full object-contain"
          />
        ) : (
          <Store
            aria-hidden="true"
            className="size-6 text-orange-400"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
          {restaurant.name}
        </p>

        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500 sm:text-sm">
          <MapPin
            aria-hidden="true"
            className="size-3.5 shrink-0 text-orange-500"
          />

          <span className="truncate">
            {restaurant.zone}
          </span>
        </p>
      </div>
    </div>
  );

  if (locked) {
    return (
      <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-orange-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-[2rem]">
        <div className="relative flex aspect-[4/3] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600">
          {promotion.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                promotion.image
              }
              alt={`Promoción de ${restaurant.name}`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <Tag
              aria-hidden="true"
              className="size-12 text-white/90 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:size-16"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10" />

          <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-slate-950/75 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-slate-950/20 backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
              <LockKeyhole
                aria-hidden="true"
                className="size-3.5"
              />

              Promoción
            </span>
          </div>
        </div>

        <div className="flex h-[11.5rem] shrink-0 flex-col p-4 sm:h-[12.5rem] sm:p-5">
          {restaurantIdentity}

          <div className="my-2 border-t border-slate-100" />

          <Link
            href="/login?redirect=%2Fcomer"
            className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-bold leading-5 text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <LockKeyhole
              aria-hidden="true"
              className="size-4 shrink-0"
            />

            <span>
              Inicia sesión para ver la promoción completa
            </span>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <Link
      href={`/comer/${restaurant.slug}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-orange-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-[2rem]"
    >
      <div className="relative flex aspect-[4/3] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600">
        {promotion.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={
              promotion.image
            }
            alt={
              promotion.title
            }
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <Tag
            aria-hidden="true"
            className="size-12 text-white/90 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:size-16"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/10" />

        {formattedPrice && (
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
            <div className="flex min-w-[5.75rem] flex-col items-center rounded-[1.25rem] border border-white/70 bg-white/95 px-4 py-3 text-center shadow-xl shadow-slate-950/20 backdrop-blur-md sm:min-w-[6.5rem] sm:rounded-[1.5rem] sm:px-5 sm:py-4">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                Desde
              </span>

              <span className="mt-0.5 text-2xl font-black leading-none tracking-tight text-emerald-500 sm:text-3xl">
                {formattedPrice}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[13rem] shrink-0 flex-col p-4 sm:h-[14rem] sm:p-5">
        {restaurantIdentity}

        <div className="my-3 border-t border-slate-100" />

        <h3 className="line-clamp-2 min-w-0 text-base font-bold leading-tight tracking-tight text-slate-950 sm:text-lg">
          {promotion.title}
        </h3>

        {promotion.description ? (
          <p className="mt-1.5 line-clamp-1 text-xs leading-5 text-slate-600 sm:text-sm">
            {promotion.description}
          </p>
        ) : (
          <p
            aria-hidden="true"
            className="mt-1.5 h-5 text-xs sm:text-sm"
          >
            &nbsp;
          </p>
        )}

        <div className="mt-2 flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
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