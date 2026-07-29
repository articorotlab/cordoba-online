import {
  PackageOpen,
  Store,
  Tag,
  UsersRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
};

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon
            aria-hidden={true}
            className="size-5"
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </article>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    restaurantsResult,
    productsResult,
    promotionsResult,
    membershipsResult,
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("restaurant_products")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("restaurant_promotions")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("restaurant_members")
      .select("*", {
        count: "exact",
        head: true,
      }),
  ]);

  const stats = [
    {
      label: "Restaurantes",
      value: restaurantsResult.count ?? 0,
      description:
        "Perfiles de restaurantes registrados en la plataforma.",
      icon: Store,
    },
    {
      label: "Productos",
      value: productsResult.count ?? 0,
      description:
        "Platillos y productos creados por los restaurantes.",
      icon: PackageOpen,
    },
    {
      label: "Promociones",
      value: promotionsResult.count ?? 0,
      description:
        "Promociones registradas para los diferentes días.",
      icon: Tag,
    },
    {
      label: "Cuentas asignadas",
      value: membershipsResult.count ?? 0,
      description:
        "Usuarios de restaurantes vinculados actualmente.",
      icon: UsersRound,
    },
  ];

  return (
    <div>
      <div>
        <p className="text-sm font-bold text-blue-600">
          Administración
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Resumen general
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Administra los restaurantes, sus cuentas,
          productos, horarios y promociones desde un
          solo lugar.
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
          />
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-black text-slate-950">
          Cuentas de restaurantes
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Actualmente no existen cuentas asignadas.
          El siguiente paso será crear las cuentas de
          los cinco restaurantes y relacionarlas con
          sus perfiles.
        </p>
      </section>
    </div>
  );
}