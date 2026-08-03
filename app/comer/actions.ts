"use server";

import {
  restaurantCategories,
} from "@/constants/food-categories";
import {
  getCordobaNowContext,
} from "@/lib/restaurants/cordoba-now";
import {
  getPublicHomeRestaurantsPage,
} from "@/lib/restaurants/home-queries";

const HOME_RESTAURANTS_LIMIT = 10;

export async function loadHomeRestaurants({
  category,
}: {
  category: string;
}) {
  const normalizedCategory =
    category.trim();

  const isAll =
    normalizedCategory ===
    "Todos";

  const isValidCategory =
    isAll ||
    restaurantCategories.some(
      (allowedCategory) =>
        allowedCategory ===
        normalizedCategory,
    );

  if (!isValidCategory) {
    return {
      ok: false as const,
      error:
        "La categoría seleccionada no es válida.",
    };
  }

  const context =
    getCordobaNowContext();

  const result =
    await getPublicHomeRestaurantsPage({
      context,
      category: isAll
        ? undefined
        : normalizedCategory,
      offset: 0,
      limit:
        HOME_RESTAURANTS_LIMIT,
    });

  return {
    ok: true as const,
    restaurants:
      result.restaurants,
    total:
      result.total,
  };
}