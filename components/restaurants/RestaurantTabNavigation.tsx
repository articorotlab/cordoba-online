"use client";

import type { KeyboardEvent } from "react";
import {
  Gift,
  Info,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export type RestaurantTab =
  | "products"
  | "promotions"
  | "information";

type RestaurantTabNavigationProps = {
  activeTab: RestaurantTab;
  onTabChange: (tab: RestaurantTab) => void;
};

type TabItem = {
  id: RestaurantTab;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
};

const tabs: TabItem[] = [
  {
    id: "products",
    label: "Platillos",
    mobileLabel: "Platillos",
    icon: Utensils,
  },
  {
    id: "promotions",
    label: "Promociones",
    mobileLabel: "Promos",
    icon: Gift,
  },
  {
    id: "information",
    label: "Información",
    mobileLabel: "Info",
    icon: Info,
  },
];

export function RestaurantTabNavigation({
  activeTab,
  onTabChange,
}: RestaurantTabNavigationProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextTab = tabs[nextIndex];

    onTabChange(nextTab.id);

    document
      .getElementById(`restaurant-tab-${nextTab.id}`)
      ?.focus();
  }

  return (
    <nav
      aria-label="Secciones del restaurante"
      className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-1.5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:p-2"
    >
      {/* Decoración de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 size-36 rounded-full bg-blue-100/70 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-0 size-40 rounded-full bg-orange-100/80 blur-3xl"
      />

      <div
        role="tablist"
        aria-label="Contenido del restaurante"
        className="relative flex w-full items-stretch gap-1.5 sm:gap-2"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`restaurant-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`restaurant-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(event) => {
                handleKeyDown(event, index);
              }}
              className={[
                "group relative flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-[1.25rem] px-1.5 py-3 text-center outline-none transition-all duration-300",
                "sm:min-h-16 sm:gap-3 sm:px-4 sm:py-3.5",
                "focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_10px_24px_rgba(249,115,22,0.28)]"
                  : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:size-10",
                  isActive
                    ? "bg-white/20 text-white shadow-inner ring-1 ring-white/20"
                    : tab.id === "products"
                      ? "bg-orange-50 text-orange-600 group-hover:bg-orange-100"
                      : tab.id === "promotions"
                        ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
                ].join(" ")}
              >
                <Icon
                  aria-hidden="true"
                  className="size-4 sm:size-5"
                  strokeWidth={2.2}
                />
              </span>

              <span className="min-w-0 truncate text-[11px] font-bold leading-none sm:text-sm">
                <span className="sm:hidden">
                  {tab.mobileLabel}
                </span>

                <span className="hidden sm:inline">
                  {tab.label}
                </span>
              </span>

              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-5 bottom-1 h-0.5 rounded-full bg-white/80 sm:inset-x-8"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}