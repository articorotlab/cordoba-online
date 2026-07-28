import type { WeekDay } from "@/types/restaurant";

export const weekDays: WeekDay[] = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

const dayIndexMap: Record<number, WeekDay> = {
  0: "domingo",
  1: "lunes",
  2: "martes",
  3: "miércoles",
  4: "jueves",
  5: "viernes",
  6: "sábado",
};

export function getCurrentWeekDay(date = new Date()): WeekDay {
  return dayIndexMap[date.getDay()];
}

export function capitalizeWeekDay(day: WeekDay) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

export function getShortWeekDay(day: WeekDay) {
  const labels: Record<WeekDay, string> = {
    lunes: "Lun",
    martes: "Mar",
    miércoles: "Mié",
    jueves: "Jue",
    viernes: "Vie",
    sábado: "Sáb",
    domingo: "Dom",
  };

  return labels[day];
}

export function formatPromotionDays(days: WeekDay[]) {
  if (days.length === 0) {
    return "Sin días definidos";
  }

  if (days.length === 7) {
    return "Todos los días";
  }

  if (days.length === 1) {
    return capitalizeWeekDay(days[0]);
  }

  if (days.length === 2) {
    return `${capitalizeWeekDay(days[0])} y ${days[1]}`;
  }

  const initialDays = days
    .slice(0, -1)
    .map(capitalizeWeekDay)
    .join(", ");

  const lastDay = days[days.length - 1];

  return `${initialDays} y ${lastDay}`;
}

export function formatPromotionTime(
  startTime?: string,
  endTime?: string,
) {
  if (!startTime && !endTime) {
    return null;
  }

  if (startTime && !endTime) {
    return `Desde las ${startTime}`;
  }

  if (!startTime && endTime) {
    return `Hasta las ${endTime}`;
  }

  return `${startTime} – ${endTime}`;
}