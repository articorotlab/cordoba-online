"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useEffect,
  useRef,
} from "react";

import type { DatabaseWeekDay } from "@/types/database-restaurants";

export type RestaurantPromotionDate = {
  date: string;
  day: DatabaseWeekDay;
  dayNumber: string;
  month: string;
  shortDay: string;
};

type RestaurantPromotionDaySelectorProps = {
  dates: RestaurantPromotionDate[];
  selectedDate: string;
  onDateChange: (date: string) => void;
};

const VISIBLE_DAY_COUNT = 4;

export function RestaurantPromotionDaySelector({
  dates,
  selectedDate,
  onDateChange,
}: RestaurantPromotionDaySelectorProps) {
  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const selectedIndex = dates.findIndex(
      (date) => date.date === selectedDate,
    );

    if (selectedIndex < 0) {
      return;
    }

    /*
     * Intentamos mantener el día seleccionado en la
     * segunda posición. En los extremos se limita
     * automáticamente a lunes o domingo.
     */
    const maximumStartIndex = Math.max(
      0,
      dates.length - VISIBLE_DAY_COUNT,
    );

    const targetStartIndex = Math.min(
      Math.max(selectedIndex - 1, 0),
      maximumStartIndex,
    );

    const itemWidth =
      container.clientWidth /
      VISIBLE_DAY_COUNT;

    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({
        left: targetStartIndex * itemWidth,
        behavior: "smooth",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [
    dates,
    selectedDate,
  ]);

  function scrollDays(
    direction: "left" | "right",
  ) {
    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const itemWidth =
      container.clientWidth /
      VISIBLE_DAY_COUNT;

    container.scrollBy({
      left:
        direction === "left"
          ? -itemWidth
          : itemWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950 px-2 py-3 shadow-lg shadow-slate-950/10 sm:px-3">
      <div className="flex items-stretch">
        <button
          type="button"
          aria-label="Ver días anteriores"
          onClick={() => scrollDays("left")}
          className="hidden w-10 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-white sm:flex"
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-6"
          />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {dates.map((date) => {
            const isSelected =
              selectedDate === date.date;

            return (
              <button
                key={date.date}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  onDateChange(date.date)
                }
                className={[
                  "relative min-w-[25%] basis-1/4 snap-start px-1 pb-4 pt-3 text-center transition-all duration-300",
                  isSelected
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200",
                ].join(" ")}
              >
                <span
                  className={[
                    "block text-[11px] font-bold uppercase tracking-[0.12em]",
                    isSelected
                      ? "text-orange-400"
                      : "text-slate-400",
                  ].join(" ")}
                >
                  {date.dayNumber} {date.month}
                </span>

                <span className="mt-1 block text-2xl font-black uppercase tracking-tight sm:text-3xl">
                  {date.shortDay}
                </span>

                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-x-2 bottom-0 h-1 rounded-full transition-all duration-300",
                    isSelected
                      ? "bg-orange-500"
                      : "bg-transparent",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Ver días siguientes"
          onClick={() => scrollDays("right")}
          className="hidden w-10 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-white sm:flex"
        >
          <ChevronRight
            aria-hidden="true"
            className="size-6"
          />
        </button>
      </div>
    </div>
  );
}