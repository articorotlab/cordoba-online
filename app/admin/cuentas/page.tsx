import {
  CircleCheck,
  KeyRound,
  ShieldCheck,
  Store,
  UserPlus,
  UserRound,
} from "lucide-react";

import {
  createRestaurantAccount,
  resetRestaurantPassword,
} from "@/app/admin/cuentas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminAccountsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_active: boolean;
};

type RestaurantMembership = {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: "owner" | "editor";
  created_at: string;
};

type AccountProfile = {
  id: string;
  username: string;
  full_name: string;
};

type RestaurantAccount = {
  membership: RestaurantMembership;
  profile: AccountProfile | null;
};

export default async function AdminAccountsPage({
  searchParams,
}: AdminAccountsPageProps) {
  await requireAdmin();

  const { error, message } =
    await searchParams;

  const supabase = createAdminClient();

  const [
    restaurantsResult,
    membershipsResult,
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select(
        "id, name, slug, category, is_active",
      )
      .order("name"),

    supabase
      .from("restaurant_members")
      .select(
        "id, restaurant_id, user_id, role, created_at",
      )
      .order("created_at"),
  ]);

  if (restaurantsResult.error) {
    throw new Error(
      "No fue posible cargar los restaurantes.",
    );
  }

  if (membershipsResult.error) {
    throw new Error(
      "No fue posible cargar las cuentas de restaurantes.",
    );
  }

  const restaurants =
    (restaurantsResult.data ??
      []) as Restaurant[];

  const memberships =
    (membershipsResult.data ??
      []) as RestaurantMembership[];

  const userIds = Array.from(
    new Set(
      memberships.map(
        (membership) =>
          membership.user_id,
      ),
    ),
  );

  let profiles: AccountProfile[] = [];

  if (userIds.length > 0) {
    const profilesResult =
      await supabase
        .from("profiles")
        .select(
          "id, username, full_name",
        )
        .in("id", userIds);

    if (profilesResult.error) {
      throw new Error(
        "No fue posible cargar los perfiles de las cuentas.",
      );
    }

    profiles =
      (profilesResult.data ??
        []) as AccountProfile[];
  }

  const profilesById = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  );

  const accountsByRestaurant =
    new Map<string, RestaurantAccount>();

  memberships.forEach(
    (membership) => {
      if (
        !accountsByRestaurant.has(
          membership.restaurant_id,
        )
      ) {
        accountsByRestaurant.set(
          membership.restaurant_id,
          {
            membership,
            profile:
              profilesById.get(
                membership.user_id,
              ) ?? null,
          },
        );
      }
    },
  );

  const assignedRestaurants =
    restaurants.filter((restaurant) =>
      accountsByRestaurant.has(
        restaurant.id,
      ),
    );

  const pendingRestaurants =
    restaurants.filter(
      (restaurant) =>
        !accountsByRestaurant.has(
          restaurant.id,
        ),
    );

  return (
    <div>
      <div>
        <p className="text-sm font-bold text-blue-600">
          Cuentas
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Cuentas de restaurantes
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Crea las credenciales de cada
          restaurante, asigna su cuenta y
          restablece su contraseña cuando sea
          necesario.
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

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Store
              aria-hidden
              className="size-5"
            />
          </div>

          <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            {restaurants.length}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Restaurantes registrados
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck
              aria-hidden
              className="size-5"
            />
          </div>

          <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            {assignedRestaurants.length}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Cuentas asignadas
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <UserPlus
              aria-hidden
              className="size-5"
            />
          </div>

          <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            {pendingRestaurants.length}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Pendientes de crear
          </p>
        </article>
      </section>

      <section className="mt-8">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">
            Crear cuentas
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Cada restaurante tendrá un nombre de
            usuario y una contraseña administrados
            por cordoba.online.
          </p>
        </div>

        {pendingRestaurants.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <CircleCheck
              aria-hidden
              className="mx-auto size-10 text-emerald-600"
            />

            <h3 className="mt-4 text-lg font-black text-emerald-950">
              Todos los restaurantes tienen cuenta
            </h3>

            <p className="mt-2 text-sm text-emerald-800">
              Ya no existen restaurantes pendientes
              de asignación.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {pendingRestaurants.map(
              (restaurant) => (
                <article
                  key={restaurant.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Store
                        aria-hidden
                        className="size-5"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-black text-slate-950">
                        {restaurant.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {restaurant.category}
                      </p>
                    </div>
                  </div>

                  <form
                    action={
                      createRestaurantAccount
                    }
                    className="mt-6 space-y-4"
                  >
                    <input
                      type="hidden"
                      name="restaurantId"
                      value={restaurant.id}
                    />

                    <div>
                      <label
                        htmlFor={`fullName-${restaurant.id}`}
                        className="text-sm font-bold text-slate-950"
                      >
                        Nombre de la cuenta
                      </label>

                      <Input
                        id={`fullName-${restaurant.id}`}
                        name="fullName"
                        type="text"
                        required
                        defaultValue={
                          restaurant.name
                        }
                        autoComplete="off"
                        className="mt-2 h-11 rounded-xl"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`username-${restaurant.id}`}
                        className="text-sm font-bold text-slate-950"
                      >
                        Nombre de usuario
                      </label>

                      <Input
                        id={`username-${restaurant.id}`}
                        name="username"
                        type="text"
                        required
                        minLength={3}
                        maxLength={40}
                        pattern="[a-z0-9][a-z0-9._-]{2,39}"
                        defaultValue={
                          restaurant.slug
                        }
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        className="mt-2 h-11 rounded-xl"
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        El restaurante usará este
                        nombre para iniciar sesión.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`password-${restaurant.id}`}
                          className="text-sm font-bold text-slate-950"
                        >
                          Contraseña
                        </label>

                        <Input
                          id={`password-${restaurant.id}`}
                          name="password"
                          type="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres"
                          className="mt-2 h-11 rounded-xl"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`confirmPassword-${restaurant.id}`}
                          className="text-sm font-bold text-slate-950"
                        >
                          Confirmar contraseña
                        </label>

                        <Input
                          id={`confirmPassword-${restaurant.id}`}
                          name="confirmPassword"
                          type="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          placeholder="Repite la contraseña"
                          className="mt-2 h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-xl font-bold"
                    >
                      <UserPlus
                        aria-hidden
                        className="size-4"
                      />

                      Crear y asignar cuenta
                    </Button>
                  </form>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">
            Cuentas asignadas
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Consulta el usuario de cada restaurante
            y establece una nueva contraseña.
          </p>
        </div>

        {assignedRestaurants.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <UserRound
              aria-hidden
              className="mx-auto size-10 text-slate-400"
            />

            <h3 className="mt-4 font-black text-slate-950">
              Todavía no existen cuentas
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Crea la primera cuenta utilizando uno
              de los formularios anteriores.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {assignedRestaurants.map(
              (restaurant) => {
                const account =
                  accountsByRestaurant.get(
                    restaurant.id,
                  );

                if (!account) {
                  return null;
                }

                return (
                  <article
                    key={restaurant.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:items-start">
                      <div className="flex items-start gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <ShieldCheck
                            aria-hidden
                            className="size-5"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black text-slate-950">
                            {restaurant.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {restaurant.category}
                          </p>

                          <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex flex-wrap gap-x-2">
                              <dt className="font-bold text-slate-500">
                                Usuario:
                              </dt>

                              <dd className="font-bold text-slate-950">
                                {account.profile
                                  ?.username ??
                                  "Perfil no disponible"}
                              </dd>
                            </div>

                            <div className="flex flex-wrap gap-x-2">
                              <dt className="font-bold text-slate-500">
                                Nombre:
                              </dt>

                              <dd className="text-slate-700">
                                {account.profile
                                  ?.full_name ??
                                  "Sin nombre"}
                              </dd>
                            </div>

                            <div className="flex flex-wrap gap-x-2">
                              <dt className="font-bold text-slate-500">
                                Rol:
                              </dt>

                              <dd className="capitalize text-slate-700">
                                {account
                                  .membership
                                  .role ===
                                "owner"
                                  ? "Propietario"
                                  : "Editor"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      <form
                        action={
                          resetRestaurantPassword
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <input
                          type="hidden"
                          name="userId"
                          value={
                            account
                              .membership
                              .user_id
                          }
                        />

                        <div className="flex items-center gap-2">
                          <KeyRound
                            aria-hidden
                            className="size-4 text-blue-600"
                          />

                          <h4 className="text-sm font-black text-slate-950">
                            Restablecer contraseña
                          </h4>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                          <Input
                            name="password"
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="Nueva contraseña"
                            aria-label="Nueva contraseña"
                            className="h-10 rounded-xl bg-white"
                          />

                          <Input
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="Confirmar contraseña"
                            aria-label="Confirmar nueva contraseña"
                            className="h-10 rounded-xl bg-white"
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="outline"
                          className="mt-3 h-10 w-full rounded-xl bg-white font-bold"
                        >
                          <KeyRound
                            aria-hidden
                            className="size-4"
                          />

                          Actualizar contraseña
                        </Button>
                      </form>
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