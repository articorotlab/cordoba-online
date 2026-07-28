import Link from "next/link";
import { ArrowLeft, Utensils } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";

export default function RestaurantNotFound() {
  return (
    <PageContainer className="py-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
          <Utensils aria-hidden="true" className="size-8" />
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
          Restaurante no encontrado
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600">
          El restaurante que estás buscando no existe o ya no está disponible.
        </p>

        <Link
          href="/comer"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver a restaurantes
        </Link>
      </div>
    </PageContainer>
  );
}