"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Home,
  LayoutDashboard,
  Megaphone,
  Store,
  UtensilsCrossed,
} from "lucide-react";

type RestaurantMobileNavigationProps = {
  restaurantName: string;
  publicProfileHref: string;
  onNavigate?: () => void;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const navigation: NavigationItem[] = [
  {
    label: "Inicio",
    href: "/",
    icon: Home,
    exact: true,
  },
  {
    label: "Administración",
    href: "/panel/restaurante",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Platillos",
    href: "/panel/restaurante/platillos",
    icon: UtensilsCrossed,
  },
  {
    label: "Promociones",
    href: "/panel/restaurante/promociones",
    icon: Megaphone,
  },
];

export function RestaurantMobileNavigation({
  restaurantName,
  publicProfileHref,
  onNavigate,
}: RestaurantMobileNavigationProps) {
  const pathname = usePathname();

  function isActive(
    href: string,
    exact = false,
  ): boolean {
    if (exact) {
      if (
        href ===
        "/panel/restaurante"
      ) {
        return (
          pathname === "/panel" ||
          pathname === href
        );
      }

      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const publicProfileActive =
    pathname === publicProfileHref ||
    pathname.startsWith(
      `${publicProfileHref}/`,
    );

  const homeItem = navigation[0];
  const panelItems = navigation.slice(1);
  const HomeIcon = homeItem.icon;
  const homeActive = isActive(
    homeItem.href,
    homeItem.exact,
  );

  return (
    <div className="space-y-3">
      <div className="mb-5 overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <Store
              aria-hidden="true"
              className="size-5"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
              Tu restaurante
            </p>

            <p className="mt-1 truncate text-base font-bold text-slate-950">
              {restaurantName}
            </p>
          </div>
        </div>
      </div>

      <Link
        href={homeItem.href}
        onClick={onNavigate}
        aria-current={
          homeActive ? "page" : undefined
        }
        className={[
          "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all",
          homeActive
            ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/15"
            : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
        ].join(" ")}
      >
        <span
          className={[
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            homeActive
              ? "bg-white/10 text-white"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          <HomeIcon
            aria-hidden="true"
            className="size-[18px]"
          />
        </span>

        {homeItem.label}
      </Link>

      <Link
        href={publicProfileHref}
        onClick={onNavigate}
        aria-current={
          publicProfileActive
            ? "page"
            : undefined
        }
        className={[
          "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all",
          publicProfileActive
            ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100",
        ].join(" ")}
      >
        <span
          className={[
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            publicProfileActive
              ? "bg-white/10 text-white"
              : "bg-blue-100 text-blue-600",
          ].join(" ")}
        >
          <ExternalLink
            aria-hidden="true"
            className="size-[18px]"
          />
        </span>

        Ver perfil público
      </Link>

      <div className="my-4 border-t border-slate-200" />

      {panelItems.map((item) => {
        const Icon = item.icon;

        const active = isActive(
          item.href,
          item.exact,
        );

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={
              active ? "page" : undefined
            }
            className={[
              "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all",
              active
                ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
            ].join(" ")}
          >
            <span
              className={[
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                active
                  ? "bg-white/10 text-white"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              <Icon
                aria-hidden="true"
                className="size-[18px]"
              />
            </span>

            {item.label}
          </Link>
        );
      })}
    </div>
  );
}