import Link from "next/link";
import {
  ArrowRight,
  Flame,
} from "lucide-react";

import { PublicPromotionCard } from "@/components/promotions/PublicPromotionCard";

import type { PublicPromotionWithRestaurant } from "@/lib/restaurants/public-utils";

type PromotionCarouselProps = {
  promotions: PublicPromotionWithRestaurant[];
  locked?: boolean;
  showViewAllCard?: boolean;
};

export function PromotionCarousel({
  promotions,
  locked = false,
  showViewAllCard = false,
}: PromotionCarouselProps) {
  if (promotions.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-orange-200 bg-orange-50/60 px-6 py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
          <Flame
            aria-hidden="true"
            className="size-7"
          />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-950">
          No hay promociones para hoy
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Puedes explorar los restaurantes disponibles y consultar
          sus promociones de otros días.
        </p>

        <Link
          href="/comer/restaurantes"
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 text-sm font-bold text-white transition-colors hover:bg-orange-600"
        >
          Explorar restaurantes

          <ArrowRight
            aria-hidden="true"
            className="size-4"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-5 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:pr-6 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pr-0">
        {promotions.map(
          ({ promotion, restaurant }) => (
            <div
              key={promotion.id}
              className="w-[86%] shrink-0 snap-start sm:w-[55%] lg:w-auto"
            >
              <PublicPromotionCard
                promotion={promotion}
                restaurant={restaurant}
                locked={locked}
              />
            </div>
          ),
        )}

        {showViewAllCard && (
          <div className="w-[86%] shrink-0 snap-start sm:w-[55%] lg:w-auto">
            <Link
              href="/promociones"
              aria-label="Ver todas las promociones disponibles"
              className="group relative flex h-[33rem] min-w-0 flex-col justify-between overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 p-6 text-white shadow-lg shadow-orange-500/20 transition-[box-shadow,background-color] duration-200 hover:shadow-xl hover:shadow-orange-500/30 sm:h-[35rem] sm:rounded-[2rem] sm:p-8"
            >
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 size-52 rounded-full border border-white/20"
              />

              <div
                aria-hidden="true"
                className="absolute -bottom-24 -left-16 size-64 rounded-full bg-white/10 blur-2xl"
              />

              <div className="relative flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Flame
                  aria-hidden="true"
                  className="size-7"
                />
              </div>

              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/75">
                  Sigue descubriendo
                </p>

                <h3 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em]">
                  Ver todas las promociones
                </h3>

                <div className="mt-7 inline-flex items-center gap-3 text-sm font-bold">
                  Explorar promociones

                  <span className="flex size-10 items-center justify-center rounded-full bg-white text-orange-600 transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight
                      aria-hidden="true"
                      className="size-5"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}