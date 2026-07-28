import { Clock3 } from "lucide-react";

import type { PublicRestaurant } from "@/types/public-restaurants";

type RestaurantSchedule =
  PublicRestaurant["schedule"][number];

type RestaurantScheduleCardProps = {
  schedule: RestaurantSchedule[];
};

const orderedDays = [
  "lunes",
  "martes",
  "miércoles",
  "miercoles",
  "jueves",
  "viernes",
  "sábado",
  "sabado",
  "domingo",
];

function normalizeDay(day: string): string {
  return day.trim().toLocaleLowerCase("es-MX");
}

function formatDay(day: string): string {
  const normalizedDay = normalizeDay(day);

  const correctedDay =
    normalizedDay === "miercoles"
      ? "miércoles"
      : normalizedDay === "sabado"
        ? "sábado"
        : normalizedDay;

  return (
    correctedDay.charAt(0).toLocaleUpperCase("es-MX") +
    correctedDay.slice(1)
  );
}

function sortSchedule(
  schedule: RestaurantSchedule[],
): RestaurantSchedule[] {
  return [...schedule].sort((firstSchedule, secondSchedule) => {
    const firstIndex = orderedDays.indexOf(
      normalizeDay(firstSchedule.day),
    );

    const secondIndex = orderedDays.indexOf(
      normalizeDay(secondSchedule.day),
    );

    const normalizedFirstIndex =
      firstIndex === -1 ? orderedDays.length : firstIndex;

    const normalizedSecondIndex =
      secondIndex === -1 ? orderedDays.length : secondIndex;

    return normalizedFirstIndex - normalizedSecondIndex;
  });
}

export function RestaurantScheduleCard({
  schedule,
}: RestaurantScheduleCardProps) {
  const sortedSchedule = sortSchedule(schedule);

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-16 size-48 rounded-full bg-orange-100/60 blur-3xl"
      />

      <div className="relative">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
          Horarios
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Horario de atención
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Consulta los días y horarios disponibles antes de tu
          visita.
        </p>

        {sortedSchedule.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {sortedSchedule.map((scheduleItem, index) => (
              <div
                key={scheduleItem.id}
                className={[
                  "flex min-h-14 items-center justify-between gap-4 px-4 py-3.5 text-sm transition-colors hover:bg-slate-50",
                  index > 0 ? "border-t border-slate-100" : "",
                ].join(" ")}
              >
                <span className="font-medium text-slate-700">
                  {formatDay(scheduleItem.day)}
                </span>

                {scheduleItem.closed ? (
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    Cerrado
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-2 font-semibold text-slate-950">
                    <Clock3
                      aria-hidden="true"
                      className="size-4 text-orange-500"
                    />

                    {scheduleItem.opensAt} – {scheduleItem.closesAt}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Clock3
              aria-hidden="true"
              className="mx-auto size-7 text-slate-400"
            />

            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              Este restaurante todavía no ha publicado sus
              horarios.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}