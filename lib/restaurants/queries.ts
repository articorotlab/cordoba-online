import { createAdminClient } from "@/lib/supabase/admin";
import { mapRestaurant } from "@/lib/restaurants/mappers";

import type { DatabaseRestaurant } from "@/types/database-restaurants";
import type {
  PublicRestaurant,
  PublicRestaurantDirectoryItem,
  PublicRestaurantSchedule,
} from "@/types/public-restaurants";

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

const restaurantDirectorySelect = `
  id,
  slug,
  name,
  category,
  description,
  zone,
  logo_url,
  schedule:restaurant_schedules (
    id,
    day,
    opens_at,
    closes_at,
    closed
  )
`;

type DatabaseRestaurantDirectoryRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  zone: string;
  logo_url: string | null;
  schedule:
    | {
        id: string;
        day: PublicRestaurantSchedule["day"];
        opens_at: string | null;
        closes_at: string | null;
        closed: boolean;
      }[]
    | null;
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
  const supabase = createAdminClient();

  const safeOffset =
    Number.isInteger(offset) && offset >= 0
      ? offset
      : 0;

  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0 &&
    limit <= 10
      ? limit
      : 10;

  let query = supabase
    .from("restaurants")
    .select(
      restaurantDirectorySelect,
      {
        count: "exact",
      },
    )
    .eq("is_active", true);

  const normalizedCategory =
    category?.trim();

  if (
    normalizedCategory &&
    normalizedCategory !== "Todos"
  ) {
    query = query.eq(
      "category",
      normalizedCategory,
    );
  }

  const {
    data,
    error,
    count,
  } = await query
    .order("name", {
      ascending: true,
    })
    .range(
      safeOffset,
      safeOffset + safeLimit - 1,
    );

  if (error) {
    console.error(
      "Error al consultar el directorio de restaurantes:",
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
      []) as DatabaseRestaurantDirectoryRow[];

  const restaurants =
    rows.map(
      (
        restaurant,
      ): PublicRestaurantDirectoryItem => ({
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        category:
          restaurant.category,
        description:
          restaurant.description ?? "",
        zone: restaurant.zone ?? "",
        logo: restaurant.logo_url,
        schedule: (
          restaurant.schedule ?? []
        ).map((schedule) => ({
          id: schedule.id,
          day: schedule.day,
          opensAt:
            schedule.opens_at,
          closesAt:
            schedule.closes_at,
          closed:
            schedule.closed,
        })),
      }),
    );

  const total =
    count ?? restaurants.length;

  return {
    restaurants,
    total,
    hasMore:
      safeOffset +
        restaurants.length <
      total,
  };
}