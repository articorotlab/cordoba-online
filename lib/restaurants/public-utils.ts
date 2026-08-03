import type { DatabaseWeekDay } from "@/types/database-restaurants";
import type {
  PublicPromotionRestaurantSummary,
  PublicRestaurant,
  PublicRestaurantPromotion,
  PublicRestaurantSchedule,
} from "@/types/public-restaurants";

export type PublicPromotionWithRestaurant = {
  promotion: PublicRestaurantPromotion;
  restaurant: PublicPromotionRestaurantSummary;
};

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

type DateParts = {
  day: DatabaseWeekDay;
  hours: number;
  minutes: number;
  date: string;
};

function getCordobaDateParts(
  date: Date = new Date(),
): DateParts {
  const formatter = new Intl.DateTimeFormat("es-MX", {
    timeZone: CORDOBA_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const weekday =
    parts.find((part) => part.type === "weekday")?.value ?? "";

  const year =
    parts.find((part) => part.type === "year")?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")?.value ?? "";

  const dayOfMonth =
    parts.find((part) => part.type === "day")?.value ?? "";

  const hours = Number(
    parts.find((part) => part.type === "hour")?.value ?? 0,
  );

  const minutes = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );

  const normalizedWeekday = weekday
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  const matchingDay = weekDays.find((day) => {
    return (
      day
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "") === normalizedWeekday
    );
  });

  return {
    day: matchingDay ?? "lunes",
    hours,
    minutes,
    date: `${year}-${month}-${dayOfMonth}`,
  };
}

function getPreviousWeekDay(
  day: DatabaseWeekDay,
): DatabaseWeekDay {
  const currentIndex = weekDays.indexOf(day);

  if (currentIndex <= 0) {
    return weekDays[weekDays.length - 1];
  }

  return weekDays[currentIndex - 1];
}

function timeToMinutes(
  time: string | null,
): number | null {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function getScheduleMinutes(
  schedule: PublicRestaurantSchedule,
): {
  opensAt: number;
  closesAt: number;
} | null {
  if (
    schedule.closed ||
    !schedule.opensAt ||
    !schedule.closesAt
  ) {
    return null;
  }

  const opensAt = timeToMinutes(schedule.opensAt);
  const closesAt = timeToMinutes(schedule.closesAt);

  if (
    opensAt === null ||
    closesAt === null ||
    opensAt === closesAt
  ) {
    return null;
  }

  return {
    opensAt,
    closesAt,
  };
}

function isOpenDuringTodaySchedule(
  schedule: PublicRestaurantSchedule,
  currentMinutes: number,
): boolean {
  const scheduleMinutes =
    getScheduleMinutes(schedule);

  if (!scheduleMinutes) {
    return false;
  }

  const { opensAt, closesAt } = scheduleMinutes;

  /*
   * Horario normal:
   * 08:00 a 20:00
   */
  if (closesAt > opensAt) {
    return (
      currentMinutes >= opensAt &&
      currentMinutes < closesAt
    );
  }

  /*
   * Horario que cruza medianoche.
   *
   * En el día de apertura solamente corresponde
   * revisar el tramo anterior a medianoche:
   *
   * 18:00 a 05:00
   * Hoy cuenta desde las 18:00 hasta las 23:59.
   */
  return currentMinutes >= opensAt;
}

function isOpenFromPreviousDaySchedule(
  schedule: PublicRestaurantSchedule,
  currentMinutes: number,
): boolean {
  const scheduleMinutes =
    getScheduleMinutes(schedule);

  if (!scheduleMinutes) {
    return false;
  }

  const { opensAt, closesAt } = scheduleMinutes;

  /*
   * Un horario normal no continúa durante
   * la madrugada del día siguiente.
   */
  if (closesAt > opensAt) {
    return false;
  }

  /*
   * Horario que comenzó el día anterior:
   *
   * 18:00 a 05:00
   * Hoy cuenta desde las 00:00 hasta antes de las 05:00.
   */
  return currentMinutes < closesAt;
}

function isPromotionInsideDateRange(
  promotion: PublicRestaurantPromotion,
  currentDate: string,
): boolean {
  if (
    promotion.validFrom &&
    currentDate < promotion.validFrom
  ) {
    return false;
  }

  if (
    promotion.validUntil &&
    currentDate > promotion.validUntil
  ) {
    return false;
  }

  return true;
}

export function getCurrentRestaurantWeekDay(
  date: Date = new Date(),
): DatabaseWeekDay {
  return getCordobaDateParts(date).day;
}

export function isRestaurantOpenNow(
  restaurant: PublicRestaurant,
  date: Date = new Date(),
): boolean {
  const dateParts = getCordobaDateParts(date);

  const currentMinutes =
    dateParts.hours * 60 + dateParts.minutes;

  const todaySchedule = restaurant.schedule.find(
    (schedule) => schedule.day === dateParts.day,
  );

  if (
    todaySchedule &&
    isOpenDuringTodaySchedule(
      todaySchedule,
      currentMinutes,
    )
  ) {
    return true;
  }

  const previousDay = getPreviousWeekDay(
    dateParts.day,
  );

  const previousDaySchedule =
    restaurant.schedule.find(
      (schedule) => schedule.day === previousDay,
    );

  if (!previousDaySchedule) {
    return false;
  }

  return isOpenFromPreviousDaySchedule(
    previousDaySchedule,
    currentMinutes,
  );
}

export function getRestaurantPromotionsForDay(
  restaurant: PublicRestaurant,
  day: DatabaseWeekDay,
  date: Date = new Date(),
): PublicRestaurantPromotion[] {
  const currentDate = getCordobaDateParts(date).date;

  return restaurant.promotions.filter((promotion) => {
    return (
      promotion.active &&
      promotion.days.includes(day) &&
      isPromotionInsideDateRange(
        promotion,
        currentDate,
      )
    );
  });
}

export function restaurantHasPromotionForDay(
  restaurant: PublicRestaurant,
  day: DatabaseWeekDay,
  date: Date = new Date(),
): boolean {
  return (
    getRestaurantPromotionsForDay(
      restaurant,
      day,
      date,
    ).length > 0
  );
}

export function restaurantHasPromotionToday(
  restaurant: PublicRestaurant,
  date: Date = new Date(),
): boolean {
  const currentDay =
    getCurrentRestaurantWeekDay(date);

  return restaurantHasPromotionForDay(
    restaurant,
    currentDay,
    date,
  );
}

export function getPromotionsForDay(
  restaurants: PublicRestaurant[],
  day: DatabaseWeekDay,
  date: Date = new Date(),
): PublicPromotionWithRestaurant[] {
  return restaurants.flatMap((restaurant) => {
    return getRestaurantPromotionsForDay(
      restaurant,
      day,
      date,
    ).map((promotion) => ({
      promotion,
      restaurant,
    }));
  });
}

export function getPromotionsToday(
  restaurants: PublicRestaurant[],
  date: Date = new Date(),
): PublicPromotionWithRestaurant[] {
  const currentDay =
    getCurrentRestaurantWeekDay(date);

  return getPromotionsForDay(
    restaurants,
    currentDay,
    date,
  );
}

export function sortRestaurantsForToday(
  restaurants: PublicRestaurant[],
  date: Date = new Date(),
): PublicRestaurant[] {
  return [...restaurants].sort(
    (firstRestaurant, secondRestaurant) => {
      const firstIsOpen = isRestaurantOpenNow(
        firstRestaurant,
        date,
      );

      const secondIsOpen = isRestaurantOpenNow(
        secondRestaurant,
        date,
      );

      if (firstIsOpen !== secondIsOpen) {
        return firstIsOpen ? -1 : 1;
      }

      const firstHasPromotion =
        restaurantHasPromotionToday(
          firstRestaurant,
          date,
        );

      const secondHasPromotion =
        restaurantHasPromotionToday(
          secondRestaurant,
          date,
        );

      if (
        firstHasPromotion !== secondHasPromotion
      ) {
        return firstHasPromotion ? -1 : 1;
      }

      return firstRestaurant.name.localeCompare(
        secondRestaurant.name,
        "es-MX",
      );
    },
  );
}