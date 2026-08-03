import Link from "next/link";
import {
  ArrowLeft,
  Store,
} from "lucide-react";

import {
  RestaurantDirectoryList,
} from "@/components/features/restaurants/RestaurantDirectoryList";
import {
  PageContainer,
} from "@/components/layout/PageContainer";
import {
  restaurantCategories,
} from "@/constants/food-categories";
import {
  getPublicRestaurantDirectoryPage,
} from "@/lib/restaurants/queries";

type RestaurantsPageProps = {
  searchParams: Promise<{
    categoria?: string;
  }>;
};

const RESTAURANTS_PER_PAGE = 10;

function getValidCategory(
  category: string | undefined,
): string {
  const normalizedCategory =
    category?.trim();

  if (!normalizedCategory) {
    return "Todos";
  }

  const matchedCategory =
    restaurantCategories.find(
      (restaurantCategory) =>
        restaurantCategory.toLocaleLowerCase(
          "es-MX",
        ) ===
        normalizedCategory.toLocaleLowerCase(
          "es-MX",
        ),
    );

  return (
    matchedCategory ??
    "Todos"
  );
}

export default async function RestaurantsPage({
  searchParams,
}: RestaurantsPageProps) {
  const {
    categoria,
  } = await searchParams;

  const selectedCategory =
    getValidCategory(
      categoria,
    );

  const initialPage =
    await getPublicRestaurantDirectoryPage({
      category:
        selectedCategory === "Todos"
          ? undefined
          : selectedCategory,
      offset: 0,
      limit:
        RESTAURANTS_PER_PAGE,
    });

  return (
    <PageContainer className="py-10 sm:py-14">
      <Link
        href="/comer"
        className="group inline-flex h-11 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-bold text-orange-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:-translate-x-0.5">
          <ArrowLeft
            aria-hidden="true"
            className="size-4"
          />
        </span>

        Volver a restaurantes
      </Link>

      <div className="mt-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
          Restaurantes
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-slate-950">
          {selectedCategory ===
          "Todos"
            ? "Todos los restaurantes"
            : selectedCategory}
        </h1>

        <p className="mt-3 text-sm font-medium text-slate-500">
          {initialPage.total === 1
            ? "1 restaurante"
            : `${initialPage.total} restaurantes`}
        </p>
      </div>

      <div className="mt-8">
        {initialPage.restaurants
          .length > 0 ? (
          <RestaurantDirectoryList
            key={selectedCategory}
            initialRestaurants={
              initialPage.restaurants
            }
            initialHasMore={
              initialPage.hasMore
            }
            category={
              selectedCategory
            }
          />
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <Store
                aria-hidden="true"
                className="size-7"
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-950">
              No encontramos restaurantes
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Todavía no hay restaurantes publicados en la categoría{" "}
              {selectedCategory}.
            </p>

            <Link
              href="/comer/restaurantes"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              Ver todos los restaurantes
            </Link>
          </div>
        )}
      </div>
    </PageContainer>
  );
}