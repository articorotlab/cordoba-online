"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  restaurantCategories,
  type RestaurantCategory,
} from "@/constants/food-categories";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

function getStringField(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  return typeof value === "string"
    ? value.trim()
    : "";
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

function isValidSlug(
  slug: string,
): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
    slug,
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

function redirectToRestaurants(
  type: "error" | "message",
  text: string,
): never {
  const params = new URLSearchParams({
    [type]: text,
  });

  redirect(
    `/admin/restaurantes?${params.toString()}`,
  );
}

export async function createRestaurant(
  formData: FormData,
) {
  const admin = await requireAdmin();

  const name = getStringField(
    formData,
    "name",
  );

  const slug = getStringField(
    formData,
    "slug",
  ).toLowerCase();

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
    redirectToRestaurants(
      "error",
      "El nombre debe tener entre 2 y 80 caracteres.",
    );
  }

  if (
    slug.length < 2 ||
    slug.length > 80 ||
    !isValidSlug(slug)
  ) {
    redirectToRestaurants(
      "error",
      "El slug debe tener entre 2 y 80 caracteres y solo puede incluir letras minúsculas, números y guiones.",
    );
  }

  if (!isAllowedCategory(category)) {
    redirectToRestaurants(
      "error",
      "Selecciona una categoría válida.",
    );
  }

  if (description.length > 500) {
    redirectToRestaurants(
      "error",
      "La descripción no puede superar los 500 caracteres.",
    );
  }

  if (zone.length > 80) {
    redirectToRestaurants(
      "error",
      "La zona no puede superar los 80 caracteres.",
    );
  }

  if (address.length > 180) {
    redirectToRestaurants(
      "error",
      "La dirección no puede superar los 180 caracteres.",
    );
  }

  if (!validateOptionalPhone(phone)) {
    redirectToRestaurants(
      "error",
      "Escribe un número de teléfono válido.",
    );
  }

  if (!validateOptionalPhone(whatsapp)) {
    redirectToRestaurants(
      "error",
      "Escribe un número de WhatsApp válido.",
    );
  }

  if (
    instagram &&
    instagram.length > 200
  ) {
    redirectToRestaurants(
      "error",
      "El perfil de Instagram es demasiado largo.",
    );
  }

  const supabase = createAdminClient();

  const {
    data: existingRestaurant,
    error: duplicateCheckError,
  } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (duplicateCheckError) {
    console.error(
      "Error al comprobar el slug del restaurante:",
      duplicateCheckError,
    );

    redirectToRestaurants(
      "error",
      "No fue posible verificar la dirección pública del restaurante.",
    );
  }

  if (existingRestaurant) {
    redirectToRestaurants(
      "error",
      "Ya existe un restaurante con ese slug.",
    );
  }

  const {
    data: createdRestaurant,
    error: insertError,
  } = await supabase
    .from("restaurants")
    .insert({
      slug,
      name,
      category,
      description,
      zone,
      address,
      phone,
      whatsapp,
      instagram,
      logo_url: null,
      cover_url: null,
      latitude: null,
      longitude: null,
      is_active: true,
      created_by: admin.id,
    })
    .select("id, name, slug")
    .single();

  if (
    insertError ||
    !createdRestaurant
  ) {
    console.error(
      "Error al crear el restaurante:",
      insertError,
    );

    const errorCode =
      insertError?.code;

    redirectToRestaurants(
      "error",
      errorCode === "23505"
        ? "Ya existe un restaurante con ese slug."
        : "No fue posible crear el restaurante.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/restaurantes");
  revalidatePath("/admin/cuentas");
  revalidatePath("/admin/cuentas/editar");
  revalidatePath("/comer");

  redirectToRestaurants(
    "message",
    `${createdRestaurant.name} fue creado correctamente. Ahora puedes crear su cuenta de acceso.`,
  );
}