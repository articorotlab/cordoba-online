"use server";

import {
  getPublicPromotionsPage,
} from "@/lib/promotions/queries";
import {
  createCurrentPromotionWeek,
} from "@/lib/restaurants/promotion-week";
import {
  createClient,
} from "@/lib/supabase/server";

const PROMOTIONS_PER_PAGE = 16;

export async function loadPromotionsPage({
  selectedDate,
  offset,
}: {
  selectedDate: string;
  offset: number;
}) {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      error:
        "Debes iniciar sesión para consultar las promociones.",
    };
  }

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

  const promotionWeek =
    createCurrentPromotionWeek();

  const matchingDate =
    promotionWeek.dates.find(
      (date) =>
        date.date ===
        selectedDate,
    );

  if (!matchingDate) {
    return {
      ok: false as const,
      error:
        "La fecha seleccionada no es válida.",
    };
  }

  const result =
    await getPublicPromotionsPage({
      selectedDate:
        matchingDate.date,
      day:
        matchingDate.day,
      offset,
      limit:
        PROMOTIONS_PER_PAGE,
    });

  return {
    ok: true as const,
    promotions:
      result.promotions,
    total:
      result.total,
    hasMore:
      result.hasMore,
  };
}