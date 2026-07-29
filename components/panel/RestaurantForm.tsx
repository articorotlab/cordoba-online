"use client";

import {
  AtSign,
  Check,
  CheckCircle2,
  ExternalLink,
  Clock3,
  ImageIcon,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  Store,
  TriangleAlert,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import { updateRestaurant } from "@/app/panel/restaurante/actions";
import { RestaurantImageManager } from "@/components/panel/RestaurantImageManager";
import { RestaurantScheduleManager } from "@/components/panel/RestaurantScheduleManager";
import { restaurantCategories } from "@/constants/food-categories";

type RestaurantSection =
  | "general"
  | "contacto"
  | "ubicacion"
  | "horarios"
  | "imagenes";

type RestaurantFormData = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  zone: string;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
};

type RestaurantSchedule = {
  day:
    | "lunes"
    | "martes"
    | "miércoles"
    | "jueves"
    | "viernes"
    | "sábado"
    | "domingo";
  opensAt: string | null;
  closesAt: string | null;
  closed: boolean;
};

type RestaurantFormProps = {
  restaurant: RestaurantFormData;
  schedules: RestaurantSchedule[];
  initialSection: RestaurantSection;
  message?: string;
  error?: string;
};

type FeedbackMessageProps = {
  type: "success" | "error";
  text: string;
};

type SectionStatus = {
  complete: boolean;
  label: string;
};

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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <Save className="size-4" />
          Guardar cambios
        </>
      )}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: SectionStatus;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
        status.complete
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      {status.complete && (
        <Check className="size-3" />
      )}

      {status.label}
    </span>
  );
}

export function RestaurantForm({
  restaurant,
  schedules,
  initialSection,
  message,
  error,
}: RestaurantFormProps) {
  const [
    activeSection,
    setActiveSection,
  ] = useState<RestaurantSection>(
    initialSection,
  );

  const [
    description,
    setDescription,
  ] = useState(
    restaurant.description,
  );

  const generalComplete =
    restaurant.name.trim().length >= 2 &&
    restaurant.category.trim().length > 0 &&
    restaurant.description.trim().length > 0;

  const contactComplete =
    Boolean(
      restaurant.phone ||
        restaurant.whatsapp,
    );

  const locationComplete =
    Boolean(
      restaurant.zone &&
        restaurant.address,
    );

  const schedulesComplete =
    schedules.length === 7;

  const imagesComplete =
    Boolean(
      restaurant.logoUrl &&
        restaurant.coverUrl,
    );

  const sections: Array<{
    id: RestaurantSection;
    label: string;
    description: string;
    icon: typeof Store;
    status: SectionStatus;
  }> = [
    {
      id: "general",
      label: "General",
      description:
        "Nombre, categoría y descripción",
      icon: Store,
      status: {
        complete: generalComplete,
        label: generalComplete
          ? "Completo"
          : "Pendiente",
      },
    },
    {
      id: "contacto",
      label: "Contacto",
      description:
        "Teléfono y redes sociales",
      icon: MessageCircle,
      status: {
        complete: contactComplete,
        label: contactComplete
          ? "Completo"
          : "Pendiente",
      },
    },
    {
      id: "ubicacion",
      label: "Ubicación",
      description:
        "Zona y dirección",
      icon: MapPin,
      status: {
        complete: locationComplete,
        label: locationComplete
          ? "Completo"
          : "Pendiente",
      },
    },
    {
      id: "horarios",
      label: "Horarios",
      description:
        "Apertura y cierre semanal",
      icon: Clock3,
      status: {
        complete: schedulesComplete,
        label: schedulesComplete
          ? "Completo"
          : "Pendiente",
      },
    },
    {
      id: "imagenes",
      label: "Imágenes",
      description:
        "Logo y fotografía de portada",
      icon: ImageIcon,
      status: {
        complete: imagesComplete,
        label: imagesComplete
          ? "Completo"
          : "Pendiente",
      },
    },
  ];

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

      <section className="rounded-3xl border border-neutral-200 bg-white p-2 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {sections.map((section) => {
            const Icon = section.icon;

            const isActive =
              activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSection(
                    section.id,
                  );
                }}
                className={[
                  "flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-4 text-left transition",
                  isActive
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-md"
                    : "border-transparent bg-white text-neutral-700 hover:border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    isActive
                      ? "bg-white/10 text-white"
                      : "bg-neutral-100 text-neutral-600",
                  ].join(" ")}
                >
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">
                      {section.label}
                    </span>

                    {!isActive && (
                      <StatusBadge
                        status={
                          section.status
                        }
                      />
                    )}
                  </div>

                  <p
                    className={[
                      "mt-1 truncate text-xs",
                      isActive
                        ? "text-white/65"
                        : "text-neutral-500",
                    ].join(" ")}
                  >
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <form
        action={updateRestaurant}
        className={
          activeSection === "imagenes" ||
          activeSection === "horarios"
            ? "hidden"
            : "space-y-6"
        }
      >
        <input
          type="hidden"
          name="currentSection"
          value={activeSection}
        />

        <div
          className={
            activeSection === "general"
              ? "block"
              : "hidden"
          }
        >
          <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 bg-gradient-to-r from-orange-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                  <Store className="size-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-neutral-950">
                    Información general
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Presenta tu restaurante
                    de manera clara y
                    atractiva.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Nombre del restaurante
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={
                    restaurant.name
                  }
                  placeholder="Ej. Casa Vieja"
                  className={inputClassName}
                />

                <p className="text-xs leading-5 text-neutral-500">
                  Utiliza el nombre comercial
                  que reconocen tus clientes.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Categoría principal
                </label>

                <select
                  id="category"
                  name="category"
                  required
                  defaultValue={
                    restaurant.category
                  }
                  className={inputClassName}
                >
                  {restaurantCategories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ),
                  )}
                </select>

                <p className="text-xs leading-5 text-neutral-500">
                  Esta categoría ayuda a
                  clasificar tu restaurante.
                </p>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Descripción
                  </label>

                  <span className="text-xs font-medium text-neutral-400">
                    {description.length}/500
                  </span>
                </div>

                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  maxLength={500}
                  value={description}
                  onChange={(event) => {
                    setDescription(
                      event.target.value,
                    );
                  }}
                  placeholder="Describe qué tipo de comida ofreces y qué hace especial a tu restaurante."
                  className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />

                <p className="text-xs leading-5 text-neutral-500">
                  Recomendamos una descripción
                  breve, directa y fácil de
                  leer.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div
          className={
            activeSection === "contacto"
              ? "block"
              : "hidden"
          }
        >
          <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 bg-gradient-to-r from-blue-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <MessageCircle className="size-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-neutral-950">
                    Información de contacto
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Facilita que tus clientes
                    puedan comunicarse contigo.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Teléfono
                </label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    defaultValue={
                      restaurant.phone ?? ""
                    }
                    placeholder="271 123 4567"
                    className={`${inputClassName} pl-11`}
                  />
                </div>

                <p className="text-xs leading-5 text-neutral-500">
                  Número para llamadas del
                  restaurante.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="whatsapp"
                  className="text-sm font-semibold text-neutral-800"
                >
                  WhatsApp
                </label>

                <div className="relative">
                  <MessageCircle className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    inputMode="tel"
                    defaultValue={
                      restaurant.whatsapp ??
                      ""
                    }
                    placeholder="271 123 4567"
                    className={`${inputClassName} pl-11`}
                  />
                </div>

                <p className="text-xs leading-5 text-neutral-500">
                  Número en el que recibes
                  mensajes de clientes.
                </p>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label
                  htmlFor="instagram"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Instagram
                </label>

                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    maxLength={200}
                    defaultValue={
                      restaurant.instagram ??
                      ""
                    }
                    placeholder="@mi_restaurante"
                    className={`${inputClassName} pl-11`}
                  />
                </div>

                <p className="text-xs leading-5 text-neutral-500">
                  Puedes escribir únicamente
                  el usuario o pegar el enlace
                  completo.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div
          className={
            activeSection === "ubicacion"
              ? "block"
              : "hidden"
          }
        >
          <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <MapPin className="size-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-neutral-950">
                    Ubicación
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Ayuda a que las personas
                    puedan encontrar tu
                    restaurante.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="zone"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Zona o colonia
                </label>

                <input
                  id="zone"
                  name="zone"
                  type="text"
                  maxLength={80}
                  defaultValue={
                    restaurant.zone
                  }
                  placeholder="Ej. Centro"
                  className={inputClassName}
                />

                <p className="text-xs leading-5 text-neutral-500">
                  Escribe la zona por la que
                  comúnmente conocen el lugar.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Dirección completa
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  maxLength={180}
                  defaultValue={
                    restaurant.address
                  }
                  placeholder="Calle, número, colonia y código postal"
                  className={inputClassName}
                />

                <p className="text-xs leading-5 text-neutral-500">
                  Incluye calle, número y
                  referencias importantes.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-neutral-950">
                Revisa tu perfil público
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Los cambios aparecerán
                después de guardarlos.
              </p>
            </div>

            <a
              href={`/comer/${restaurant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-orange-300 hover:text-orange-700"
            >
              Ver perfil público

              <ExternalLink className="size-4" />
            </a>
          </div>
        </section>

        <div className="sticky bottom-4 z-20 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-xl shadow-neutral-950/10 backdrop-blur sm:flex sm:items-center sm:justify-between sm:px-4">
          <p className="hidden text-sm text-neutral-500 sm:block">
            Guarda los cambios realizados
            en esta sección.
          </p>

          <SubmitButton />
        </div>
      </form>

      {activeSection === "horarios" && (
        <RestaurantScheduleManager
          schedules={schedules}
        />
      )}

      {activeSection === "imagenes" && (
        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 bg-gradient-to-r from-violet-50 to-white px-5 py-5 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <ImageIcon className="size-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Logo y portada
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Personaliza la apariencia
                  pública de tu restaurante.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <RestaurantImageManager
              logoUrl={restaurant.logoUrl}
              coverUrl={restaurant.coverUrl}
            />
          </div>
        </section>
      )}
    </div>
  );
}