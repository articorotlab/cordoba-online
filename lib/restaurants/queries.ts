import { createClient } from "@/lib/supabase/server";
import { mapRestaurant } from "@/lib/restaurants/mappers";

import type { DatabaseRestaurant } from "@/types/database-restaurants";
import type { PublicRestaurant } from "@/types/public-restaurants";

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

export async function getPublicRestaurants(): Promise<
  PublicRestaurant[]
> {
  const supabase = await createClient();

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

  return (data as DatabaseRestaurant[]).map(mapRestaurant);
}

export async function getPublicRestaurantBySlug(
  slug: string,
): Promise<PublicRestaurant | null> {
  const supabase = await createClient();

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

  return mapRestaurant(data as DatabaseRestaurant);
}