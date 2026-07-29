"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  restaurantCategories,
  type RestaurantCategory,
} from "@/constants/food-categories";
import { requireRestaurant } from "@/lib/auth/require-restaurant";
import { createClient } from "@/lib/supabase/server";

const allowedSections = [
  "general",
  "contacto",
  "ubicacion",
  "horarios",
  "imagenes",
] as const;

const weekDays = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
] as const;

type AllowedSection =
  (typeof allowedSections)[number];

type WeekDay = (typeof weekDays)[number];

type SubmittedSchedule = {
  day: WeekDay;
  opensAt: string | null;
  closesAt: string | null;
  closed: boolean;
};

function getStringField(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOptionalField(
  formData: FormData,
  field: string,
): string | null {
  const value = getStringField(
    formData,
    field,
  );

  return value || null;
}

function isAllowedCategory(
  category: string,
): category is RestaurantCategory {
  return restaurantCategories.some(
    (allowedCategory) =>
      allowedCategory === category,
  );
}

function isAllowedSection(
  section: string,
): section is AllowedSection {
  return allowedSections.some(
    (allowedSection) =>
      allowedSection === section,
  );
}

function isWeekDay(
  value: unknown,
): value is WeekDay {
  return (
    typeof value === "string" &&
    weekDays.some((day) => day === value)
  );
}

function isValidTime(
  value: string,
): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(
    value,
  );
}

function getCurrentSection(
  formData: FormData,
): AllowedSection {
  const section = getStringField(
    formData,
    "currentSection",
  );

  return isAllowedSection(section)
    ? section
    : "general";
}

function redirectToRestaurantEditor(
  type: "error" | "message",
  text: string,
  section: AllowedSection,
): never {
  const params = new URLSearchParams({
    [type]: text,
    section,
  });

  redirect(
    `/panel/restaurante?${params.toString()}`,
  );
}

function validateOptionalPhone(
  value: string | null,
): boolean {
  if (!value) {
    return true;
  }

  const digits = value.replace(/\D/g, "");

  return (
    digits.length >= 10 &&
    digits.length <= 15
  );
}

function parseSchedules(
  formData: FormData,
): SubmittedSchedule[] | null {
  const serializedSchedules =
    getStringField(formData, "schedules");

  if (!serializedSchedules) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(
      serializedSchedules,
    );

    if (!Array.isArray(parsedValue)) {
      return null;
    }

    if (parsedValue.length !== 7) {
      return null;
    }

    const schedules: SubmittedSchedule[] = [];
    const receivedDays = new Set<WeekDay>();

    for (const item of parsedValue) {
      if (
        typeof item !== "object" ||
        item === null
      ) {
        return null;
      }

      const schedule = item as Record<
        string,
        unknown
      >;

      if (
        !isWeekDay(schedule.day) ||
        typeof schedule.closed !== "boolean"
      ) {
        return null;
      }

      if (receivedDays.has(schedule.day)) {
        return null;
      }

      receivedDays.add(schedule.day);

      if (schedule.closed) {
        schedules.push({
          day: schedule.day,
          opensAt: null,
          closesAt: null,
          closed: true,
        });

        continue;
      }

      if (
        typeof schedule.opensAt !== "string" ||
        typeof schedule.closesAt !== "string" ||
        !isValidTime(schedule.opensAt) ||
        !isValidTime(schedule.closesAt) ||
        schedule.opensAt === schedule.closesAt
      ) {
        return null;
      }

      schedules.push({
        day: schedule.day,
        opensAt: schedule.opensAt,
        closesAt: schedule.closesAt,
        closed: false,
      });
    }

    const hasEveryDay = weekDays.every((day) =>
      receivedDays.has(day),
    );

    return hasEveryDay ? schedules : null;
  } catch {
    return null;
  }
}

export async function updateRestaurant(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const currentSection =
    getCurrentSection(formData);

  const name = getStringField(
    formData,
    "name",
  );

  const category = getStringField(
    formData,
    "category",
  );

  const description = getStringField(
    formData,
    "description",
  );

  const zone = getStringField(
    formData,
    "zone",
  );

  const address = getStringField(
    formData,
    "address",
  );

  const phone = getOptionalField(
    formData,
    "phone",
  );

  const whatsapp = getOptionalField(
    formData,
    "whatsapp",
  );

  const instagram = getOptionalField(
    formData,
    "instagram",
  );

  if (
    name.length < 2 ||
    name.length > 80
  ) {
    redirectToRestaurantEditor(
      "error",
      "El nombre debe tener entre 2 y 80 caracteres.",
      "general",
    );
  }

  if (!isAllowedCategory(category)) {
    redirectToRestaurantEditor(
      "error",
      "Selecciona una categoría válida.",
      "general",
    );
  }

  if (description.length > 500) {
    redirectToRestaurantEditor(
      "error",
      "La descripción no puede superar los 500 caracteres.",
      "general",
    );
  }

  if (!validateOptionalPhone(phone)) {
    redirectToRestaurantEditor(
      "error",
      "Escribe un número de teléfono válido.",
      "contacto",
    );
  }

  if (!validateOptionalPhone(whatsapp)) {
    redirectToRestaurantEditor(
      "error",
      "Escribe un número de WhatsApp válido.",
      "contacto",
    );
  }

  if (
    instagram &&
    instagram.length > 200
  ) {
    redirectToRestaurantEditor(
      "error",
      "El perfil de Instagram es demasiado largo.",
      "contacto",
    );
  }

  if (zone.length > 80) {
    redirectToRestaurantEditor(
      "error",
      "La zona no puede superar los 80 caracteres.",
      "ubicacion",
    );
  }

  if (address.length > 180) {
    redirectToRestaurantEditor(
      "error",
      "La dirección no puede superar los 180 caracteres.",
      "ubicacion",
    );
  }

  const supabase = await createClient();

  const {
    data: updatedRestaurant,
    error,
  } = await supabase
    .from("restaurants")
    .update({
      name,
      category,
      description,
      zone,
      address,
      phone,
      whatsapp,
      instagram,
      updated_at: new Date().toISOString(),
    })
    .eq(
      "id",
      authContext.restaurant.id,
    )
    .select("slug")
    .single();

  if (error) {
    console.error(
      "Error al actualizar el restaurante:",
      error,
    );

    redirectToRestaurantEditor(
      "error",
      "No fue posible guardar los cambios. Inténtalo nuevamente.",
      currentSection,
    );
  }

  if (!updatedRestaurant) {
    redirectToRestaurantEditor(
      "error",
      "No se encontró el restaurante actualizado.",
      currentSection,
    );
  }

  revalidatePath("/panel");
  revalidatePath("/panel/restaurante");
  revalidatePath("/comer");
  revalidatePath(
    `/comer/${updatedRestaurant.slug}`,
  );

  redirectToRestaurantEditor(
    "message",
    "Los cambios se guardaron correctamente.",
    currentSection,
  );
}

export async function updateRestaurantSchedules(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const schedules = parseSchedules(formData);

  if (!schedules) {
    redirectToRestaurantEditor(
      "error",
      "Revisa los horarios. Cada día abierto debe tener una hora de apertura y cierre diferentes.",
      "horarios",
    );
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("restaurant_schedules")
    .upsert(
      schedules.map((schedule) => ({
        restaurant_id:
          authContext.restaurant.id,
        day: schedule.day,
        opens_at: schedule.opensAt,
        closes_at: schedule.closesAt,
        closed: schedule.closed,
      })),
      {
        onConflict: "restaurant_id,day",
      },
    );

  if (error) {
    console.error(
      "Error al actualizar los horarios del restaurante:",
      error,
    );

    redirectToRestaurantEditor(
      "error",
      "No fue posible guardar los horarios. Inténtalo nuevamente.",
      "horarios",
    );
  }

  revalidatePath("/panel");
  revalidatePath("/panel/restaurante");
  revalidatePath("/comer");

  redirectToRestaurantEditor(
    "message",
    "Los horarios se guardaron correctamente.",
    "horarios",
  );
}