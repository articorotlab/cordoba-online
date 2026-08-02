"use client";

import {
  LoaderCircle,
  Plus,
  TriangleAlert,
} from "lucide-react";
import {
  useState,
} from "react";

import {
  loadMoreRestaurants,
} from "@/app/comer/restaurantes/actions";
import {
  RestaurantDirectoryCard,
} from "@/components/features/restaurants/RestaurantDirectoryCard";

import type {
  PublicRestaurantDirectoryItem,
} from "@/types/public-restaurants";

type RestaurantDirectoryListProps = {
  initialRestaurants:
    PublicRestaurantDirectoryItem[];
  initialHasMore: boolean;
  category: string;
};

export function RestaurantDirectoryList({
  initialRestaurants,
  initialHasMore,
  category,
}: RestaurantDirectoryListProps) {
  const [
    restaurants,
    setRestaurants,
  ] = useState(
    initialRestaurants,
  );

  const [
    hasMore,
    setHasMore,
  ] = useState(
    initialHasMore,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  async function handleLoadMore() {
    if (
      isLoading ||
      !hasMore
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result =
        await loadMoreRestaurants({
          category,
          offset:
            restaurants.length,
        });

      if (!result.ok) {
        throw new Error(
          result.error,
        );
      }

      setRestaurants(
        (currentRestaurants) => {
          const existingIds =
            new Set(
              currentRestaurants.map(
                (restaurant) =>
                  restaurant.id,
              ),
            );

          const newRestaurants =
            result.restaurants.filter(
              (restaurant) =>
                !existingIds.has(
                  restaurant.id,
                ),
            );

          return [
            ...currentRestaurants,
            ...newRestaurants,
          ];
        },
      );

      setHasMore(
        result.hasMore,
      );
    } catch (loadError) {
      console.error(
        "Error al cargar más restaurantes:",
        loadError,
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar más restaurantes.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {restaurants.map(
          (restaurant) => (
            <RestaurantDirectoryCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ),
        )}
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

      {hasMore && (
        <button
          type="button"
          disabled={isLoading}
          onClick={
            handleLoadMore
          }
          className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />

              Cargando restaurantes...
            </>
          ) : (
            <>
              <Plus className="size-5" />

              Cargar más restaurantes
            </>
          )}
        </button>
      )}

      {!hasMore &&
        restaurants.length > 20 && (
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Ya viste todos los restaurantes disponibles.
          </p>
        )}
    </div>
  );
}