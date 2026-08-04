import Link from "next/link";
import {
  ArrowRight,
  Flame,
} from "lucide-react";

import {
  RestaurantExplorer,
} from "@/components/features/restaurants/RestaurantExplorer";
import {
  PageContainer,
} from "@/components/layout/PageContainer";
import {
  PromotionCarousel,
} from "@/components/promotions/PromotionCarousel";
import {
  getPublicPromotionsPage,
} from "@/lib/promotions/queries";
import {
  getCordobaNowContext,
} from "@/lib/restaurants/cordoba-now";
import {
  getPublicHomeRestaurantsPage,
} from "@/lib/restaurants/home-queries";
import {
  createClient,
} from "@/lib/supabase/server";

const HOME_PROMOTIONS_LIMIT = 6;
const HOME_RESTAURANTS_LIMIT = 10;

export default async function ComerPage() {
  const supabase =
    await createClient();

  const context =
    getCordobaNowContext();

  const [
    {
      data: {
        user,
      },
    },
    promotionsPage,
    restaurantsPage,
  ] = await Promise.all([
    supabase.auth.getUser(),

    getPublicPromotionsPage({
      selectedDate:
        context.date,
      day:
        context.day,
      offset: 0,
      limit:
        HOME_PROMOTIONS_LIMIT,
    }),

    getPublicHomeRestaurantsPage({
      context,
      offset: 0,
      limit:
        HOME_RESTAURANTS_LIMIT,
    }),
  ]);

  const isAuthenticated =
    Boolean(user);

  const visibleTodayPromotions =
    promotionsPage.promotions;

  const promotionCount =
    promotionsPage.total;

  return (
    <PageContainer className="py-8 sm:py-12">
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
              Hoy en Córdoba
            </p>

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
          promotions={
            visibleTodayPromotions
          }
          locked={
            !isAuthenticated
          }
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

      <div className="mt-8 border-t border-slate-100 pt-8 sm:mt-10 sm:pt-10">
        <RestaurantExplorer
          initialRestaurants={
            restaurantsPage.restaurants
          }
          initialTotal={
            restaurantsPage.total
          }
        />
      </div>
    </PageContainer>
  );
}