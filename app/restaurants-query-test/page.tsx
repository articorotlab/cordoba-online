import {
  getPublicRestaurantBySlug,
  getPublicRestaurants,
} from "@/lib/restaurants/queries";

export default async function RestaurantsQueryTestPage() {
  const restaurants = await getPublicRestaurants();

  const restaurant = await getPublicRestaurantBySlug(
    "restaurante-prueba",
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-950">
        Prueba de consultas
      </h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-950">
          Todos los restaurantes
        </h2>

        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-white">
          {JSON.stringify(restaurants, null, 2)}
        </pre>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-950">
          Restaurante por slug
        </h2>

        <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-white">
          {JSON.stringify(restaurant, null, 2)}
        </pre>
      </section>
    </main>
  );
}