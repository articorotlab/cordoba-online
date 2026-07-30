import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const MEXICO_TIME_ZONE = "America/Mexico_City";

type HomeStats = {
  promotionsToday: number;
};

type MexicoDateInformation = {
  date: string;
  weekday: string;
};

function getMexicoDateInformation(): MexicoDateInformation {
  const now = new Date();

  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year =
    dateParts.find((part) => part.type === "year")?.value ?? "";

  const month =
    dateParts.find((part) => part.type === "month")?.value ?? "";

  const day =
    dateParts.find((part) => part.type === "day")?.value ?? "";

  const weekday = new Intl.DateTimeFormat("es-MX", {
    timeZone: MEXICO_TIME_ZONE,
    weekday: "long",
  })
    .format(now)
    .toLocaleLowerCase("es-MX");

  return {
    date: `${year}-${month}-${day}`,
    weekday,
  };
}

export async function getHomeStats(): Promise<HomeStats> {
  const supabaseAdmin = createAdminClient();

  const { date, weekday } = getMexicoDateInformation();

  const { count, error } = await supabaseAdmin
    .from("restaurant_promotions")
    .select(
      `
        id,
        restaurant_promotion_days!inner (
          day
        ),
        restaurants!inner (
          is_active
        )
      `,
      {
        count: "exact",
        head: true,
      },
    )
    .eq("active", true)
    .eq("restaurant_promotion_days.day", weekday)
    .eq("restaurants.is_active", true)
    .or(`valid_from.is.null,valid_from.lte.${date}`)
    .or(`valid_until.is.null,valid_until.gte.${date}`);

  if (error) {
    console.error(
      "Error al obtener las estadísticas de la portada:",
      error,
    );

    return {
      promotionsToday: 0,
    };
  }

  return {
    promotionsToday: count ?? 0,
  };
}