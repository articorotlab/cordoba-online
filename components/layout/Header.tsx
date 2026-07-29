import Link from "next/link";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Store,
  UserRound,
} from "lucide-react";

import { logout } from "@/app/auth/actions";
import { RestaurantMobileNavigation } from "@/components/layout/RestaurantMobileNavigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/server";

import { PageContainer } from "./PageContainer";

const navigation = [
  {
    label: "Comer",
    href: "/comer",
    available: true,
    visible: true,
  },
  {
    label: "Comprar",
    href: "/comprar",
    available: false,
    visible: true,
  },
  {
    label: "Servicios",
    href: "/servicios",
    available: false,
    visible: false,
  },
  {
    label: "Profesionistas",
    href: "/profesionistas",
    available: false,
    visible: false,
  },
  {
    label: "Qué hacer hoy",
    href: "/que-hacer-hoy",
    available: false,
    visible: false,
  },
];

type RestaurantMembership = {
  restaurant_id: string;
};

type RestaurantHeaderData = {
  name: string;
  slug: string;
};

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);

  let restaurantMembership:
    | RestaurantMembership
    | null = null;

  let restaurant:
    | RestaurantHeaderData
    | null = null;

  if (user) {
    const { data: membershipData } =
      await supabase
        .from("restaurant_members")
        .select("restaurant_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

    restaurantMembership =
      membershipData as
        | RestaurantMembership
        | null;

    if (restaurantMembership) {
      const {
        data: restaurantData,
        error: restaurantError,
      } = await supabase
        .from("restaurants")
        .select("name, slug")
        .eq(
          "id",
          restaurantMembership.restaurant_id,
        )
        .maybeSingle();

      if (restaurantError) {
        console.error(
          "Error al cargar el restaurante en el encabezado:",
          restaurantError,
        );
      }

      restaurant =
        restaurantData as
          | RestaurantHeaderData
          | null;
    }
  }

  const isRestaurant = Boolean(
    restaurantMembership && restaurant,
  );

  const userName =
    typeof user?.user_metadata?.full_name ===
    "string"
      ? user.user_metadata.full_name
      : null;

  const visibleNavigation =
    navigation.filter(
      (item) => item.visible,
    );

  const publicProfileHref = restaurant
    ? `/comer/${restaurant.slug}`
    : "/comer";

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-slate-200/70 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl">
      <PageContainer className="h-full">
        <div className="flex h-full items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="shrink-0 text-xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-2xl"
            >
              cordoba
              <span className="text-blue-600">
                .online
              </span>
            </Link>

            {isRestaurant && (
              <Link
                href="/panel/restaurante"
                className="hidden items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100 sm:inline-flex"
              >
                <Store className="size-3.5" />

                Restaurante
              </Link>
            )}
          </div>

          {!isRestaurant && (
            <nav
              aria-label="Navegación principal"
              className="hidden items-center gap-1 lg:flex"
            >
              {visibleNavigation.map(
                (item) =>
                  item.available ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <div
                      key={item.label}
                      className="flex cursor-default items-center gap-2 rounded-xl px-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-400">
                        {item.label}
                      </span>

                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                        Próximamente
                      </span>
                    </div>
                  ),
              )}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="hidden items-center gap-2 lg:flex">
                {isRestaurant && (
                  <Link
                    href="/panel/restaurante"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <LayoutDashboard className="size-4" />

                    Administración
                  </Link>
                )}

                {!isRestaurant &&
                  userName && (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <UserRound className="size-4" />

                      {userName}
                    </span>
                  )}

                <form action={logout}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-10 rounded-xl border-red-200 px-4 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="size-4" />

                    Cerrar sesión
                  </Button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 lg:inline-flex"
              >
                <LogIn className="size-4" />

                Acceder
              </Link>
            )}

            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl lg:hidden"
                    aria-label="Abrir menú"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[88%] max-w-sm"
              >
                <SheetHeader>
                  <SheetTitle>
                    cordoba
                    <span className="text-blue-600">
                      .online
                    </span>
                  </SheetTitle>

                  <SheetDescription>
                    {isRestaurant
                      ? "Administra el contenido de tu restaurante."
                      : "Descubre todo lo que Córdoba tiene para ti."}
                  </SheetDescription>
                </SheetHeader>

                <nav
                  aria-label="Navegación móvil"
                  className="flex flex-col px-4"
                >
                  {isRestaurant &&
                  restaurant ? (
                    <>
                      <RestaurantMobileNavigation
                        restaurantName={
                          restaurant.name
                        }
                        publicProfileHref={
                          publicProfileHref
                        }
                      />

                      <div className="mt-6 border-t border-slate-200 pt-5">
                        <form action={logout}>
                          <Button
                            type="submit"
                            variant="outline"
                            className="h-12 w-full rounded-2xl border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          >
                            <LogOut className="size-4" />

                            Cerrar sesión
                          </Button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        {visibleNavigation.map(
                          (item) =>
                            item.available ? (
                              <Link
                                key={
                                  item.label
                                }
                                href={
                                  item.href
                                }
                                className="rounded-2xl border border-slate-200 px-4 py-4 text-base font-semibold text-slate-950 transition-colors hover:border-orange-200 hover:bg-orange-50"
                              >
                                {
                                  item.label
                                }
                              </Link>
                            ) : (
                              <div
                                key={
                                  item.label
                                }
                                className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-4"
                              >
                                <span className="font-semibold text-slate-600">
                                  {
                                    item.label
                                  }
                                </span>

                                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 shadow-sm">
                                  Próximamente
                                </span>
                              </div>
                            ),
                        )}
                      </div>

                      <div className="mt-6 border-t border-slate-200 pt-5">
                        {isAuthenticated ? (
                          <form action={logout}>
                            <Button
                              type="submit"
                              variant="outline"
                              className="h-12 w-full rounded-2xl border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              <LogOut className="size-4" />

                              Cerrar sesión
                            </Button>
                          </form>
                        ) : (
                          <Link
                            href="/login"
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                          >
                            <LogIn className="size-4" />

                            Acceder
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}