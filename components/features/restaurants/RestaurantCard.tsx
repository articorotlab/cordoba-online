import {
  Clock3,
  MapPin,
  Store,
  Tag,
  Utensils,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getImageVariantUrl } from "@/lib/images/storage-url";
import {
  isRestaurantOpenNow,
  restaurantHasPromotionToday,
} from "@/lib/restaurants/public-utils";

import type { PublicRestaurant } from "@/types/public-restaurants";

type RestaurantCardProps = {
  restaurant: PublicRestaurant;
};

export function RestaurantCard({
  restaurant,
}: RestaurantCardProps) {
  const isOpen =
    isRestaurantOpenNow(restaurant);

  const hasPromotions =
    restaurantHasPromotionToday(
      restaurant,
    );

  const coverCardUrl =
    getImageVariantUrl(
      restaurant.cover,
      "card",
    );

  const logoCardUrl =
    getImageVariantUrl(
      restaurant.logo,
      "card",
    );

  return (
    <Link
      href={`/comer/${restaurant.slug}`}
      className="group block overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-white">
        {coverCardUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverCardUrl}
            alt={`Portada de ${restaurant.name}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : logoCardUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoCardUrl}
            alt={`Logo de ${restaurant.name}`}
            width={256}
            height={256}
            loading="lazy"
            decoding="async"
            className="size-28 object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Utensils
            aria-hidden="true"
            className="size-14 text-orange-400"
          />
        )}

        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/45 to-transparent" />

        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 sm:left-4 sm:top-4">
          <Badge className="rounded-full bg-white text-slate-950 shadow-sm hover:bg-white">
            {restaurant.category}
          </Badge>

          {hasPromotions && (
            <Badge className="rounded-full bg-orange-500 text-white shadow-sm hover:bg-orange-500">
              <Tag
                aria-hidden="true"
                className="mr-1 size-3.5"
              />

              Promoción hoy
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:size-20">
            {logoCardUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoCardUrl}
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
                className="size-7 text-orange-400 sm:size-8"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-lg font-extrabold leading-tight tracking-tight text-slate-950 sm:text-xl">
              {restaurant.name}
            </h2>

            {restaurant.description ? (
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                {restaurant.description}
              </p>
            ) : (
              <p className="mt-1.5 text-xs leading-5 text-slate-400 sm:text-sm">
                Descubre el menú y las promociones de este restaurante.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
            <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-slate-500">
              <MapPin
                aria-hidden="true"
                className="size-4 shrink-0 text-blue-500"
              />

              <span className="truncate">
                {restaurant.zone}
              </span>
            </span>

            <span
              className={[
                "inline-flex items-center gap-1.5 font-semibold",
                isOpen
                  ? "text-emerald-600"
                  : "text-slate-500",
              ].join(" ")}
            >
              <Clock3
                aria-hidden="true"
                className="size-4 shrink-0"
              />

              {isOpen
                ? "Abierto ahora"
                : "Cerrado"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}