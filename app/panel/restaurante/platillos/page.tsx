import { RestaurantProductsManager } from "@/components/panel/RestaurantProductsManager";
import { requireRestaurant } from "@/lib/auth/require-restaurant";
import { createClient } from "@/lib/supabase/server";

type RestaurantProductsPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

type RestaurantProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  image_url: string | null;
  featured: boolean;
};

export default async function RestaurantProductsPage({
  searchParams,
}: RestaurantProductsPageProps) {
  const [
    authContext,
    resolvedSearchParams,
  ] = await Promise.all([
    requireRestaurant(),
    searchParams,
  ]);

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("restaurant_products")
    .select(`
      id,
      name,
      description,
      price,
      image_url,
      featured
    `)
    .eq(
      "restaurant_id",
      authContext.restaurant.id,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error al cargar los platillos:",
      error,
    );

    throw new Error(
      "No fue posible cargar los platillos del restaurante.",
    );
  }

  const products =
    (data ?? []) as RestaurantProductRow[];

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-semibold text-orange-600">
          Platillos
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
          Platillos del restaurante
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
          Agrega todos tus platillos y selecciona
          hasta cinco para mostrarlos en tu perfil
          público.
        </p>
      </section>

      <RestaurantProductsManager
        products={products.map(
          (product) => ({
            id: product.id,
            name: product.name,
            description:
              product.description ?? "",
            price: Number(product.price),
            imageUrl: product.image_url,
            featured: product.featured,
          }),
        )}
        message={
          resolvedSearchParams.message
        }
        error={
          resolvedSearchParams.error
        }
      />
    </div>
  );
}
