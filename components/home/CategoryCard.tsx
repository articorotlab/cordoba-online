import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

import type {
  CategoryTheme,
  HomeCategory,
} from "@/types/category";

type CategoryCardProps = {
  category: HomeCategory;
};

const themeStyles: Record<
  CategoryTheme,
  {
    card: string;
    glow: string;
    icon: string;
    action: string;
  }
> = {
  orange: {
    card:
      "border-orange-300/30 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 shadow-orange-500/20",
    glow: "bg-orange-200/40",
    icon: "text-orange-600",
    action: "text-orange-50",
  },
  blue: {
    card:
      "border-blue-300/30 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 shadow-blue-500/20",
    glow: "bg-blue-200/40",
    icon: "text-blue-600",
    action: "text-blue-50",
  },
  green: {
    card:
      "border-emerald-300/30 bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 shadow-emerald-500/20",
    glow: "bg-emerald-200/40",
    icon: "text-emerald-600",
    action: "text-emerald-50",
  },
  purple: {
    card:
      "border-violet-300/30 bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-900 shadow-violet-500/20",
    glow: "bg-violet-200/40",
    icon: "text-violet-600",
    action: "text-violet-50",
  },
  amber: {
    card:
      "border-amber-300/30 bg-gradient-to-br from-amber-300 via-amber-500 to-orange-700 shadow-amber-500/20",
    glow: "bg-amber-100/40",
    icon: "text-amber-600",
    action: "text-amber-50",
  },
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;
  const styles = themeStyles[category.theme];

  const content = (
    <article
      className={[
        "group relative isolate flex min-h-[320px] h-full overflow-hidden rounded-[2rem]",
        "border p-7 text-white shadow-xl",
        "transition-all duration-300 ease-out",
        styles.card,
        category.available
          ? "cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          : "cursor-default",
      ].join(" ")}
    >
      {/* Luz decorativa superior */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute -right-12 -top-16 size-48 rounded-full blur-3xl",
          styles.glow,
        ].join(" ")}
      />

      {/* Luz oscura inferior para mejorar el contraste */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent"
      />

      {/* Brillo interior muy discreto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/20"
      />

      <div className="relative z-10 flex w-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/90 shadow-lg shadow-slate-950/10 backdrop-blur">
            <Icon
              aria-hidden="true"
              className={`size-7 ${styles.icon}`}
            />
          </div>

          {!category.available && (
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
              <LockKeyhole aria-hidden="true" className="size-3.5" />
              Próximamente
            </div>
          )}
        </div>

        <div className="mt-auto pt-16">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            {category.title}
          </h3>

          <p className="mt-3 max-w-[30ch] text-sm leading-6 text-white/85">
            {category.description}
          </p>

          <div className="mt-7">
            <span
              className={[
                "inline-flex items-center gap-2 text-sm font-bold",
                styles.action,
              ].join(" ")}
            >
              {category.available ? "Explorar" : "Disponible próximamente"}

              {category.available ? (
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1.5"
                />
              ) : (
                <LockKeyhole
                  aria-hidden="true"
                  className="size-4 opacity-80"
                />
              )}
            </span>
          </div>
        </div>
      </div>
    </article>
  );

  if (!category.available) {
    return content;
  }

  return (
    <Link
      href={category.href}
      aria-label={`Explorar la categoría ${category.title}`}
      className="block h-full rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
    >
      {content}
    </Link>
  );
}