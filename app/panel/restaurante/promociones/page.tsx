import { RestaurantPromotionsManager } from "@/components/panel/RestaurantPromotionsManager";
import { requireRestaurant } from "@/lib/auth/require-restaurant";
import { createClient } from "@/lib/supabase/server";

import type { DatabaseWeekDay } from "@/types/database-restaurants";

type RestaurantPromotionsPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

type RestaurantPromotionDayRow = {
  id: string;
  day: DatabaseWeekDay;
};

type RestaurantPromotionRow = {
  id: string;
  title: string;
  description: string;
  price: number | string | null;
  image_url: string | null;
  start_time: string | null;
  end_time: string | null;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  days: RestaurantPromotionDayRow[] | null;
};

export default async function RestaurantPromotionsPage({
  searchParams,
}: RestaurantPromotionsPageProps) {
  const [
    authContext,
    resolvedSearchParams,
  ] = await Promise.all([
    requireRestaurant(),
    searchParams,
  ]);

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("restaurant_promotions")
    .select(`
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
      days:restaurant_promotion_days (
        id,
        day
      )
    `)
    .eq(
      "restaurant_id",
      authContext.restaurant.id,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error al cargar las promociones:",
      error,
    );

    throw new Error(
      "No fue posible cargar las promociones del restaurante.",
    );
  }

  const promotions =
    (data ?? []) as RestaurantPromotionRow[];

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-semibold text-orange-600">
          Promociones
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
          Promociones del restaurante
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
          Crea promociones, define sus días,
          horarios y vigencia, y decide cuáles
          estarán visibles para tus clientes.
        </p>
      </section>

      <RestaurantPromotionsManager
        promotions={promotions.map(
          (promotion) => ({
            id: promotion.id,
            title: promotion.title,
            description:
              promotion.description ?? "",
            price:
              promotion.price === null
                ? null
                : Number(promotion.price),
            imageUrl: promotion.image_url,
            startTime:
              promotion.start_time
                ? promotion.start_time.slice(0, 5)
                : "",
            endTime:
              promotion.end_time
                ? promotion.end_time.slice(0, 5)
                : "",
            validFrom:
              promotion.valid_from ?? "",
            validUntil:
              promotion.valid_until ?? "",
            active: promotion.active,
            days:
              promotion.days?.map(
                (item) => item.day,
              ) ?? [],
          }),
        )}
        message={
          resolvedSearchParams.message
        }
        error={
          resolvedSearchParams.error
        }
      />
    </div>
  );
}
