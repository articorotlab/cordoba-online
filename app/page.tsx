import {
  Flame,
  MapPin,
  Sparkles,
} from "lucide-react";

import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HomeQuickAction } from "@/components/home/HomeQuickAction";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { getHomeStats } from "@/lib/home/get-home-stats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  /*
   * Este valor se consulta dinámicamente.
   *
   * promotionsToday contiene únicamente la cantidad
   * real de promociones válidas para el día actual.
   */
  const homeStats = await getHomeStats();

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-100 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_35%,rgba(37,99,235,0.12),transparent_32%),radial-gradient(circle_at_82%_30%,rgba(249,115,22,0.10),transparent_30%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] top-28 -z-10 size-64 rounded-full border border-blue-200/40"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[10%] top-32 -z-10 size-80 rounded-full border border-orange-200/40"
        />

        <PageContainer className="pt-16 pb-8 sm:pt-20 sm:pb-10 lg:pt-24 lg:pb-12">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="secondary"
              className="rounded-full border border-blue-100 bg-white px-4 py-2 text-blue-700 shadow-sm"
            >
              <Sparkles
                aria-hidden="true"
                className="mr-2 size-4"
              />

              Descubre Córdoba
            </Badge>

            <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              Todo lo que necesitas en{" "}
              <span className="text-blue-600">
                Córdoba
              </span>
              , en un solo lugar
            </h1>

            <div className="mx-auto mt-7 grid w-full max-w-lg grid-cols-2 gap-3">
              <HomeQuickAction
                href="/comer"
                icon={
                  <Flame aria-hidden="true" />
                }
                count={
                  homeStats.promotionsToday
                }
                singular="promo"
                plural="promos"
                suffix="para comer hoy"
                variant="orange"
              />

              <HomeQuickAction
                icon={
                  <MapPin aria-hidden="true" />
                }
                label="Explorar"
                variant="dark"
                disabled
                title="Próximamente"
              />
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="pt-4 pb-16 sm:pt-6 sm:pb-20">
        <div
          id="categorias"
          className="scroll-mt-24"
        >
          <CategoryGrid />
        </div>
      </PageContainer>
    </>
  );
}