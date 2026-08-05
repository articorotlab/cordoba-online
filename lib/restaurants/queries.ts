import { createAdminClient } from "@/lib/supabase/admin";
import { mapRestaurant } from "@/lib/restaurants/mappers";

import type { DatabaseRestaurant } from "@/types/database-restaurants";
import type {
  PublicRestaurant,
  PublicRestaurantDirectoryItem,
} from "@/types/public-restaurants";

import {
  getCordobaNowContext,
} from "@/lib/restaurants/cordoba-now";

const restaurantSelect = `
  id,
  slug,
  name,
  category,
  description,
  zone,
  address,
  phone,
  whatsapp,
  instagram,
  logo_url,
  cover_url,
  latitude,
  longitude,
  is_active,
  products:restaurant_products (
    id,
    name,
    description,
    price,
    image_url,
    featured,
    active,
    created_at
  ),
  promotions:restaurant_promotions (
    id,
    title,
    description,
    price,
    image_url,
    start_time,
    end_time,
    valid_from,
    valid_until,
    active,
    position,
    days:restaurant_promotion_days (
      id,
      day
    )
  ),
  schedule:restaurant_schedules (
    id,
    day,
    opens_at,
    closes_at,
    closed
  )
`;

type DatabaseRestaurantDirectoryPageRow = {
  restaurant_id: string;
  restaurant_slug: string;
  restaurant_name: string;
  restaurant_category: string;
  restaurant_description: string;
  restaurant_zone: string;
  restaurant_logo_url:
    | string
    | null;
  is_open_now: boolean;
  total_count:
    | number
    | string;
};

export type PublicRestaurantDirectoryPage = {
  restaurants: PublicRestaurantDirectoryItem[];
  total: number;
  hasMore: boolean;
};

export async function getPublicRestaurants(): Promise<
  PublicRestaurant[]
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select(restaurantSelect)
    .eq("is_active", true)
    .order("name", {
      ascending: true,
    })
    .order("created_at", {
      referencedTable: "restaurant_products",
      ascending: true,
    })
    .order("position", {
      referencedTable: "restaurant_promotions",
      ascending: true,
    });

  if (error) {
    console.error(
      "Error al consultar restaurantes públicos:",
      error,
    );

    return [];
  }

  return (data as DatabaseRestaurant[]).map(
    mapRestaurant,
  );
}

export async function getPublicRestaurantBySlug(
  slug: string,
): Promise<PublicRestaurant | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select(restaurantSelect)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error(
      `Error al consultar el restaurante "${slug}":`,
      error,
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapRestaurant(
    data as DatabaseRestaurant,
  );
}

export async function getPublicRestaurantDirectoryPage({
  category,
  offset = 0,
  limit = 10,
}: {
  category?: string;
  offset?: number;
  limit?: number;
}): Promise<PublicRestaurantDirectoryPage> {
  const safeOffset =
    Number.isInteger(offset) &&
    offset >= 0
      ? offset
      : 0;

  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0 &&
    limit <= 10
      ? limit
      : 10;

  const normalizedCategory =
    category?.trim();

  const context =
    getCordobaNowContext();

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_public_restaurant_directory_page",
    {
      p_day:
        context.day,
      p_previous_day:
        context.previousDay,
      p_current_time:
        context.currentTime,
      p_category:
        normalizedCategory &&
        normalizedCategory !== "Todos"
          ? normalizedCategory
          : null,
      p_offset:
        safeOffset,
      p_limit:
        safeLimit,
    },
  );

  if (error) {
    console.error(
      "Error al consultar el directorio público de restaurantes:",
      error,
    );

    return {
      restaurants: [],
      total: 0,
      hasMore: false,
    };
  }

  const rows =
    (data ??
      []) as DatabaseRestaurantDirectoryPageRow[];

  const restaurants =
    rows.map(
      (
        row,
      ): PublicRestaurantDirectoryItem => ({
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
        isOpen:
          row.is_open_now,
      }),
    );

  const rawTotal =
    rows.length > 0
      ? Number(
          rows[0].total_count,
        )
      : 0;

  const total =
    Number.isFinite(rawTotal)
      ? rawTotal
      : 0;

  return {
    restaurants,
    total,
    hasMore:
      safeOffset +
        restaurants.length <
      total,
  };
}