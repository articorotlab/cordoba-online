"use client";

import Link from "next/link";
import {
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  LoaderCircle,
  Store,
  TriangleAlert,
} from "lucide-react";

import {
  loadHomeRestaurants,
} from "@/app/comer/actions";
import {
  RestaurantGrid,
} from "@/components/features/restaurants/RestaurantGrid";
import {
  foodCategories,
  type FoodCategory,
} from "@/constants/food-categories";

import type {
  PublicRestaurantCardItem,
} from "@/types/public-restaurants";

type RestaurantExplorerProps = {
  initialRestaurants:
    PublicRestaurantCardItem[];
  initialTotal: number;
};

type CategoryAppearance = {
  emoji: string;
  background: string;
  selectedBackground: string;
  selectedText: string;
  ring: string;
};

const categoryAppearances: Record<
  FoodCategory,
  CategoryAppearance
> = {
  Todos: {
    emoji: "🍽️",
    background: "bg-slate-100",
    selectedBackground:
      "bg-slate-950",
    selectedText:
      "text-slate-950",
    ring:
      "ring-slate-950/10",
  },

  Tacos: {
    emoji: "🌮",
    background: "bg-amber-100",
    selectedBackground:
      "bg-amber-400",
    selectedText:
      "text-amber-700",
    ring:
      "ring-amber-400/30",
  },

  Hamburguesas: {
    emoji: "🍔",
    background: "bg-orange-100",
    selectedBackground:
      "bg-orange-500",
    selectedText:
      "text-orange-700",
    ring:
      "ring-orange-500/30",
  },

  Alitas: {
    emoji: "🍗",
    background: "bg-red-100",
    selectedBackground:
      "bg-red-500",
    selectedText:
      "text-red-700",
    ring:
      "ring-red-500/30",
  },

  Pizzerías: {
    emoji: "🍕",
    background: "bg-yellow-100",
    selectedBackground:
      "bg-yellow-400",
    selectedText:
      "text-yellow-700",
    ring:
      "ring-yellow-400/30",
  },

  Mariscos: {
    emoji: "🦐",
    background: "bg-sky-100",
    selectedBackground:
      "bg-sky-500",
    selectedText:
      "text-sky-700",
    ring:
      "ring-sky-500/30",
  },

  Cafeterías: {
    emoji: "☕",
    background: "bg-stone-200",
    selectedBackground:
      "bg-amber-800",
    selectedText:
      "text-amber-800",
    ring:
      "ring-amber-800/20",
  },

  Desayunos: {
    emoji: "🍳",
    background: "bg-yellow-100",
    selectedBackground:
      "bg-yellow-400",
    selectedText:
      "text-yellow-700",
    ring:
      "ring-yellow-400/30",
  },

  Postres: {
    emoji: "🍰",
    background: "bg-pink-100",
    selectedBackground:
      "bg-pink-500",
    selectedText:
      "text-pink-700",
    ring:
      "ring-pink-500/30",
  },

  Antojitos: {
    emoji: "🫔",
    background: "bg-lime-100",
    selectedBackground:
      "bg-lime-500",
    selectedText:
      "text-lime-700",
    ring:
      "ring-lime-500/30",
  },

  "Comida mexicana": {
    emoji: "🌶️",
    background:
      "bg-emerald-100",
    selectedBackground:
      "bg-emerald-600",
    selectedText:
      "text-emerald-700",
    ring:
      "ring-emerald-600/30",
  },

  Saludable: {
    emoji: "🥗",
    background: "bg-green-100",
    selectedBackground:
      "bg-green-500",
    selectedText:
      "text-green-700",
    ring:
      "ring-green-500/30",
  },

  "Fast food": {
    emoji: "🍟",
    background: "bg-orange-100",
    selectedBackground:
      "bg-orange-500",
    selectedText:
      "text-orange-700",
    ring:
      "ring-orange-500/30",
  },

  Otros: {
    emoji: "✨",
    background:
      "bg-violet-100",
    selectedBackground:
      "bg-violet-500",
    selectedText:
      "text-violet-700",
    ring:
      "ring-violet-500/30",
  },
};

export function RestaurantExplorer({
  initialRestaurants,
  initialTotal,
}: RestaurantExplorerProps) {
  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<FoodCategory>(
      "Todos",
    );

  const [
    restaurants,
    setRestaurants,
  ] = useState(
    initialRestaurants,
  );

  const [
    total,
    setTotal,
  ] = useState(
    initialTotal,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /*
   * Permite ignorar una respuesta anterior si el usuario
   * selecciona rápidamente otra categoría.
   */
  const requestIdRef =
    useRef(0);

  const resultLabel =
    total === 1
      ? "1 restaurante"
      : `${total} restaurantes`;

  const viewAllLabel =
    selectedCategory === "Todos"
      ? "Ver todos los restaurantes"
      : `Ver todos en ${selectedCategory}`;

  const viewAllHref =
    selectedCategory === "Todos"
      ? "/comer/restaurantes"
      : `/comer/restaurantes?categoria=${encodeURIComponent(
          selectedCategory,
        )}`;

  async function handleCategoryChange(
    category: FoodCategory,
  ) {
    if (
      category ===
      selectedCategory
    ) {
      return;
    }

    const requestId =
      requestIdRef.current + 1;

    requestIdRef.current =
      requestId;

    setSelectedCategory(
      category,
    );

    setIsLoading(true);
    setError(null);

    try {
      const result =
        await loadHomeRestaurants({
          category,
        });

      /*
       * Ignorar respuestas antiguas si existe una
       * solicitud más reciente.
       */
      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      if (!result.ok) {
        throw new Error(
          result.error,
        );
      }

      setRestaurants(
        result.restaurants,
      );

      setTotal(
        result.total,
      );
    } catch (loadError) {
      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      console.error(
        "Error al cargar la categoría de restaurantes:",
        loadError,
      );

      setRestaurants([]);
      setTotal(0);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar los restaurantes.",
      );
    } finally {
      if (
        requestId ===
        requestIdRef.current
      ) {
        setIsLoading(false);
      }
    }
  }

  return (
    <section>
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
          Categorías
        </p>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              ¿Qué se te antoja?
            </h2>

            <p
              aria-live="polite"
              className="mt-2 text-sm font-medium text-slate-500"
            >
              {isLoading
                ? "Cargando restaurantes..."
                : resultLabel}
            </p>
          </div>
        </div>
      </header>

      <div className="-mx-4 mt-7 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6">
        <div className="flex min-w-max gap-3 sm:gap-4">
          {foodCategories.map(
            (category) => {
              const isSelected =
                selectedCategory ===
                category;

              const appearance =
                categoryAppearances[
                  category
                ];

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={
                    isSelected
                  }
                  onClick={() => {
                    void handleCategoryChange(
                      category,
                    );
                  }}
                  className="group flex w-[88px] shrink-0 flex-col items-center text-center sm:w-[104px]"
                >
                  <span
                    className={[
                      "relative flex size-[72px] items-center justify-center rounded-[1.6rem] text-3xl transition-all duration-300 sm:size-20 sm:text-4xl",
                      isSelected
                        ? `${appearance.selectedBackground} scale-105 shadow-lg ring-4 ${appearance.ring}`
                        : `${appearance.background} shadow-sm group-hover:-translate-y-1 group-hover:shadow-md`,
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "transition-transform duration-300",
                        isSelected
                          ? "scale-110"
                          : "group-hover:scale-110",
                      ].join(" ")}
                    >
                      {
                        appearance.emoji
                      }
                    </span>

                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-white/20 bg-inherit"
                      />
                    )}
                  </span>

                  <span
                    className={[
                      "mt-3 max-w-[104px] text-sm font-semibold leading-5 transition-colors",
                      isSelected
                        ? appearance.selectedText
                        : "text-slate-600 group-hover:text-slate-950",
                    ].join(" ")}
                  >
                    {category}
                  </span>

                  <span
                    aria-hidden="true"
                    className={[
                      "mt-2 h-1 rounded-full transition-all duration-300",
                      isSelected
                        ? "w-6 bg-orange-500"
                        : "w-0 bg-transparent",
                    ].join(" ")}
                  />
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-8 sm:mt-6 sm:pt-10">
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-slate-100 bg-slate-50/70"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-8 animate-spin text-orange-500"
            />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Cargando restaurantes...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium leading-6 text-red-700"
          >
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />

            <p>{error}</p>
          </div>
        ) : restaurants.length > 0 ? (
          <>
            <RestaurantGrid
              restaurants={
                restaurants
              }
            />

            <Link
              href={viewAllHref}
              className="group mt-7 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-md"
            >
              {viewAllLabel}

              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-white px-6 py-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
              <Store
                aria-hidden="true"
                className="size-7"
              />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              Todavía no hay restaurantes
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
              Aún no tenemos restaurantes registrados en la
              categoría {selectedCategory}.
            </p>

            {selectedCategory !==
              "Todos" && (
              <button
                type="button"
                onClick={() => {
                  void handleCategoryChange(
                    "Todos",
                  );
                }}
                className="mt-5 text-sm font-bold text-orange-600 transition-colors hover:text-orange-700"
              >
                Ver todos los restaurantes
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}