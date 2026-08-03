import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  CordobaNowContext,
} from "@/lib/restaurants/cordoba-now";
import type {
  PublicRestaurantCardItem,
} from "@/types/public-restaurants";

const HOME_RESTAURANTS_LIMIT = 10;

type DatabaseHomeRestaurantRow = {
  restaurant_id: string;
  restaurant_slug: string;
  restaurant_name: string;
  restaurant_category: string;
  restaurant_description: string;
  restaurant_zone: string;
  restaurant_logo_url:
    | string
    | null;
  restaurant_cover_url:
    | string
    | null;
  is_open_now: boolean;
  has_promotion_today: boolean;
  total_count:
    | number
    | string;
};

export type PublicHomeRestaurantsPage = {
  restaurants:
    PublicRestaurantCardItem[];
  total: number;
};

export async function getPublicHomeRestaurantsPage({
  context,
  category,
  offset = 0,
  limit = HOME_RESTAURANTS_LIMIT,
}: {
  context: CordobaNowContext;
  category?: string;
  offset?: number;
  limit?: number;
}): Promise<PublicHomeRestaurantsPage> {
  const safeOffset =
    Number.isInteger(offset) &&
    offset >= 0
      ? offset
      : 0;

  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0 &&
    limit <=
      HOME_RESTAURANTS_LIMIT
      ? limit
      : HOME_RESTAURANTS_LIMIT;

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_public_home_restaurants_page",
    {
      p_selected_date:
        context.date,
      p_day:
        context.day,
      p_previous_day:
        context.previousDay,
      p_current_time:
        context.currentTime,
      p_category:
        category?.trim() ||
        null,
      p_offset:
        safeOffset,
      p_limit:
        safeLimit,
    },
  );

  if (error) {
    console.error(
      "Error al consultar restaurantes de portada:",
      error,
    );

    return {
      restaurants: [],
      total: 0,
    };
  }

  const rows =
    (data ??
      []) as DatabaseHomeRestaurantRow[];

  const restaurants =
    rows.map(
      (
        row,
      ): PublicRestaurantCardItem => ({
        id:
          row.restaurant_id,
        slug:
          row.restaurant_slug,
        name:
          row.restaurant_name,
        category:
          row.restaurant_category,
        description:
          row.restaurant_description ??
          "",
        zone:
          row.restaurant_zone ??
          "",
        logo:
          row.restaurant_logo_url,
        cover:
          row.restaurant_cover_url,
        isOpen:
          row.is_open_now,
        hasPromotionToday:
          row.has_promotion_today,
      }),
    );

  const total =
    rows.length > 0
      ? Number(
          rows[0].total_count,
        )
      : 0;

  return {
    restaurants,
    total:
      Number.isFinite(total)
        ? total
        : 0,
  };
}