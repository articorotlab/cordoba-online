import { RestaurantForm } from "@/components/panel/RestaurantForm";
import { requireRestaurant } from "@/lib/auth/require-restaurant";
import { createClient } from "@/lib/supabase/server";

type RestaurantSection =
  | "general"
  | "contacto"
  | "ubicacion"
  | "horarios"
  | "imagenes";

type WeekDay =
  | "lunes"
  | "martes"
  | "miércoles"
  | "jueves"
  | "viernes"
  | "sábado"
  | "domingo";

type RestaurantEditorPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
    section?: string;
  }>;
};

type EditableRestaurant = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  zone: string;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_url: string | null;
};

type RestaurantScheduleRow = {
  day: WeekDay;
  opens_at: string | null;
  closes_at: string | null;
  closed: boolean;
};

function getInitialSection(
  section?: string,
): RestaurantSection {
  if (
    section === "contacto" ||
    section === "ubicacion" ||
    section === "horarios" ||
    section === "imagenes"
  ) {
    return section;
  }

  return "general";
}

export default async function RestaurantEditorPage({
  searchParams,
}: RestaurantEditorPageProps) {
  const [authContext, resolvedSearchParams] =
    await Promise.all([
      requireRestaurant(),
      searchParams,
    ]);

  const supabase = await createClient();

  const [restaurantResult, schedulesResult] =
    await Promise.all([
      supabase
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
          cover_url
        `)
        .eq(
          "id",
          authContext.restaurant.id,
        )
        .single(),
      supabase
        .from("restaurant_schedules")
        .select(`
          day,
          opens_at,
          closes_at,
          closed
        `)
        .eq(
          "restaurant_id",
          authContext.restaurant.id,
        ),
    ]);

  const {
    data: restaurant,
    error: restaurantError,
  } = restaurantResult;

  if (restaurantError || !restaurant) {
    console.error(
      "Error al cargar la información del restaurante:",
      restaurantError,
    );

    throw new Error(
      "No fue posible cargar la información del restaurante.",
    );
  }

  if (schedulesResult.error) {
    console.error(
      "Error al cargar los horarios del restaurante:",
      schedulesResult.error,
    );

    throw new Error(
      "No fue posible cargar los horarios del restaurante.",
    );
  }

  const editableRestaurant =
    restaurant as EditableRestaurant;

  const schedules =
    (schedulesResult.data ?? []) as RestaurantScheduleRow[];

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-semibold text-orange-600">
          Mi restaurante
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
          Información del negocio
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
          Administra de manera sencilla la
          información que las personas verán en el
          perfil de{" "}
          <strong className="font-semibold text-neutral-800">
            {editableRestaurant.name}
          </strong>
          .
        </p>
      </section>

      <RestaurantForm
        restaurant={{
          id: editableRestaurant.id,
          slug: editableRestaurant.slug,
          name: editableRestaurant.name,
          category: editableRestaurant.category,
          description:
            editableRestaurant.description,
          zone: editableRestaurant.zone,
          address: editableRestaurant.address,
          phone: editableRestaurant.phone,
          whatsapp: editableRestaurant.whatsapp,
          instagram: editableRestaurant.instagram,
          logoUrl: editableRestaurant.logo_url,
          coverUrl: editableRestaurant.cover_url,
        }}
        schedules={schedules.map((schedule) => ({
          day: schedule.day,
          opensAt: schedule.opens_at,
          closesAt: schedule.closes_at,
          closed: schedule.closed,
        }))}
        initialSection={getInitialSection(
          resolvedSearchParams.section,
        )}
        message={resolvedSearchParams.message}
        error={resolvedSearchParams.error}
      />
    </div>
  );
}