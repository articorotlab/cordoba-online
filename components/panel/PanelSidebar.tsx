"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Megaphone,
  Settings2,
  UtensilsCrossed,
} from "lucide-react";

type PanelSidebarProps = {
  restaurantName: string;
  username: string;
  publicProfileHref: string;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Settings2;
  exact?: boolean;
};

const navigation: NavigationItem[] = [
  {
    label: "Administración",
    href: "/panel/restaurante",
    icon: Settings2,
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

export function PanelSidebar({
  restaurantName,
  username,
  publicProfileHref,
}: PanelSidebarProps) {
  const pathname = usePathname();

  function isActive(
    href: string,
    exact = false,
  ): boolean {
    if (exact) {
      return (
        pathname === "/panel" ||
        pathname === href
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/80 via-white to-orange-50/60 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <UtensilsCrossed
                aria-hidden="true"
                className="size-5"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate font-bold text-slate-950">
                {restaurantName}
              </p>

              <p className="mt-0.5 truncate text-sm text-slate-500">
                @{username}
              </p>
            </div>
          </div>
        </div>

        <nav
          aria-label="Navegación del restaurante"
          className="space-y-1.5 p-3"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            const active = isActive(
              item.href,
              item.exact,
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={[
                  "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all",
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                <Icon
                  aria-hidden="true"
                  className="size-[18px]"
                />

                {item.label}
              </Link>
            );
          })}

          <div className="my-3 border-t border-slate-100" />

          <Link
            href={publicProfileHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-3.5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <ExternalLink
              aria-hidden="true"
              className="size-[18px]"
            />

            Ver perfil público
          </Link>
        </nav>
      </div>
    </aside>
  );
}
