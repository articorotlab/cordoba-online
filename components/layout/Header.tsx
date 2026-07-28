import Link from "next/link";
import {
  LogIn,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";

import { logout } from "@/app/auth/actions";
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

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);

  const userName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  const visibleNavigation = navigation.filter(
    (item) => item.visible,
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl">
      <PageContainer>
        <div className="flex h-[72px] items-center justify-between gap-6">
          <Link
            href="/"
            className="shrink-0 text-xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-2xl"
          >
            cordoba
            <span className="text-blue-600">
              .online
            </span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-1 lg:flex"
          >
            {visibleNavigation.map((item) =>
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

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="hidden items-center gap-3 lg:flex">
                {userName && (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <UserRound
                      aria-hidden="true"
                      className="size-4"
                    />

                    {userName}
                  </span>
                )}

                <form action={logout}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-10 rounded-xl border-red-200 px-4 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut
                      aria-hidden="true"
                      className="size-4"
                    />

                    Cerrar sesión
                  </Button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 lg:inline-flex"
              >
                <LogIn
                  aria-hidden="true"
                  className="size-4"
                />

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
                <Menu
                  aria-hidden="true"
                  className="size-5"
                />
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
                    Descubre todo lo que Córdoba tiene para ti.
                  </SheetDescription>
                </SheetHeader>

                <nav
                  aria-label="Navegación móvil"
                  className="flex flex-col gap-2 px-4"
                >
                  {visibleNavigation.map((item) =>
                    item.available ? (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="rounded-2xl border border-slate-200 px-4 py-4 text-base font-semibold text-slate-950 transition-colors hover:border-orange-200 hover:bg-orange-50"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-4"
                      >
                        <span className="font-semibold text-slate-600">
                          {item.label}
                        </span>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 shadow-sm">
                          Próximamente
                        </span>
                      </div>
                    ),
                  )}

                  <div className="mt-3 border-t border-slate-200 pt-5">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="rounded-2xl bg-slate-50 px-4 py-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Sesión iniciada
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                            {userName ?? user?.email}
                          </p>
                        </div>

                        <form action={logout}>
                          <Button
                            type="submit"
                            variant="outline"
                            className="h-12 w-full rounded-2xl border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          >
                            <LogOut
                              aria-hidden="true"
                              className="size-4"
                            />

                            Cerrar sesión
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                      >
                        <LogIn
                          aria-hidden="true"
                          className="size-4"
                        />

                        Acceder
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}