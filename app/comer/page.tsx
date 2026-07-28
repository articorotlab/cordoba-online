import Link from "next/link";
import {
  ArrowRight,
  Flame,
  LockKeyhole,
  UserPlus,
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

  const todayPromotions = isAuthenticated
    ? getPromotionsToday(sortedRestaurants)
    : [];

  const visibleTodayPromotions =
    todayPromotions.slice(0, 6);

  const promotionCount = todayPromotions.length;

  return (
    <PageContainer className="py-8 sm:py-12">
      {isAuthenticated ? (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
                Hoy en Córdoba
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Promociones de hoy
              </h1>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                {promotionCount === 1
                  ? "1 promoción disponible"
                  : `${promotionCount} promociones disponibles`}
              </p>
            </div>

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
          </div>

          <PromotionCarousel
            promotions={visibleTodayPromotions}
            showViewAllCard={
              promotionCount >
              visibleTodayPromotions.length
            }
          />

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
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-6 sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-blue-100/70 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-orange-100/80 blur-3xl"
          />

          <div className="relative">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
              <LockKeyhole
                aria-hidden="true"
                className="size-6"
              />
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
              Promociones exclusivas
            </p>

            <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-slate-950">
              Inicia sesión para descubrir las promociones de hoy
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Accede gratuitamente para consultar descuentos,
              beneficios especiales y horarios promocionales de
              los restaurantes de Córdoba.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?redirect=%2Fcomer"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/registro?redirect=%2Fcomer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-50"
              >
                <UserPlus
                  aria-hidden="true"
                  className="size-4"
                />

                Crear cuenta gratuita
              </Link>
            </div>
          </div>
        </section>
      )}

      <div
        className={
          isAuthenticated
            ? "mt-14 border-t border-slate-100 pt-12"
            : "mt-12"
        }
      >
        <RestaurantExplorer
          restaurants={sortedRestaurants}
          initialLimit={6}
        />
      </div>
    </PageContainer>
  );
}