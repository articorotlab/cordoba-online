"use server";

import {
  getPublicRestaurantDirectoryPage,
} from "@/lib/restaurants/queries";

const RESTAURANTS_PER_PAGE = 10;

export async function loadMoreRestaurants({
  category,
  offset,
}: {
  category: string;
  offset: number;
}) {
  if (
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    return {
      ok: false as const,
      error:
        "La posición solicitada no es válida.",
    };
  }

  const result =
    await getPublicRestaurantDirectoryPage({
      category:
        category === "Todos"
          ? undefined
          : category,
      offset,
      limit:
        RESTAURANTS_PER_PAGE,
    });

  return {
    ok: true as const,
    restaurants:
      result.restaurants,
    total: result.total,
    hasMore: result.hasMore,
  };
}