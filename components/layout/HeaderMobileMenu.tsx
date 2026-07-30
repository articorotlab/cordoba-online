"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogIn,
  LogOut,
  Menu,
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

type PublicNavigationItem = {
  label: string;
  href: string;
  available: boolean;
};

type HeaderMobileMenuProps = {
  isAuthenticated: boolean;
  isRestaurant: boolean;
  restaurantName: string | null;
  publicProfileHref: string;
  navigation: PublicNavigationItem[];
};

export function HeaderMobileMenu({
  isAuthenticated,
  isRestaurant,
  restaurantName,
  publicProfileHref,
  navigation,
}: HeaderMobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  function isActive(
    href: string,
    exact = false,
  ): boolean {
    if (exact) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
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
          {isRestaurant && restaurantName ? (
            <>
              <RestaurantMobileNavigation
                restaurantName={restaurantName}
                publicProfileHref={publicProfileHref}
                onNavigate={closeMenu}
              />

              <div className="mt-6 border-t border-slate-200 pt-5">
                <form
                  action={logout}
                  onSubmit={closeMenu}
                >
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
                <Link
                  href="/"
                  onClick={closeMenu}
                  aria-current={
                    pathname === "/"
                      ? "page"
                      : undefined
                  }
                  className={[
                    "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all",
                    pathname === "/"
                      ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      pathname === "/"
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-500",
                    ].join(" ")}
                  >
                    <Home className="size-[18px]" />
                  </span>

                  Inicio
                </Link>

                {navigation.map((item) => {
                  const active = isActive(
                    item.href,
                  );

                  if (!item.available) {
                    return (
                      <div
                        key={item.label}
                        className="flex min-h-14 items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3.5"
                      >
                        <span className="font-semibold text-slate-600">
                          {item.label}
                        </span>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 shadow-sm">
                          Próximamente
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                      className={[
                        "flex min-h-14 items-center rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all",
                        active
                          ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/15"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                {isAuthenticated ? (
                  <form
                    action={logout}
                    onSubmit={closeMenu}
                  >
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
                    onClick={closeMenu}
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
  );
}