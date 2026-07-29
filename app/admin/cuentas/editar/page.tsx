import Link from "next/link";
import {
  ArrowLeft,
  CircleCheck,
  PencilLine,
  Save,
  ShieldCheck,
  Store,
} from "lucide-react";

import {
  updateRestaurantAccount,
} from "@/app/admin/cuentas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

type EditAccountsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

type Membership = {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: "owner" | "editor";
};

type Restaurant = {
  id: string;
  name: string;
  category: string;
};

type Profile = {
  id: string;
  username: string;
  full_name: string;
  platform_role: "user" | "admin";
};

type EditableAccount = {
  membership: Membership;
  restaurant: Restaurant;
  profile: Profile;
};

export default async function EditAccountsPage({
  searchParams,
}: EditAccountsPageProps) {
  await requireAdmin();

  const { error, message } =
    await searchParams;

  const supabase = createAdminClient();

  const [
    membershipsResult,
    restaurantsResult,
  ] = await Promise.all([
    supabase
      .from("restaurant_members")
      .select(
        "id, restaurant_id, user_id, role",
      )
      .order("created_at"),

    supabase
      .from("restaurants")
      .select("id, name, category")
      .order("name"),
  ]);

  if (membershipsResult.error) {
    throw new Error(
      "No fue posible cargar las cuentas asignadas.",
    );
  }

  if (restaurantsResult.error) {
    throw new Error(
      "No fue posible cargar los restaurantes.",
    );
  }

  const memberships =
    (membershipsResult.data ??
      []) as Membership[];

  const restaurants =
    (restaurantsResult.data ??
      []) as Restaurant[];

  const userIds = Array.from(
    new Set(
      memberships.map(
        (membership) =>
          membership.user_id,
      ),
    ),
  );

  let profiles: Profile[] = [];

  if (userIds.length > 0) {
    const profilesResult =
      await supabase
        .from("profiles")
        .select(
          "id, username, full_name, platform_role",
        )
        .in("id", userIds);

    if (profilesResult.error) {
      throw new Error(
        "No fue posible cargar los perfiles.",
      );
    }

    profiles =
      (profilesResult.data ??
        []) as Profile[];
  }

  const restaurantsById =
    new Map(
      restaurants.map(
        (restaurant) => [
          restaurant.id,
          restaurant,
        ],
      ),
    );

  const profilesById =
    new Map(
      profiles.map(
        (profile) => [
          profile.id,
          profile,
        ],
      ),
    );

  const accounts: EditableAccount[] =
    memberships.flatMap(
      (membership) => {
        const restaurant =
          restaurantsById.get(
            membership.restaurant_id,
          );

        const profile =
          profilesById.get(
            membership.user_id,
          );

        if (
          !restaurant ||
          !profile ||
          profile.platform_role ===
            "admin"
        ) {
          return [];
        }

        return [
          {
            membership,
            restaurant,
            profile,
          },
        ];
      },
    );

  return (
    <div>
      <Link
        href="/admin/cuentas"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-blue-700"
      >
        <ArrowLeft
          aria-hidden
          className="size-4"
        />

        Volver a cuentas
      </Link>

      <div className="mt-6">
        <p className="text-sm font-bold text-blue-600">
          Administración
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Editar cuentas
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Modifica el nombre y el usuario de
          acceso de cada restaurante. Al guardar,
          también se actualizará su correo interno
          de autenticación.
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

      <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            aria-hidden
            className="mt-0.5 size-5 shrink-0 text-blue-600"
          />

          <div>
            <h2 className="font-black text-blue-950">
              Nombre de usuario y correo interno
            </h2>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Al cambiar un usuario, por ejemplo
              de casa-vieja a all-wings, su correo
              interno cambiará automáticamente a
              all-wings@accounts.cordoba.online.
            </p>
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Store
            aria-hidden
            className="mx-auto size-10 text-slate-400"
          />

          <h2 className="mt-4 font-black text-slate-950">
            No existen cuentas para editar
          </h2>
        </div>
      ) : (
        <section className="mt-8 grid gap-5 xl:grid-cols-2">
          {accounts.map((account) => (
            <article
              key={account.membership.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <PencilLine
                    aria-hidden
                    className="size-5"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="font-black text-slate-950">
                    {
                      account.restaurant
                        .name
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      account.restaurant
                        .category
                    }
                  </p>
                </div>
              </div>

              <form
                action={
                  updateRestaurantAccount
                }
                className="mt-6 space-y-4"
              >
                <input
                  type="hidden"
                  name="userId"
                  value={
                    account.membership
                      .user_id
                  }
                />

                <div>
                  <label
                    htmlFor={`fullName-${account.membership.id}`}
                    className="text-sm font-bold text-slate-950"
                  >
                    Nombre de la cuenta
                  </label>

                  <Input
                    id={`fullName-${account.membership.id}`}
                    name="fullName"
                    type="text"
                    required
                    minLength={2}
                    defaultValue={
                      account.profile
                        .full_name
                    }
                    autoComplete="off"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`username-${account.membership.id}`}
                    className="text-sm font-bold text-slate-950"
                  >
                    Nombre de usuario
                  </label>

                  <Input
                    id={`username-${account.membership.id}`}
                    name="username"
                    type="text"
                    required
                    minLength={3}
                    maxLength={40}
                    pattern="[a-z0-9][a-z0-9._-]{2,39}"
                    defaultValue={
                      account.profile
                        .username
                    }
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="mt-2 h-11 rounded-xl"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Correo interno actual:{" "}
                    <span className="font-semibold text-slate-700">
                      {
                        account.profile
                          .username
                      }
                      @accounts.cordoba.online
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-bold text-slate-500">
                    Restaurante asignado:
                  </span>{" "}
                  <span className="font-semibold text-slate-950">
                    {
                      account.restaurant
                        .name
                    }
                  </span>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl font-bold"
                >
                  <Save
                    aria-hidden
                    className="size-4"
                  />

                  Guardar cambios
                </Button>
              </form>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}