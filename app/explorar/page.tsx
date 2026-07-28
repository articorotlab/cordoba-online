import Link from "next/link";
import {
  ArrowRight,
  Map,
  MapPin,
  Search,
  Utensils,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function ExplorarPage() {
  return (
    <PageContainer className="py-12 sm:py-16">
      <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          <MapPin aria-hidden="true" className="size-7" />
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
          Explora Córdoba
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Descubre lugares, negocios, servicios y actividades en toda la
          ciudad. Comenzamos con restaurantes y muy pronto agregaremos las
          demás categorías.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/comer"
            className="group rounded-3xl border border-orange-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Utensils aria-hidden="true" className="size-5" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Explorar restaurantes
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Encuentra lugares para comer, productos destacados y precios.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-600">
              Ver restaurantes
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-slate-500">
              <Map aria-hidden="true" className="size-5" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Mapa de Córdoba
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Próximamente podrás explorar negocios cercanos directamente
              desde el mapa.
            </p>

            <span className="mt-5 inline-flex text-sm font-bold text-slate-400">
              Próximamente
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-6 h-12 rounded-2xl bg-white px-6"
        >
          <Search aria-hidden="true" className="size-5" />
          Buscar en Córdoba
        </Button>
      </section>
    </PageContainer>
  );
}