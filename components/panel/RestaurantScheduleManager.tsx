"use client";

import {
  Clock3,
  Copy,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { updateRestaurantSchedules } from "@/app/panel/restaurante/actions";

type WeekDay =
  | "lunes"
  | "martes"
  | "miércoles"
  | "jueves"
  | "viernes"
  | "sábado"
  | "domingo";

type RestaurantSchedule = {
  day: WeekDay;
  opensAt: string | null;
  closesAt: string | null;
  closed: boolean;
};

type RestaurantScheduleManagerProps = {
  schedules: RestaurantSchedule[];
};

type EditableSchedule = {
  day: WeekDay;
  label: string;
  opensAt: string;
  closesAt: string;
  closed: boolean;
};

const weekDays: Array<{
  day: WeekDay;
  label: string;
}> = [
  { day: "lunes", label: "Lunes" },
  { day: "martes", label: "Martes" },
  { day: "miércoles", label: "Miércoles" },
  { day: "jueves", label: "Jueves" },
  { day: "viernes", label: "Viernes" },
  { day: "sábado", label: "Sábado" },
  { day: "domingo", label: "Domingo" },
];

function ScheduleSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <Save className="size-4" />
          Guardar horarios
        </>
      )}
    </button>
  );
}

export function RestaurantScheduleManager({
  schedules,
}: RestaurantScheduleManagerProps) {
  const initialSchedules = useMemo<EditableSchedule[]>(
    () =>
      weekDays.map(({ day, label }) => {
        const storedSchedule = schedules.find(
          (schedule) => schedule.day === day,
        );

        return {
          day,
          label,
          opensAt:
            storedSchedule?.opensAt?.slice(0, 5) ??
            "09:00",
          closesAt:
            storedSchedule?.closesAt?.slice(0, 5) ??
            "21:00",
          closed: storedSchedule?.closed ?? true,
        };
      }),
    [schedules],
  );

  const [editableSchedules, setEditableSchedules] =
    useState(initialSchedules);

  function updateSchedule(
    day: WeekDay,
    changes: Partial<EditableSchedule>,
  ) {
    setEditableSchedules((currentSchedules) =>
      currentSchedules.map((schedule) =>
        schedule.day === day
          ? {
              ...schedule,
              ...changes,
            }
          : schedule,
      ),
    );
  }

  function copyScheduleToAll(sourceDay: WeekDay) {
    const sourceSchedule = editableSchedules.find(
      (schedule) => schedule.day === sourceDay,
    );

    if (!sourceSchedule) {
      return;
    }

    setEditableSchedules((currentSchedules) =>
      currentSchedules.map((schedule) => ({
        ...schedule,
        opensAt: sourceSchedule.opensAt,
        closesAt: sourceSchedule.closesAt,
        closed: sourceSchedule.closed,
      })),
    );
  }

  const serializedSchedules = JSON.stringify(
    editableSchedules.map((schedule) => ({
      day: schedule.day,
      opensAt: schedule.closed
        ? null
        : schedule.opensAt,
      closesAt: schedule.closed
        ? null
        : schedule.closesAt,
      closed: schedule.closed,
    })),
  );

  return (
    <form
      action={updateRestaurantSchedules}
      className="space-y-6"
    >
      <input
        type="hidden"
        name="schedules"
        value={serializedSchedules}
      />

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-gradient-to-r from-sky-50 to-white px-5 py-5 sm:px-7">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <Clock3 className="size-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Horarios del restaurante
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Define un horario de apertura y cierre para cada día de la semana.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {editableSchedules.map((schedule) => (
            <div
              key={schedule.day}
              className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-center"
            >
              <div>
                <p className="font-semibold text-neutral-950">
                  {schedule.label}
                </p>

                <p
                  className={[
                    "mt-1 text-xs font-medium",
                    schedule.closed
                      ? "text-neutral-400"
                      : "text-emerald-600",
                  ].join(" ")}
                >
                  {schedule.closed
                    ? "Cerrado"
                    : "Abierto"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[150px_1fr_1fr] sm:items-end">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Estado
                  </span>

                  <select
                    value={
                      schedule.closed
                        ? "closed"
                        : "open"
                    }
                    onChange={(event) => {
                      updateSchedule(schedule.day, {
                        closed:
                          event.target.value ===
                          "closed",
                      });
                    }}
                    className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="open">
                      Abierto
                    </option>
                    <option value="closed">
                      Cerrado
                    </option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Abre
                  </span>

                  <input
                    type="time"
                    value={schedule.opensAt}
                    disabled={schedule.closed}
                    required={!schedule.closed}
                    onChange={(event) => {
                      updateSchedule(schedule.day, {
                        opensAt: event.target.value,
                      });
                    }}
                    className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Cierra
                  </span>

                  <input
                    type="time"
                    value={schedule.closesAt}
                    disabled={schedule.closed}
                    required={!schedule.closed}
                    onChange={(event) => {
                      updateSchedule(schedule.day, {
                        closesAt: event.target.value,
                      });
                    }}
                    className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  copyScheduleToAll(schedule.day);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              >
                <Copy className="size-4" />
                Copiar a todos
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-900 shadow-sm sm:p-6">
        Puedes registrar horarios que terminen después de medianoche, por ejemplo de 18:00 a 02:00.
      </section>

      <div className="sticky bottom-4 z-20 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-xl shadow-neutral-950/10 backdrop-blur sm:flex sm:items-center sm:justify-between sm:px-4">
        <p className="hidden text-sm text-neutral-500 sm:block">
          Guarda los horarios de los siete días.
        </p>

        <ScheduleSubmitButton />
      </div>
    </form>
  );
}