"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  restaurantCategories,
  type RestaurantCategory,
} from "@/constants/food-categories";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  IMAGE_BUCKET_NAME,
} from "@/lib/images/storage-paths";

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

function isValidUuid(
  value: string,
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function deleteRestaurant(
  formData: FormData,
) {
  await requireAdmin();

  const restaurantId =
    getStringField(
      formData,
      "restaurantId",
    );

  const confirmationName =
    getStringField(
      formData,
      "confirmationName",
    );

  if (
    !restaurantId ||
    !isValidUuid(restaurantId)
  ) {
    redirectToRestaurants(
      "error",
      "El restaurante que intentas eliminar no es válido.",
    );
  }

  const supabase =
    createAdminClient();

  const {
    data: restaurant,
    error: restaurantError,
  } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("id", restaurantId)
    .maybeSingle();

  if (restaurantError) {
    console.error(
      "Error al buscar el restaurante que se eliminará:",
      restaurantError,
    );

    redirectToRestaurants(
      "error",
      "No fue posible comprobar el restaurante.",
    );
  }

  if (!restaurant) {
    redirectToRestaurants(
      "error",
      "El restaurante ya no existe.",
    );
  }

  if (
    confirmationName !==
    restaurant.name
  ) {
    redirectToRestaurants(
      "error",
      `Para eliminar el restaurante debes escribir exactamente: ${restaurant.name}`,
    );
  }

  /*
   * Primero localizamos todos los archivos que están
   * dentro de la carpeta principal del restaurante:
   *
   * restaurant-images/<restaurantId>/...
   */
  async function getStorageFiles(
    directory: string,
  ): Promise<string[]> {
    const foundFiles: string[] =
      [];

    let offset = 0;
    const limit = 1000;

    while (true) {
      const {
        data: entries,
        error: listError,
      } = await supabase.storage
        .from(
          IMAGE_BUCKET_NAME,
        )
        .list(directory, {
          limit,
          offset,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });

      if (listError) {
        throw listError;
      }

      const currentEntries =
        entries ?? [];

      for (
        const entry
        of currentEntries
      ) {
        const entryPath =
          `${directory}/${entry.name}`;

        /*
         * Las carpetas virtuales de Storage no
         * tienen id ni metadata.
         */
        const isDirectory =
          entry.id === null ||
          entry.metadata === null;

        if (isDirectory) {
          const nestedFiles =
            await getStorageFiles(
              entryPath,
            );

          foundFiles.push(
            ...nestedFiles,
          );
        } else {
          foundFiles.push(
            entryPath,
          );
        }
      }

      if (
        currentEntries.length <
        limit
      ) {
        break;
      }

      offset +=
        currentEntries.length;
    }

    return foundFiles;
  }

  let storageFiles: string[] =
    [];

  try {
    storageFiles =
      await getStorageFiles(
        restaurantId,
      );
  } catch (storageListError) {
    console.error(
      "Error al buscar las imágenes del restaurante:",
      storageListError,
    );

    redirectToRestaurants(
      "error",
      "No fue posible revisar las imágenes del restaurante. No se eliminó ningún dato.",
    );
  }

  /*
   * Eliminar el restaurante activa los ON DELETE
   * CASCADE de productos, promociones, horarios,
   * días de promociones y membresías.
   */
  const {
    error: deleteError,
  } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", restaurantId);

  if (deleteError) {
    console.error(
      "Error al eliminar el restaurante y sus relaciones:",
      deleteError,
    );

    redirectToRestaurants(
      "error",
      "No fue posible eliminar el restaurante.",
    );
  }

  let storageCleanupFailed =
    false;

  /*
   * Supabase recomienda eliminar archivos por lotes.
   */
  for (
    let index = 0;
    index < storageFiles.length;
    index += 100
  ) {
    const batch =
      storageFiles.slice(
        index,
        index + 100,
      );

    const {
      error: removeError,
    } = await supabase.storage
      .from(
        IMAGE_BUCKET_NAME,
      )
      .remove(batch);

    if (removeError) {
      storageCleanupFailed =
        true;

      console.error(
        "Error al eliminar un lote de imágenes del restaurante:",
        {
          restaurantId,
          files: batch,
          error: removeError,
        },
      );
    }
  }

  revalidatePath("/admin");
  revalidatePath(
    "/admin/restaurantes",
  );
  revalidatePath(
    "/admin/cuentas",
  );
  revalidatePath(
    "/admin/cuentas/editar",
  );
  revalidatePath("/comer");
  revalidatePath(
    "/comer/restaurantes",
  );
  revalidatePath(
    `/comer/${restaurant.slug}`,
  );
  revalidatePath(
    "/promociones",
  );

  if (storageCleanupFailed) {
    redirectToRestaurants(
      "message",
      `${restaurant.name} fue eliminado junto con sus datos. Algunas imágenes no pudieron limpiarse de Storage y quedaron registradas en los logs del servidor.`,
    );
  }

  redirectToRestaurants(
    "message",
    `${restaurant.name} y todo su contenido fueron eliminados permanentemente.`,
  );
}