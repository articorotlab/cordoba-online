import {
  Clock3,
  MapPin,
  Store,
} from "lucide-react";
import Link from "next/link";

import {
  getImageVariantUrl,
} from "@/lib/images/storage-url";


import type {
  PublicRestaurantDirectoryItem,
} from "@/types/public-restaurants";

type RestaurantDirectoryCardProps = {
  restaurant: PublicRestaurantDirectoryItem;
};

export function RestaurantDirectoryCard({
  restaurant,
}: RestaurantDirectoryCardProps) {
  const logoCardUrl =
    getImageVariantUrl(
      restaurant.logo,
      "card",
    );

const isOpen =
  restaurant.isOpen;

  return (
    <Link
      href={`/comer/${restaurant.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4 sm:p-6">
        {logoCardUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoCardUrl}
            alt={`Logo de ${restaurant.name}`}
            width={256}
            height={256}
            loading="lazy"
            decoding="async"
            className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-[1.5rem] bg-white text-orange-400 shadow-sm sm:size-24">
            <Store
              aria-hidden="true"
              className="size-9 sm:size-11"
            />
          </div>
        )}

        <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
          {restaurant.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <h2 className="line-clamp-2 text-sm font-extrabold leading-tight tracking-tight text-slate-950 sm:text-lg">
          {restaurant.name}
        </h2>

        {restaurant.description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-5">
            {restaurant.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="border-t border-slate-100 pt-3">
            <div className="space-y-2 text-[10px] font-medium sm:text-xs">
              <span className="flex min-w-0 items-center gap-1.5 text-slate-500">
                <MapPin
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-blue-500"
                />

                <span className="truncate">
                  {restaurant.zone}
                </span>
              </span>

              <span
                className={[
                  "flex items-center gap-1.5 font-semibold",
                  isOpen
                    ? "text-emerald-600"
                    : "text-slate-500",
                ].join(" ")}
              >
                <Clock3
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />

                {isOpen
                  ? "Abierto ahora"
                  : "Cerrado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}