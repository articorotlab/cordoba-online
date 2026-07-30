import {
  ArrowLeft,
  Clock3,
  MapPin,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { RestaurantTabs } from "@/components/restaurants/RestaurantTabs";
import { getImageVariantUrl } from "@/lib/images/storage-url";
import { getPublicRestaurantBySlug } from "@/lib/restaurants/queries";
import { createClient } from "@/lib/supabase/server";

import type {
  PublicRestaurantSchedule,
} from "@/types/public-restaurants";

type RestaurantPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const weekDayByJavaScriptDay = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

function timeToMinutes(
  time: string,
): number {
  const [
    hours,
    minutes,
  ] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function getMexicoCityDateParts() {
  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "America/Mexico_City",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      },
    );

  const parts =
    formatter.formatToParts(
      new Date(),
    );

  const weekday =
    parts.find(
      (part) =>
        part.type === "weekday",
    )?.value ?? "";

  const hour = Number(
    parts.find(
      (part) =>
        part.type === "hour",
    )?.value ?? "0",
  );

  const minute = Number(
    parts.find(
      (part) =>
        part.type === "minute",
    )?.value ?? "0",
  );

  const javascriptDayByShortName:
    Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

  return {
    day:
      javascriptDayByShortName[
        weekday
      ] ?? 0,
    currentMinutes:
      hour * 60 + minute,
  };
}

function getPreviousDay(
  day: number,
): number {
  return day === 0
    ? 6
    : day - 1;
}

function getRestaurantOpenStatus(
  schedule:
    PublicRestaurantSchedule[],
): {
  isOpen: boolean;
  statusLabel: string;
  scheduleLabel: string;
} {
  const {
    day,
    currentMinutes,
  } = getMexicoCityDateParts();

  const currentDay =
    weekDayByJavaScriptDay[day];

  const previousDay =
    weekDayByJavaScriptDay[
      getPreviousDay(day)
    ];

  const todaySchedule =
    schedule.find(
      (item) =>
        item.day === currentDay,
    );

  const previousSchedule =
    schedule.find(
      (item) =>
        item.day === previousDay,
    );

  if (
    previousSchedule &&
    !previousSchedule.closed &&
    previousSchedule.opensAt &&
    previousSchedule.closesAt
  ) {
    const previousOpeningMinutes =
      timeToMinutes(
        previousSchedule.opensAt,
      );

    const previousClosingMinutes =
      timeToMinutes(
        previousSchedule.closesAt,
      );

    const previousScheduleCrossesMidnight =
      previousClosingMinutes <
      previousOpeningMinutes;

    if (
      previousScheduleCrossesMidnight &&
      currentMinutes <
        previousClosingMinutes
    ) {
      return {
        isOpen: true,
        statusLabel:
          "Abierto ahora",
        scheduleLabel:
          `Hasta ${previousSchedule.closesAt}`,
      };
    }
  }

  if (
    !todaySchedule ||
    todaySchedule.closed ||
    !todaySchedule.opensAt ||
    !todaySchedule.closesAt
  ) {
    return {
      isOpen: false,
      statusLabel: "Cerrado",
      scheduleLabel:
        "Cerrado hoy",
    };
  }

  const openingMinutes =
    timeToMinutes(
      todaySchedule.opensAt,
    );

  const closingMinutes =
    timeToMinutes(
      todaySchedule.closesAt,
    );

  const crossesMidnight =
    closingMinutes <
    openingMinutes;

  const isOpen =
    crossesMidnight
      ? currentMinutes >=
        openingMinutes
      : currentMinutes >=
          openingMinutes &&
        currentMinutes <
          closingMinutes;

  return {
    isOpen,
    statusLabel: isOpen
      ? "Abierto ahora"
      : "Cerrado",
    scheduleLabel: isOpen
      ? `Hasta ${todaySchedule.closesAt}`
      : `Hoy ${todaySchedule.opensAt} – ${todaySchedule.closesAt}`,
  };
}

export default async function RestaurantPage({
  params,
}: RestaurantPageProps) {
  const { slug } =
    await params;

  const supabase =
    await createClient();

  const [
    restaurant,
    {
      data: {
        user,
      },
    },
  ] = await Promise.all([
    getPublicRestaurantBySlug(
      slug,
    ),
    supabase.auth.getUser(),
  ]);

  if (!restaurant) {
    notFound();
  }

  const openStatus =
    getRestaurantOpenStatus(
      restaurant.schedule,
    );

  const coverDisplayUrl =
    getImageVariantUrl(
      restaurant.cover,
      "display",
    );

  const logoCardUrl =
    getImageVariantUrl(
      restaurant.logo,
      "card",
    );

  return (
    <>
      <section className="border-b border-orange-100 bg-gradient-to-br from-orange-50/70 via-white to-white">
        <PageContainer className="py-6 sm:py-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-xl shadow-slate-950/10">
            <div className="relative h-[24rem] sm:h-[30rem] lg:h-[34rem]">
              {coverDisplayUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    coverDisplayUrl
                  }
                  alt={`Portada de ${restaurant.name}`}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-orange-50 to-blue-100">
                  <div
                    aria-hidden="true"
                    className="absolute -right-20 -top-20 size-80 rounded-full bg-orange-300/30 blur-3xl"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute -bottom-24 -left-16 size-72 rounded-full bg-blue-300/20 blur-3xl"
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/5 to-slate-950/80" />

              <Link
                href="/comer"
                aria-label="Volver a restaurantes"
                className="absolute left-4 top-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-slate-950/40 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-950/60 sm:left-6 sm:top-6"
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="size-5"
                />
              </Link>

              <div className="absolute inset-x-0 bottom-0 flex justify-center px-5 pb-8 sm:px-8 sm:pb-10">
                <div className="flex size-40 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-2xl sm:size-48 lg:size-52">
                  {logoCardUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        logoCardUrl
                      }
                      alt={`Logo de ${restaurant.name}`}
                      width={256}
                      height={256}
                      loading="eager"
                      decoding="async"
                      className="size-full object-contain"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-orange-50 to-white">
                      <Utensils
                        aria-hidden="true"
                        className="size-16 text-orange-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-3 mt-7 rounded-[1.75rem] border border-orange-100 bg-gradient-to-br from-orange-50/90 via-white to-blue-50/30 px-5 py-6 shadow-lg shadow-orange-950/5 sm:mx-auto sm:mt-9 sm:max-w-3xl sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  {restaurant.name}
                </h1>

                <div
                  aria-hidden="true"
                  className="mt-3 h-1 w-14 rounded-full bg-orange-400"
                />

                {restaurant.description && (
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                    {
                      restaurant.description
                    }
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm",
                    openStatus.isOpen
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "size-2 rounded-full",
                      openStatus.isOpen
                        ? "bg-emerald-500"
                        : "bg-slate-400",
                    ].join(" ")}
                  />

                  {
                    openStatus.statusLabel
                  }
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 sm:text-sm">
                  <Clock3
                    aria-hidden="true"
                    className="size-3.5 shrink-0"
                  />

                  {
                    openStatus.scheduleLabel
                  }
                </span>

                {restaurant.zone && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 sm:text-sm">
                    <MapPin
                      aria-hidden="true"
                      className="size-3.5 shrink-0"
                    />

                    {
                      restaurant.zone
                    }
                  </span>
                )}
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <div className="relative bg-gradient-to-b from-orange-50/60 via-white to-blue-50/40">
        <PageContainer className="py-6 sm:py-10">
          <RestaurantTabs
            restaurant={restaurant}
            isAuthenticated={
              Boolean(user)
            }
          />
        </PageContainer>
      </div>
    </>
  );
}