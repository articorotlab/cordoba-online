import type {
  DatabaseWeekDay,
} from "@/types/database-restaurants";

const CORDOBA_TIME_ZONE =
  "America/Mexico_City";

const weekDays: DatabaseWeekDay[] = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function normalizeWeekDay(
  value: string,
): DatabaseWeekDay {
  const normalizedValue = value
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  return (
    weekDays.find((day) => {
      return (
        day
          .normalize("NFD")
          .replace(
            /\p{Diacritic}/gu,
            "",
          ) === normalizedValue
      );
    }) ?? "lunes"
  );
}

function getPreviousDay(
  day: DatabaseWeekDay,
): DatabaseWeekDay {
  const currentIndex =
    weekDays.indexOf(day);

  return currentIndex <= 0
    ? weekDays[
        weekDays.length - 1
      ]
    : weekDays[
        currentIndex - 1
      ];
}

export type CordobaNowContext = {
  date: string;
  day: DatabaseWeekDay;
  previousDay: DatabaseWeekDay;
  currentTime: string;
};

export function getCordobaNowContext(
  date: Date = new Date(),
): CordobaNowContext {
  const formatter =
    new Intl.DateTimeFormat(
      "es-MX",
      {
        timeZone:
          CORDOBA_TIME_ZONE,
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      },
    );

  const parts =
    formatter.formatToParts(
      date,
    );

  function getPart(
    type: Intl.DateTimeFormatPartTypes,
  ): string {
    return (
      parts.find(
        (part) =>
          part.type === type,
      )?.value ?? ""
    );
  }

  const day = normalizeWeekDay(
    getPart("weekday"),
  );

  return {
    date: [
      getPart("year"),
      getPart("month"),
      getPart("day"),
    ].join("-"),

    day,

    previousDay:
      getPreviousDay(day),

    currentTime: [
      getPart("hour"),
      getPart("minute"),
      getPart("second"),
    ].join(":"),
  };
}