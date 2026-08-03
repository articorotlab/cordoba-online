import Link from "next/link";
import {
  redirect,
} from "next/navigation";
import {
  ArrowLeft,
} from "lucide-react";

import {
  PageContainer,
} from "@/components/layout/PageContainer";
import {
  PromotionsByDay,
} from "@/components/promotions/PromotionsByDay";
import {
  getPublicPromotionsPage,
} from "@/lib/promotions/queries";
import {
  createCurrentPromotionWeek,
} from "@/lib/restaurants/promotion-week";
import {
  createClient,
} from "@/lib/supabase/server";

const PROMOTIONS_PER_PAGE = 16;

export default async function PromocionesPage() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(
        "/promociones",
      )}`,
    );
  }

  const promotionWeek =
    createCurrentPromotionWeek();

  const initialDate =
    promotionWeek.dates.find(
      (date) =>
        date.date ===
        promotionWeek.todayDate,
    ) ??
    promotionWeek.dates[0];

  const initialPage =
    initialDate
      ? await getPublicPromotionsPage({
          selectedDate:
            initialDate.date,
          day:
            initialDate.day,
          offset: 0,
          limit:
            PROMOTIONS_PER_PAGE,
        })
      : {
          promotions: [],
          total: 0,
          hasMore: false,
        };

  return (
    <PageContainer className="py-8 sm:py-12">
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

      <header className="mt-4">
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
          Promociones
        </h1>
      </header>

      <section
        aria-labelledby="promotions-title"
        className="mt-8"
      >
        <h2
          id="promotions-title"
          className="sr-only"
        >
          Promociones disponibles por día
        </h2>

        <PromotionsByDay
          promotionWeek={
            promotionWeek
          }
          initialPromotions={
            initialPage.promotions
          }
          initialTotal={
            initialPage.total
          }
          initialHasMore={
            initialPage.hasMore
          }
        />
      </section>
    </PageContainer>
  );
}