import Link from "next/link";

import type { ReactNode } from "react";

type HomeQuickActionProps = {
  icon: ReactNode;
  href?: string;
  count?: number;
  singular?: string;
  plural?: string;
  suffix?: string;
  label?: string;
  variant?: "orange" | "dark";
  disabled?: boolean;
  title?: string;
};

function buildActionLabel({
  count,
  singular,
  plural,
  suffix,
  label,
}: Pick<
  HomeQuickActionProps,
  | "count"
  | "singular"
  | "plural"
  | "suffix"
  | "label"
>): string {
  if (typeof count !== "number") {
    return label ?? "";
  }

  const quantityLabel =
    count === 1
      ? singular ?? ""
      : plural ?? singular ?? "";

  return [
    count,
    quantityLabel,
    suffix,
  ]
    .filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== "",
    )
    .join(" ");
}

export function HomeQuickAction({
  icon,
  href,
  count,
  singular,
  plural,
  suffix,
  label,
  variant = "orange",
  disabled = false,
  title,
}: HomeQuickActionProps) {
  const actionLabel = buildActionLabel({
    count,
    singular,
    plural,
    suffix,
    label,
  });

  const baseClassName =
    "group inline-flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-center text-xs font-bold leading-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-5 sm:text-sm sm:leading-5";

  const variantClassName =
    variant === "orange"
      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 focus-visible:ring-orange-500"
      : "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-xl focus-visible:ring-slate-950";

  const iconElement = (
    <span className="flex shrink-0 items-center justify-center [&_svg]:size-5">
      {icon}
    </span>
  );

  const content = (
    <>
      {iconElement}

      <span className="min-w-0">
        {actionLabel}
      </span>
    </>
  );

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={title}
        className={`${baseClassName} ${variantClassName} cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-lg`}
      >
        {content}
      </button>
    );
  }

  if (!href) {
    throw new Error(
      "HomeQuickAction necesita una propiedad href cuando no está deshabilitado.",
    );
  }

  return (
    <Link
      href={href}
      title={title}
      className={`${baseClassName} ${variantClassName}`}
    >
      {content}
    </Link>
  );
}