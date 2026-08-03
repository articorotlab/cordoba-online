import Link from "next/link";
import {
  CircleCheck,
  ExternalLink,
  Store,
  StoreIcon,
  UserPlus,
} from "lucide-react";

import {
  createRestaurant,
} from "@/app/admin/restaurantes/actions";
import {
  restaurantCategories,
} from "@/constants/food-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  DeleteRestaurantButton,
} from "@/components/admin/DeleteRestaurantButton";

type AdminRestaurantsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

type Restaurant = {
  id: string;
  slug: string;
  name: string;
  category: string;
  zone: string;
  is_active: boolean;
  created_at: string;
};

type Membership = {
  restaurant_id: string;
};

export default async function AdminRestaurantsPage({
  searchParams,
}: AdminRestaurantsPageProps) {
  await requireAdmin();

  const {
    error,
    message,
  } = await searchParams;

  const supabase =
    createAdminClient();

  const [
    restaurantsResult,
    membershipsResult,
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select(
        "id, slug, name, category, zone, is_active, created_at",
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("restaurant_members")
      .select("restaurant_id"),
  ]);

  if (restaurantsResult.error) {
    throw new Error(
      "No fue posible cargar los restaurantes.",
    );
  }

  if (membershipsResult.error) {
    throw new Error(
      "No fue posible comprobar las cuentas asignadas.",
    );
  }

  const restaurants =
    (restaurantsResult.data ??
      []) as Restaurant[];

  const memberships =
    (membershipsResult.data ??
      []) as Membership[];

  const restaurantIdsWithAccount =
    new Set(
      memberships.map(
        (membership) =>
          membership.restaurant_id,
      ),
    );

  return (
    <div>
      <div>
        <p className="text-sm font-bold text-blue-600">
          Restaurantes
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Administrar restaurantes
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Registra nuevos restaurantes en Córdoba
          Online. Después podrás crear sus
          credenciales desde la sección de cuentas.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-800"
        >
          <CircleCheck
            aria-hidden
            className="mt-0.5 size-5 shrink-0"
          />

          <p>{message}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <StoreIcon
              aria-hidden
              className="size-5"
            />
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              Crear restaurante
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Crea primero el perfil comercial. La
              cuenta de acceso se asignará después.
            </p>
          </div>
        </div>

        <form
          action={createRestaurant}
          className="mt-7 grid gap-5 lg:grid-cols-2"
        >
          <div>
            <label
              htmlFor="restaurant-name"
              className="text-sm font-bold text-slate-950"
            >
              Nombre del restaurante
            </label>

            <Input
              id="restaurant-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              autoComplete="organization"
              placeholder="Ej. Casa Vieja"
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor="restaurant-slug"
              className="text-sm font-bold text-slate-950"
            >
              Slug público
            </label>

            <Input
              id="restaurant-slug"
              name="slug"
              type="text"
              required
              minLength={2}
              maxLength={80}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="casa-vieja"
              className="mt-2 h-12 rounded-xl"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Se utilizará en la dirección pública:
              {" "}
              <span className="font-semibold">
                /comer/casa-vieja
              </span>
            </p>
          </div>

          <div>
            <label
              htmlFor="restaurant-category"
              className="text-sm font-bold text-slate-950"
            >
              Categoría
            </label>

            <select
              id="restaurant-category"
              name="category"
              required
              defaultValue=""
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option
                value=""
                disabled
              >
                Selecciona una categoría
              </option>

              {restaurantCategories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="restaurant-zone"
              className="text-sm font-bold text-slate-950"
            >
              Zona o colonia
            </label>

            <Input
              id="restaurant-zone"
              name="zone"
              type="text"
              maxLength={80}
              autoComplete="address-level3"
              placeholder="Ej. Villa Verde"
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="restaurant-description"
              className="text-sm font-bold text-slate-950"
            >
              Descripción
            </label>

            <textarea
              id="restaurant-description"
              name="description"
              rows={4}
              maxLength={500}
              placeholder="Describe brevemente el restaurante."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="restaurant-address"
              className="text-sm font-bold text-slate-950"
            >
              Dirección
            </label>

            <Input
              id="restaurant-address"
              name="address"
              type="text"
              maxLength={180}
              autoComplete="street-address"
              placeholder="Calle, número y referencias"
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor="restaurant-phone"
              className="text-sm font-bold text-slate-950"
            >
              Teléfono
            </label>

            <Input
              id="restaurant-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Opcional"
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor="restaurant-whatsapp"
              className="text-sm font-bold text-slate-950"
            >
              WhatsApp
            </label>

            <Input
              id="restaurant-whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Opcional"
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="restaurant-instagram"
              className="text-sm font-bold text-slate-950"
            >
              Instagram
            </label>

            <Input
              id="restaurant-instagram"
              name="instagram"
              type="text"
              maxLength={200}
              autoComplete="off"
              placeholder="@restaurante o enlace completo"
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div className="lg:col-span-2">
            <Button
              type="submit"
              className="h-12 w-full rounded-xl font-bold sm:w-auto"
            >
              <Store className="size-4" />

              Crear restaurante
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              Restaurantes registrados
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {restaurants.length} restaurantes
              registrados actualmente.
            </p>
          </div>

          <Link
            href="/admin/cuentas"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
          >
            <UserPlus className="size-4" />

            Administrar cuentas
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Store
              aria-hidden
              className="mx-auto size-10 text-slate-400"
            />

            <h3 className="mt-4 font-black text-slate-950">
              No existen restaurantes
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Utiliza el formulario para crear el
              primero.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {restaurants.map(
              (restaurant) => {
                const hasAccount =
                  restaurantIdsWithAccount.has(
                    restaurant.id,
                  );

                return (
                  <article
                    key={restaurant.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Store
                          aria-hidden
                          className="size-5"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-black text-slate-950">
                              {restaurant.name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {restaurant.category}
                              {restaurant.zone
                                ? ` · ${restaurant.zone}`
                                : ""}
                            </p>
                          </div>

                          <span
                            className={[
                              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                              restaurant.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500",
                            ].join(" ")}
                          >
                            {restaurant.is_active
                              ? "Activo"
                              : "Inactivo"}
                          </span>
                        </div>

                        <p className="mt-3 text-xs font-semibold text-slate-500">
                          /comer/{restaurant.slug}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <Link
                                href={`/comer/${restaurant.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                            >
                                <ExternalLink className="size-4" />

                                Ver perfil
                            </Link>

                            {hasAccount ? (
                                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                Cuenta asignada
                                </span>
                            ) : (
                                <Link
                                href="/admin/cuentas"
                                className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
                                >
                                Crear cuenta
                                </Link>
                            )}

                            <div className="basis-full border-t border-slate-100 pt-3 sm:ml-auto sm:basis-auto sm:border-0 sm:pt-0">
                                <DeleteRestaurantButton
                                restaurantId={
                                    restaurant.id
                                }
                                restaurantName={
                                    restaurant.name
                                }
                                />
                            </div>
                          </div>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}