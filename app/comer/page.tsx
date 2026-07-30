import Link from "next/link";
import {
  ArrowRight,
  Flame,
} from "lucide-react";

import { RestaurantExplorer } from "@/components/features/restaurants/RestaurantExplorer";
import { PageContainer } from "@/components/layout/PageContainer";
import { PromotionCarousel } from "@/components/promotions/PromotionCarousel";
import {
  getPromotionsToday,
  sortRestaurantsForToday,
} from "@/lib/restaurants/public-utils";
import { getPublicRestaurants } from "@/lib/restaurants/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ComerPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    restaurants,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getPublicRestaurants(),
  ]);

  const isAuthenticated = Boolean(user);

  const sortedRestaurants =
    sortRestaurantsForToday(restaurants);

  /*
   * Las promociones se obtienen tanto con sesión como sin sesión.
   *
   * Cuando el visitante no tiene sesión, el carrusel muestra
   * las tarjetas bloqueadas, pero conserva las imágenes,
   * restaurantes y ubicaciones reales.
   */
  const todayPromotions =
    getPromotionsToday(sortedRestaurants);

  const visibleTodayPromotions =
    todayPromotions.slice(0, 6);

  const promotionCount =
    todayPromotions.length;

  return (
    <PageContainer className="py-8 sm:py-12">
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
              Hoy en Córdoba
            </p>

            {isAuthenticated ? (
              <>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Promociones de hoy
                </h1>

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  {promotionCount === 1
                    ? "1 promoción disponible"
                    : `${promotionCount} promociones disponibles`}
                </p>
              </>
            ) : (
              <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                <Flame
                  aria-hidden="true"
                  className="size-7 shrink-0 text-orange-500 sm:size-8"
                />

                <span>
                  {promotionCount === 1
                    ? "1 promoción disponible"
                    : `${promotionCount} promociones disponibles`}
                </span>
              </h1>
            )}
          </div>

          {isAuthenticated && (
            <Link
              href="/promociones"
              className="group hidden shrink-0 items-center gap-2 text-sm font-bold text-orange-600 transition-colors hover:text-orange-700 sm:inline-flex"
            >
              Ver todas

              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>

        <PromotionCarousel
          promotions={visibleTodayPromotions}
          locked={!isAuthenticated}
          showViewAllCard={
            isAuthenticated &&
            promotionCount >
              visibleTodayPromotions.length
          }
        />

        {isAuthenticated && (
          <Link
            href="/promociones"
            className="group mt-4 inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-[background-color,box-shadow] duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:shadow-orange-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:hidden"
          >
            <Flame
              aria-hidden="true"
              className="size-5"
            />

            Ver todas las promociones

            <ArrowRight
              aria-hidden="true"
              className="size-5 transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        )}
      </section>

      <div className="mt-14 border-t border-slate-100 pt-12">
        <RestaurantExplorer
          restaurants={sortedRestaurants}
          initialLimit={6}
        />
      </div>
    </PageContainer>
  );
}