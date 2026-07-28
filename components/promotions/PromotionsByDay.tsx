"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  Flame,
} from "lucide-react";

import { PublicPromotionCard } from "@/components/promotions/PublicPromotionCard";
import { RestaurantPromotionDaySelector } from "@/components/restaurants/RestaurantPromotionDaySelector";
import { comparePromotionsByPrice } from "@/lib/restaurants/promotion-price";
import {
  createCurrentPromotionWeek,
  promotionIsAvailableOnDate,
} from "@/lib/restaurants/promotion-week";

import type { PublicPromotionWithRestaurant } from "@/lib/restaurants/public-utils";

type PromotionsByDayProps = {
  promotions: PublicPromotionWithRestaurant[];
};

export function PromotionsByDay({
  promotions,
}: PromotionsByDayProps) {
  const promotionWeek = useMemo(
    () => createCurrentPromotionWeek(),
    [],
  );

  const [
    selectedPromotionDate,
    setSelectedPromotionDate,
  ] = useState(promotionWeek.todayDate);

  const selectedDate =
    promotionWeek.dates.find((date) => {
      return date.date === selectedPromotionDate;
    }) ?? promotionWeek.dates[0];

  const filteredPromotions = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return promotions
      .filter(({ promotion }) => {
        return promotionIsAvailableOnDate(
          promotion,
          selectedDate,
        );
      })
      .sort((firstItem, secondItem) => {
        return comparePromotionsByPrice(
          firstItem.promotion,
          secondItem.promotion,
        );
      });
  }, [
    promotions,
    selectedDate,
  ]);

  const promotionCountLabel =
    filteredPromotions.length === 1
      ? "1 promoción disponible"
      : `${filteredPromotions.length} promociones disponibles`;

  return (
    <>
      <RestaurantPromotionDaySelector
        dates={promotionWeek.dates}
        selectedDate={selectedPromotionDate}
        onDateChange={setSelectedPromotionDate}
      />

      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-orange-600">
        <Flame
          aria-hidden="true"
          className="size-4"
        />

        <p aria-live="polite">
          {promotionCountLabel}
        </p>
      </div>

      {filteredPromotions.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPromotions.map(
            ({ promotion, restaurant }) => (
              <div
                key={promotion.id}
                className="min-w-0"
              >
                <PublicPromotionCard
                  promotion={promotion}
                  restaurant={restaurant}
                />
              </div>
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
            Selecciona otro día para descubrir las promociones
            disponibles en los restaurantes de Córdoba.
          </p>
        </div>
      )}
    </>
  );
}