import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  PublicPromotionWithRestaurant,
} from "@/lib/restaurants/public-utils";
import type {
  DatabaseWeekDay,
} from "@/types/database-restaurants";
import type {
  PublicRestaurantPromotion,
} from "@/types/public-restaurants";

const PROMOTIONS_PER_PAGE = 16;

type DatabasePublicPromotionPageRow = {
  promotion_id: string;
  promotion_title: string;
  promotion_description: string;
  promotion_price:
    | number
    | string
    | null;
  promotion_image_url:
    | string
    | null;
  promotion_start_time:
    | string
    | null;
  promotion_end_time:
    | string
    | null;
  promotion_valid_from:
    | string
    | null;
  promotion_valid_until:
    | string
    | null;
  promotion_active: boolean;
  promotion_position: number;
  promotion_days:
    | string[]
    | null;

  restaurant_id: string;
  restaurant_slug: string;
  restaurant_name: string;
  restaurant_zone: string;
  restaurant_logo_url:
  | string
  | null;

  total_count:
    | number
    | string;
};

export type PublicPromotionsPage = {
  promotions:
    PublicPromotionWithRestaurant[];
  total: number;
  hasMore: boolean;
};

function normalizeTime(
  value: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.slice(0, 5);
}

function normalizePrice(
  value:
    | number
    | string
    | null,
): number | null {
  if (value === null) {
    return null;
  }

  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(
    parsedValue,
  )
    ? parsedValue
    : null;
}

function mapPromotion(
  row: DatabasePublicPromotionPageRow,
): PublicPromotionWithRestaurant {
  const promotion:
    PublicRestaurantPromotion = {
      id: row.promotion_id,
      title:
        row.promotion_title,
      description:
        row.promotion_description ??
        "",
      price: normalizePrice(
        row.promotion_price,
      ),
      image:
        row.promotion_image_url,
      startTime: normalizeTime(
        row.promotion_start_time,
      ),
      endTime: normalizeTime(
        row.promotion_end_time,
      ),
      validFrom:
        row.promotion_valid_from ??
        undefined,
      validUntil:
        row.promotion_valid_until ??
        undefined,
      active:
        row.promotion_active,
      position:
        row.promotion_position,
      days: (
        row.promotion_days ?? []
      ) as DatabaseWeekDay[],
    };

  return {
    promotion,
    restaurant: {
        id:
            row.restaurant_id,
        slug:
            row.restaurant_slug,
        name:
            row.restaurant_name,
        zone:
            row.restaurant_zone ?? "",
        logo:
            row.restaurant_logo_url,
    },
  };
}

export async function getPublicPromotionsPage({
  selectedDate,
  day,
  offset = 0,
  limit = PROMOTIONS_PER_PAGE,
}: {
  selectedDate: string;
  day: DatabaseWeekDay;
  offset?: number;
  limit?: number;
}): Promise<PublicPromotionsPage> {
  const safeOffset =
    Number.isInteger(offset) &&
    offset >= 0
      ? offset
      : 0;

  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0 &&
    limit <= PROMOTIONS_PER_PAGE
      ? limit
      : PROMOTIONS_PER_PAGE;

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_public_promotions_page",
    {
      p_selected_date:
        selectedDate,
      p_day: day,
      p_offset: safeOffset,
      p_limit: safeLimit,
    },
  );

  if (error) {
    console.error(
      "Error al consultar promociones públicas paginadas:",
      error,
    );

    return {
      promotions: [],
      total: 0,
      hasMore: false,
    };
  }

  const rows =
    (data ??
      []) as DatabasePublicPromotionPageRow[];

  const promotions =
    rows.map(mapPromotion);

  const total =
    rows.length > 0
      ? Number(
          rows[0].total_count,
        )
      : 0;

  const safeTotal =
    Number.isFinite(total)
      ? total
      : 0;

  return {
    promotions,
    total: safeTotal,
    hasMore:
      safeOffset +
        promotions.length <
      safeTotal,
  };
}