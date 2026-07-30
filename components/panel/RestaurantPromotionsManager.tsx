"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  EyeOff,
  LoaderCircle,
  Megaphone,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import {
  deletePromotion,
  togglePromotionActive,
} from "@/app/panel/restaurante/promociones/actions";

import {
  CreatePromotionForm,
} from "@/components/panel/CreatePromotionForm";
import {
  EditPromotionForm,
} from "@/components/panel/EditPromotionForm";

import type { DatabaseWeekDay } from "@/types/database-restaurants";

type RestaurantPromotion = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  startTime: string;
  endTime: string;
  validFrom: string;
  validUntil: string;
  active: boolean;
  days: DatabaseWeekDay[];
};

type RestaurantPromotionsManagerProps = {
  promotions: RestaurantPromotion[];
  message?: string;
  error?: string;
};

type FeedbackMessageProps = {
  type: "success" | "error";
  text: string;
};

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  icon?: typeof Save;
  className?: string;
};



function FeedbackMessage({
  type,
  text,
}: FeedbackMessageProps) {
  const [visible, setVisible] =
    useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        setVisible(false);
      },
      3500,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  if (!visible) {
    return null;
  }

  const isSuccess =
    type === "success";

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800",
      ].join(" ")}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
      ) : (
        <TriangleAlert className="mt-0.5 size-5 shrink-0" />
      )}

      <p className="leading-6">
        {text}
      </p>
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  icon: Icon = Save,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          <Icon className="size-4" />
          {label}
        </>
      )}
    </button>
  );
}


function formatPrice(
  price: number | null,
): string {
  if (price === null) {
    return "Sin precio";
  }

  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits:
        Number.isInteger(price)
          ? 0
          : 2,
      maximumFractionDigits: 2,
    },
  ).format(price);
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function PromotionCard({
  promotion,
}: {
  promotion: RestaurantPromotion;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-white">
        {promotion.imageUrl ? (
          <Image
            src={promotion.imageUrl}
            alt={promotion.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
              <Megaphone className="size-7" />
            </div>

            <p className="mt-4 text-sm font-semibold text-neutral-600">
              Sin fotografía
            </p>
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
              promotion.active
                ? "bg-emerald-500 text-white"
                : "bg-neutral-900/85 text-white",
            ].join(" ")}
          >
            {promotion.active ? (
              <Eye className="size-3" />
            ) : (
              <EyeOff className="size-3" />
            )}

            {promotion.active
              ? "Visible"
              : "Oculta"}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold text-neutral-950">
              {promotion.title}
            </h2>

            <p className="shrink-0 text-base font-bold text-orange-600">
              {formatPrice(
                promotion.price,
              )}
            </p>
          </div>

          {promotion.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
              {promotion.description}
            </p>
          )}
        </div>

        <div className="space-y-2 rounded-2xl bg-neutral-50 p-4 text-xs text-neutral-600">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-orange-500" />

            <p className="leading-5">
              {promotion.days
                .map((day) => {
                  return (
                    day.charAt(0).toUpperCase() +
                    day.slice(1)
                  );
                })
                .join(", ")}
            </p>
          </div>

          {promotion.startTime &&
            promotion.endTime && (
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 shrink-0 text-orange-500" />

                <p>
                  {promotion.startTime} –{" "}
                  {promotion.endTime}
                </p>
              </div>
            )}

          {(promotion.validFrom ||
            promotion.validUntil) && (
            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-orange-500" />

              <p className="leading-5">
                {promotion.validFrom &&
                promotion.validUntil
                  ? `${formatDate(
                      promotion.validFrom,
                    )} – ${formatDate(
                      promotion.validUntil,
                    )}`
                  : promotion.validFrom
                    ? `Desde ${formatDate(
                        promotion.validFrom,
                      )}`
                    : `Hasta ${formatDate(
                        promotion.validUntil,
                      )}`}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <form
            action={
              togglePromotionActive
            }
          >
            <input
              type="hidden"
              name="promotionId"
              value={promotion.id}
            />

            <SubmitButton
              label={
                promotion.active
                  ? "Ocultar promoción"
                  : "Mostrar promoción"
              }
              pendingLabel="Guardando..."
              icon={
                promotion.active
                  ? EyeOff
                  : Eye
              }
              className={[
                "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                promotion.active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
              ].join(" ")}
            />
          </form>

          <button
            type="button"
            onClick={() => {
              setEditing(
                (current) => !current,
              );
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            {editing ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}

            {editing
              ? "Cerrar edición"
              : "Editar"}
          </button>
        </div>

        {editing && (
          <div className="border-t border-neutral-100 pt-5">

            <EditPromotionForm
                promotion={promotion}
            />

            <form
              action={deletePromotion}
              onSubmit={(event) => {
                const confirmed =
                  window.confirm(
                    `¿Seguro que deseas eliminar "${promotion.title}"?`,
                  );

                if (!confirmed) {
                  event.preventDefault();
                }
              }}
              className="mt-3"
            >
              <input
                type="hidden"
                name="promotionId"
                value={promotion.id}
              />

              <SubmitButton
                label="Eliminar promoción"
                pendingLabel="Eliminando..."
                icon={Trash2}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

export function RestaurantPromotionsManager({
  promotions,
  message,
  error,
}: RestaurantPromotionsManagerProps) {
  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(
    promotions.length === 0,
  );

  const activeCount =
    promotions.filter(
      (promotion) =>
        promotion.active,
    ).length;

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div className="space-y-3">
          {message && (
            <FeedbackMessage
              type="success"
              text={message}
            />
          )}

          {error && (
            <FeedbackMessage
              type="error"
              text={error}
            />
          )}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-neutral-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <Megaphone className="size-6" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Promociones publicadas
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Activa u oculta cada promoción según lo necesites.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
              Visibles
            </p>

            <p className="mt-1 text-lg font-bold text-neutral-950">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(
                (current) => !current,
              );
            }}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-neutral-950/15 transition hover:bg-neutral-800 sm:w-auto"
          >
            {showCreateForm ? (
              <ChevronUp className="size-5" />
            ) : (
              <Plus className="size-5" />
            )}

            {showCreateForm
              ? "Cerrar formulario"
              : "Agregar promoción"}
          </button>

          {showCreateForm && (
            <CreatePromotionForm />
        )}
        </div>
      </section>

      {promotions.length > 0 ? (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-neutral-950">
              Todas las promociones
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {promotions.length === 1
                ? "1 promoción registrada"
                : `${promotions.length} promociones registradas`}
            </p>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
            {promotions.map(
              (promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                />
              ),
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
            <Megaphone className="size-8" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-neutral-950">
            Aún no tienes promociones
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Agrega tu primera promoción para comenzar a atraer clientes.
          </p>
        </section>
      )}
    </div>
  );
}
