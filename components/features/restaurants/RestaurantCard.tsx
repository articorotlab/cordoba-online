import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Tag,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  const isOpen = isRestaurantOpenNow(restaurant);

  const hasPromotions =
    restaurantHasPromotionToday(restaurant);

  return (
    <Link
      href={`/comer/${restaurant.slug}`}
      className="group block overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-white">
        {restaurant.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.cover}
            alt={`Portada de ${restaurant.name}`}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : restaurant.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.logo}
            alt={`Logo de ${restaurant.name}`}
            className="size-28 object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Utensils
            aria-hidden="true"
            className="size-14 text-orange-400"
          />
        )}

        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/40 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge className="rounded-full bg-white text-slate-950 shadow-sm hover:bg-white">
            {restaurant.category}
          </Badge>

          {hasPromotions && (
            <Badge className="rounded-full bg-orange-500 text-white hover:bg-orange-500">
              <Tag
                aria-hidden="true"
                className="mr-1 size-3.5"
              />

              Promoción hoy
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              {restaurant.name}
            </h2>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {restaurant.description}
            </p>
          </div>

          <ArrowRight
            aria-hidden="true"
            className="mt-1 size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin
              aria-hidden="true"
              className="size-4"
            />

            {restaurant.zone}
          </span>

          <span
            className={[
              "inline-flex items-center gap-1.5 font-medium",
              isOpen
                ? "text-emerald-600"
                : "text-slate-500",
            ].join(" ")}
          >
            <Clock3
              aria-hidden="true"
              className="size-4"
            />

            {isOpen ? "Abierto ahora" : "Cerrado"}
          </span>
        </div>
      </div>
    </Link>
  );
}