"use client";

import {
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  Flame,
  LoaderCircle,
  Plus,
  TriangleAlert,
} from "lucide-react";

import {
  loadPromotionsPage,
} from "@/app/promociones/actions";
import {
  PublicPromotionCard,
} from "@/components/promotions/PublicPromotionCard";
import {
  RestaurantPromotionDaySelector,
} from "@/components/restaurants/RestaurantPromotionDaySelector";

import type {
  PromotionWeek,
} from "@/lib/restaurants/promotion-week";
import type {
  PublicPromotionWithRestaurant,
} from "@/lib/restaurants/public-utils";

type PromotionsByDayProps = {
  promotionWeek: PromotionWeek;
  initialPromotions:
    PublicPromotionWithRestaurant[];
  initialTotal: number;
  initialHasMore: boolean;
};

export function PromotionsByDay({
  promotionWeek,
  initialPromotions,
  initialTotal,
  initialHasMore,
}: PromotionsByDayProps) {
  const [
    selectedPromotionDate,
    setSelectedPromotionDate,
  ] = useState(
    promotionWeek.todayDate,
  );

  const [
    promotions,
    setPromotions,
  ] = useState(
    initialPromotions,
  );

  const [
    total,
    setTotal,
  ] = useState(
    initialTotal,
  );

  const [
    hasMore,
    setHasMore,
  ] = useState(
    initialHasMore,
  );

  const [
    isChangingDate,
    setIsChangingDate,
  ] = useState(false);

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const requestIdRef =
    useRef(0);

  async function handleDateChange(
    selectedDate: string,
  ) {
    if (
      selectedDate ===
        selectedPromotionDate ||
      isChangingDate
    ) {
      return;
    }

    const requestId =
      requestIdRef.current + 1;

    requestIdRef.current =
      requestId;

    setSelectedPromotionDate(
      selectedDate,
    );
    setIsChangingDate(true);
    setError(null);

    try {
      const result =
        await loadPromotionsPage({
          selectedDate,
          offset: 0,
        });

      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      if (!result.ok) {
        throw new Error(
          result.error,
        );
      }

      setPromotions(
        result.promotions,
      );
      setTotal(
        result.total,
      );
      setHasMore(
        result.hasMore,
      );
    } catch (loadError) {
      console.error(
        "Error al cambiar el día de promociones:",
        loadError,
      );

      setPromotions([]);
      setTotal(0);
      setHasMore(false);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar las promociones.",
      );
    } finally {
      if (
        requestId ===
        requestIdRef.current
      ) {
        setIsChangingDate(
          false,
        );
      }
    }
  }

  async function handleLoadMore() {
    if (
      isLoadingMore ||
      isChangingDate ||
      !hasMore
    ) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const result =
        await loadPromotionsPage({
          selectedDate:
            selectedPromotionDate,
          offset:
            promotions.length,
        });

      if (!result.ok) {
        throw new Error(
          result.error,
        );
      }

      setPromotions(
        (
          currentPromotions,
        ) => {
          const existingIds =
            new Set(
              currentPromotions.map(
                ({
                  promotion,
                }) =>
                  promotion.id,
              ),
            );

          const newPromotions =
            result.promotions.filter(
              ({
                promotion,
              }) =>
                !existingIds.has(
                  promotion.id,
                ),
            );

          return [
            ...currentPromotions,
            ...newPromotions,
          ];
        },
      );

      setTotal(
        result.total,
      );

      setHasMore(
        result.hasMore,
      );
    } catch (loadError) {
      console.error(
        "Error al cargar más promociones:",
        loadError,
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar más promociones.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  const promotionCountLabel =
    total === 1
      ? "1 promoción disponible"
      : `${total} promociones disponibles`;

  return (
    <>
      <RestaurantPromotionDaySelector
        dates={
          promotionWeek.dates
        }
        selectedDate={
          selectedPromotionDate
        }
        onDateChange={(date) => {
          void handleDateChange(
            date,
          );
        }}
      />

      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-orange-600">
        {isChangingDate ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin"
          />
        ) : (
          <Flame
            aria-hidden="true"
            className="size-4"
          />
        )}

        <p aria-live="polite">
          {isChangingDate
            ? "Cargando promociones..."
            : promotionCountLabel}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" />

          <p>{error}</p>
        </div>
      )}

      {isChangingDate ? (
        <div className="mt-8 grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="h-[33rem] animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100 sm:h-[35rem] sm:rounded-[2rem]"
            />
          ))}
        </div>
      ) : promotions.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {promotions.map(
              ({
                promotion,
                restaurant,
              }) => (
                <div
                  key={
                    promotion.id
                  }
                  className="min-w-0"
                >
                  <PublicPromotionCard
                    promotion={
                      promotion
                    }
                    restaurant={
                      restaurant
                    }
                  />
                </div>
              ),
            )}
          </div>

          {hasMore && (
            <button
              type="button"
              disabled={
                isLoadingMore
              }
              onClick={() => {
                void handleLoadMore();
              }}
              className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingMore ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" />

                  Cargando promociones...
                </>
              ) : (
                <>
                  <Plus className="size-5" />

                  Cargar más promociones
                </>
              )}
            </button>
          )}

          {!hasMore &&
            promotions.length >
              16 && (
              <p className="mt-8 text-center text-sm font-medium text-slate-500">
                Ya viste todas las promociones disponibles para este día.
              </p>
            )}
        </>
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
            Selecciona otro día para descubrir las promociones disponibles en los restaurantes de Córdoba.
          </p>
        </div>
      )}
    </>
  );
}