import type { RestaurantPromotionDate } from "@/components/restaurants/RestaurantPromotionDaySelector";
import type { DatabaseWeekDay } from "@/types/database-restaurants";
import type { PublicRestaurantPromotion } from "@/types/public-restaurants";

const CORDOBA_TIME_ZONE = "America/Mexico_City";

const weekDays: DatabaseWeekDay[] = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const shortWeekDays: Record<
  DatabaseWeekDay,
  string
> = {
  domingo: "DOM",
  lunes: "LUN",
  martes: "MAR",
  miércoles: "MIÉ",
  jueves: "JUE",
  viernes: "VIE",
  sábado: "SÁB",
};

type CordobaDateParts = {
  year: number;
  month: number;
  day: number;
};

export type PromotionWeek = {
  dates: RestaurantPromotionDate[];
  todayDate: string;
};

function normalizeDay(
  value: string,
): DatabaseWeekDay {
  const normalizedValue = value
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  return (
    weekDays.find((day) => {
      const normalizedDay = day
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

      return normalizedDay === normalizedValue;
    }) ?? "lunes"
  );
}

function getCordobaTodayParts(): CordobaDateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CORDOBA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(
    new Date(),
  );

  return {
    year: Number(
      parts.find((part) => part.type === "year")
        ?.value ?? 0,
    ),
    month: Number(
      parts.find((part) => part.type === "month")
        ?.value ?? 1,
    ),
    day: Number(
      parts.find((part) => part.type === "day")
        ?.value ?? 1,
    ),
  };
}

function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear();

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createCurrentPromotionWeek(): PromotionWeek {
  const todayParts = getCordobaTodayParts();

  const today = new Date(
    Date.UTC(
      todayParts.year,
      todayParts.month - 1,
      todayParts.day,
      12,
    ),
  );

  /*
   * JavaScript:
   * domingo = 0
   * lunes = 1
   *
   * Convertimos el día actual en la cantidad de días
   * transcurridos desde el lunes.
   */
  const daysSinceMonday =
    (today.getUTCDay() + 6) % 7;

  const monday = new Date(today);

  monday.setUTCDate(
    today.getUTCDate() - daysSinceMonday,
  );

  const weekdayFormatter =
    new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      timeZone: "UTC",
    });

  const monthFormatter =
    new Intl.DateTimeFormat("es-MX", {
      month: "short",
      timeZone: "UTC",
    });

  const dates = Array.from(
    { length: 7 },
    (_, index): RestaurantPromotionDate => {
      const date = new Date(monday);

      date.setUTCDate(
        monday.getUTCDate() + index,
      );

      const day = normalizeDay(
        weekdayFormatter.format(date),
      );

      return {
        date: formatDateKey(date),
        day,
        dayNumber: String(
          date.getUTCDate(),
        ).padStart(2, "0"),
        month: monthFormatter
          .format(date)
          .replace(".", "")
          .toLocaleUpperCase("es-MX"),
        shortDay: shortWeekDays[day],
      };
    },
  );

  return {
    dates,
    todayDate: formatDateKey(today),
  };
}

export function promotionIsAvailableOnDate(
  promotion: PublicRestaurantPromotion,
  selectedDate: RestaurantPromotionDate,
): boolean {
  if (!promotion.active) {
    return false;
  }

  if (
    !promotion.days.includes(selectedDate.day)
  ) {
    return false;
  }

  if (
    promotion.validFrom &&
    selectedDate.date < promotion.validFrom
  ) {
    return false;
  }

  if (
    promotion.validUntil &&
    selectedDate.date > promotion.validUntil
  ) {
    return false;
  }

  return true;
}