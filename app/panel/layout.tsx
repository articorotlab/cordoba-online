import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { requireRestaurant } from "@/lib/auth/require-restaurant";
import { createClient } from "@/lib/supabase/server";

type PanelLayoutProps = {
  children: React.ReactNode;
};

type RestaurantSlugResult = {
  slug: string;
};

export default async function PanelLayout({
  children,
}: PanelLayoutProps) {
  const authContext =
    await requireRestaurant();

  const supabase = await createClient();

  const {
    data: restaurantData,
    error,
  } = await supabase
    .from("restaurants")
    .select("slug")
    .eq(
      "id",
      authContext.restaurant.id,
    )
    .single();

  if (error || !restaurantData) {
    console.error(
      "Error al obtener el slug del restaurante:",
      error,
    );

    throw new Error(
      "No fue posible cargar el panel del restaurante.",
    );
  }

  const restaurant =
    restaurantData as RestaurantSlugResult;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50/80">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:px-8">
        <PanelSidebar
          restaurantName={
            authContext.restaurant.name
          }
          username={
            authContext.profile.username
          }
          publicProfileHref={`/comer/${restaurant.slug}`}
        />

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}