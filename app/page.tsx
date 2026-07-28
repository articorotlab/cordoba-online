import Link from "next/link";
import {
  Flame,
  MapPin,
  Sparkles,
} from "lucide-react";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const promotionsToday = 38;

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

            <div className="mx-auto mt-7 grid w-full max-w-md grid-cols-2 gap-3">
              <Link
                href="/promociones"
                className="group inline-flex h-14 min-w-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:px-5 sm:text-base"
              >
                <Flame
                  aria-hidden="true"
                  className="size-5 shrink-0 transition-transform group-hover:scale-110"
                />

                <span className="truncate">
                  {promotionsToday > 0
                    ? `${promotionsToday} promos hoy`
                    : "Promociones"}
                </span>
              </Link>

              <Link
                href="/explorar"
                className="inline-flex h-14 min-w-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 sm:px-5 sm:text-base"
              >
                <MapPin
                  aria-hidden="true"
                  className="size-5 shrink-0"
                />

                <span className="truncate">
                  Explorar
                </span>
              </Link>
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