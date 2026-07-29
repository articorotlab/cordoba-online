import { createClient } from "@/lib/supabase/server";

export default async function DatabaseTestPage() {
  const supabase = await createClient();

  const {
    data: restaurants,
    error,
  } = await supabase
    .from("restaurants")
    .select(`
      id,
      slug,
      name,
      category,
      description,
      zone,
      address,
      phone,
      whatsapp,
      instagram,
      logo_url,
      cover_url,
      latitude,
      longitude,
      is_active,
      created_at,
      updated_at,
      products:restaurant_products (
        id,
        name,
        description,
        price,
        image_url,
        featured,
        active,
        created_at,
        updated_at
      ),
      promotions:restaurant_promotions (
        id,
        title,
        description,
        image_url,
        start_time,
        end_time,
        valid_from,
        valid_until,
        active,
        position,
        created_at,
        updated_at,
        days:restaurant_promotion_days (
          id,
          day
        )
      ),
      schedule:restaurant_schedules (
        id,
        day,
        opens_at,
        closes_at,
        closed,
        created_at,
        updated_at
      )
    `)
    .eq("slug", "restaurante-prueba")
    .order("created_at", {
      referencedTable: "restaurant_products",
      ascending: true,
    })
    .order("position", {
      referencedTable: "restaurant_promotions",
      ascending: true,
    })
    .single();

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl font-bold text-red-600">
          Error de base de datos
        </h1>

        <p className="mt-3 text-slate-600">
          No fue posible consultar el restaurante y su contenido.
        </p>

        <pre className="mt-6 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm text-white">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-950">
        Prueba completa de restaurante
      </h1>

      <p className="mt-3 text-slate-600">
        Restaurante, productos, promociones, días y horarios obtenidos
        directamente desde Supabase.
      </p>

      <pre className="mt-8 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-white">
        {JSON.stringify(restaurants, null, 2)}
      </pre>
    </main>
  );
}