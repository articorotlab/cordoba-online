"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  LockKeyhole,
  Utensils,
} from "lucide-react";

import { RestaurantContactCard } from "@/components/restaurants/RestaurantContactCard";
import { RestaurantProductCard } from "@/components/restaurants/RestaurantProductCard";
import { RestaurantPromotionDaySelector } from "@/components/restaurants/RestaurantPromotionDaySelector";
import { RestaurantPromotionCard } from "@/components/restaurants/RestaurantPromotionCard";
import { RestaurantScheduleCard } from "@/components/restaurants/RestaurantScheduleCard";
import {
  RestaurantTabNavigation,
  type RestaurantTab,
} from "@/components/restaurants/RestaurantTabNavigation";
import { comparePromotionsByPrice } from "@/lib/restaurants/promotion-price";
import {
  createCurrentPromotionWeek,
  promotionIsAvailableOnDate,
} from "@/lib/restaurants/promotion-week";

import type { PublicRestaurant } from "@/types/public-restaurants";

type RestaurantTabsProps = {
  restaurant: PublicRestaurant;
  isAuthenticated: boolean;
};

export function RestaurantTabs({
  restaurant,
  isAuthenticated,
}: RestaurantTabsProps) {
  const [activeTab, setActiveTab] =
    useState<RestaurantTab>("products");

  const promotionWeek = useMemo(
    () => createCurrentPromotionWeek(),
    [],
  );

  const [
    selectedPromotionDate,
    setSelectedPromotionDate,
  ] = useState(promotionWeek.todayDate);

  const products = restaurant.products
    .filter((product) => {
      return product.active && product.featured;
    })
    .slice(0, 5);

  const selectedDate =
    promotionWeek.dates.find((date) => {
      return date.date === selectedPromotionDate;
    }) ?? promotionWeek.dates[0];

  const promotionsForSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return restaurant.promotions
      .filter((promotion) => {
        return promotionIsAvailableOnDate(
          promotion,
          selectedDate,
        );
      })
      .sort(comparePromotionsByPrice);
  }, [
    restaurant.promotions,
    selectedDate,
  ]);

  return (
    <div>
      <RestaurantTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "products" && (
        <section
          role="tabpanel"
          id="restaurant-panel-products"
          aria-labelledby="restaurant-tab-products"
          tabIndex={0}
          className="pt-12 outline-none sm:pt-14"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
            Top platillos
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Lo mejor de {restaurant.name}
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            {products.length === 1
              ? "1 platillo destacado."
              : `${products.length} platillos destacados.`}
          </p>

          {products.length > 0 ? (
            <div className="mt-8 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <RestaurantProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Utensils
                  aria-hidden="true"
                  className="size-7 text-slate-400"
                />
              </div>

              <p className="mt-4 font-semibold text-slate-700">
                Este restaurante todavía no ha publicado sus
                platillos destacados.
              </p>
            </div>
          )}
        </section>
      )}

      {activeTab === "promotions" && (
        <section
          role="tabpanel"
          id="restaurant-panel-promotions"
          aria-labelledby="restaurant-tab-promotions"
          tabIndex={0}
          className="pt-8 outline-none sm:pt-10"
        >
          <RestaurantPromotionDaySelector
            dates={promotionWeek.dates}
            selectedDate={selectedPromotionDate}
            onDateChange={setSelectedPromotionDate}
          />

          {!isAuthenticated ? (
            <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-6 shadow-sm sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-blue-100/70 blur-3xl"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-orange-100/80 blur-3xl"
              />

              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <LockKeyhole
                    aria-hidden="true"
                    className="size-6"
                  />
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                  Inicia sesión para ver las promociones
                </h2>

                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Crea una cuenta gratuita o inicia sesión para
                  consultar los descuentos y beneficios de este
                  restaurante.
                </p>

                <Link
                  href={`/login?redirect=${encodeURIComponent(
                    `/comer/${restaurant.slug}`,
                  )}`}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  Acceder para ver promociones
                </Link>
              </div>
            </div>
          ) : promotionsForSelectedDate.length > 0 ? (
            <div className="mt-8 grid items-stretch gap-5 md:grid-cols-2">
              {promotionsForSelectedDate.map(
                (promotion) => (
                  <RestaurantPromotionCard
                    key={promotion.id}
                    promotion={promotion}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-white px-6 py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                <CalendarDays
                  aria-hidden="true"
                  className="size-7"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                No hay promociones para este día
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                Selecciona otro día para consultar las promociones
                disponibles de {restaurant.name}.
              </p>
            </div>
          )}
        </section>
      )}

      {activeTab === "information" && (
        <section
          role="tabpanel"
          id="restaurant-panel-information"
          aria-labelledby="restaurant-tab-information"
          tabIndex={0}
          className="grid gap-6 pt-12 outline-none sm:pt-14 lg:grid-cols-2"
        >
          <RestaurantContactCard
            restaurant={restaurant}
          />

          <RestaurantScheduleCard
            schedule={restaurant.schedule}
          />
        </section>
      )}
    </div>
  );
}