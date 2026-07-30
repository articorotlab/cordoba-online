"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  EyeOff,
  ImageIcon,
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
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import {
  createPromotion,
  deletePromotion,
  togglePromotionActive,
  updatePromotion,
} from "@/app/panel/restaurante/promociones/actions";

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

const promotionDays: {
  value: DatabaseWeekDay;
  label: string;
}[] = [
  {
    value: "lunes",
    label: "Lunes",
  },
  {
    value: "martes",
    label: "Martes",
  },
  {
    value: "miércoles",
    label: "Miércoles",
  },
  {
    value: "jueves",
    label: "Jueves",
  },
  {
    value: "viernes",
    label: "Viernes",
  },
  {
    value: "sábado",
    label: "Sábado",
  },
  {
    value: "domingo",
    label: "Domingo",
  }
];

const inputClassName =
  "min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

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

function PromotionImageInput({
  id,
}: {
  id: string;
}) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={id}
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          setSelectedFile(
            event.target.files?.[0] ??
              null,
          );
        }}
        className="sr-only"
      />

      <label
        htmlFor={id}
        className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
      >
        <ImageIcon className="size-5" />

        {selectedFile
          ? "Cambiar imagen seleccionada"
          : "Seleccionar imagen"}
      </label>

      {selectedFile && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-orange-900">
              {selectedFile.name}
            </p>

            <p className="mt-0.5 text-[11px] text-orange-700">
              {(
                selectedFile.size /
                1024 /
                1024
              ).toFixed(2)}{" "}
              MB
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);

              if (inputRef.current) {
                inputRef.current.value =
                  "";
              }
            }}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}

function PromotionDaysSelector({
  idPrefix,
  selectedDays = [],
}: {
  idPrefix: string;
  selectedDays?: DatabaseWeekDay[];
}) {
  const [
    checkedDays,
    setCheckedDays,
  ] = useState<DatabaseWeekDay[]>(
    selectedDays,
  );

  function handleDayChange(
    day: DatabaseWeekDay,
    checked: boolean,
  ) {
    if (checked) {
      if (checkedDays.length >= 6) {
        return;
      }

      setCheckedDays([
        ...checkedDays,
        day,
      ]);

      return;
    }

    setCheckedDays(
      checkedDays.filter(
        (selectedDay) =>
          selectedDay !== day,
      ),
    );
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-neutral-800">
        Días válidos
      </legend>

      <p className="text-xs leading-5 text-neutral-500">
        Selecciona entre uno y seis días. Una promoción no puede estar disponible toda la semana.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {promotionDays.map((day) => {
          const id =
            `${idPrefix}-${day.value}`;

          const checked =
            checkedDays.includes(
              day.value,
            );

          const disabled =
            !checked &&
            checkedDays.length >= 6;

          return (
            <label
              key={day.value}
              htmlFor={id}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition",
                disabled
                  ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                  : "cursor-pointer border-neutral-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50",
              ].join(" ")}
            >
              <input
                id={id}
                name="days"
                type="checkbox"
                value={day.value}
                checked={checked}
                disabled={disabled}
                onChange={(event) => {
                  handleDayChange(
                    day.value,
                    event.target.checked,
                  );
                }}
                className="size-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-400 disabled:cursor-not-allowed"
              />

              {day.label}
            </label>
          );
        })}
      </div>

      <p className="text-xs font-medium text-neutral-500">
        {checkedDays.length}/6 días seleccionados
      </p>
    </fieldset>
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
            <form
              action={updatePromotion}
              className="space-y-4"
            >
              <input
                type="hidden"
                name="promotionId"
                value={promotion.id}
              />

              <div className="space-y-2">
                <label
                  htmlFor={`title-${promotion.id}`}
                  className="text-sm font-semibold text-neutral-800"
                >
                  Título
                </label>

                <input
                  id={`title-${promotion.id}`}
                  name="title"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  defaultValue={
                    promotion.title
                  }
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`price-${promotion.id}`}
                  className="text-sm font-semibold text-neutral-800"
                >
                  Precio promocional
                </label>

                <input
                  id={`price-${promotion.id}`}
                  name="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="999999"
                  step="0.01"
                  defaultValue={
                    promotion.price ?? ""
                  }
                  placeholder="Opcional"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`description-${promotion.id}`}
                  className="text-sm font-semibold text-neutral-800"
                >
                  Descripción
                </label>

                <textarea
                  id={`description-${promotion.id}`}
                  name="description"
                  rows={4}
                  maxLength={500}
                  defaultValue={
                    promotion.description
                  }
                  className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <PromotionDaysSelector
                idPrefix={`days-${promotion.id}`}
                selectedDays={
                  promotion.days
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor={`start-time-${promotion.id}`}
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Hora de inicio
                  </label>

                  <input
                    id={`start-time-${promotion.id}`}
                    name="startTime"
                    type="time"
                    defaultValue={
                      promotion.startTime
                    }
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor={`end-time-${promotion.id}`}
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Hora de fin
                  </label>

                  <input
                    id={`end-time-${promotion.id}`}
                    name="endTime"
                    type="time"
                    defaultValue={
                      promotion.endTime
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor={`valid-from-${promotion.id}`}
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Vigente desde
                  </label>

                  <input
                    id={`valid-from-${promotion.id}`}
                    name="validFrom"
                    type="date"
                    defaultValue={
                      promotion.validFrom
                    }
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor={`valid-until-${promotion.id}`}
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Vigente hasta
                  </label>

                  <input
                    id={`valid-until-${promotion.id}`}
                    name="validUntil"
                    type="date"
                    defaultValue={
                      promotion.validUntil
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <PromotionImageInput
                id={`image-${promotion.id}`}
              />

              <SubmitButton
                label="Guardar cambios"
                pendingLabel="Guardando..."
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>

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
            <form
              action={createPromotion}
              className="mt-6 grid gap-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 lg:grid-cols-2"
            >
              <div className="space-y-2">
                <label
                  htmlFor="new-promotion-title"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Título
                </label>

                <input
                  id="new-promotion-title"
                  name="title"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Ej. Martes de alitas"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="new-promotion-price"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Precio promocional
                </label>

                <input
                  id="new-promotion-price"
                  name="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="999999"
                  step="0.01"
                  placeholder="Opcional"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label
                  htmlFor="new-promotion-description"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Descripción
                </label>

                <textarea
                  id="new-promotion-description"
                  name="description"
                  rows={4}
                  maxLength={500}
                  placeholder="Describe brevemente la promoción."
                  className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="lg:col-span-2">
                <PromotionDaysSelector
                  idPrefix="new-promotion-day"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="new-promotion-start-time"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Hora de inicio
                </label>

                <input
                  id="new-promotion-start-time"
                  name="startTime"
                  type="time"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="new-promotion-end-time"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Hora de fin
                </label>

                <input
                  id="new-promotion-end-time"
                  name="endTime"
                  type="time"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="new-promotion-valid-from"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Vigente desde
                </label>

                <input
                  id="new-promotion-valid-from"
                  name="validFrom"
                  type="date"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="new-promotion-valid-until"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Vigente hasta
                </label>

                <input
                  id="new-promotion-valid-until"
                  name="validUntil"
                  type="date"
                  className={inputClassName}
                />
              </div>

              <div className="lg:col-span-2">
                <PromotionImageInput id="new-promotion-image" />

                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  JPG, PNG o WebP. Máximo 5 MB. Recomendado: 1200 × 900 px.
                </p>
              </div>

              <div className="lg:col-span-2">
                <SubmitButton
                  label="Crear promoción"
                  pendingLabel="Creando promoción..."
                  icon={Plus}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                />
              </div>
            </form>
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
