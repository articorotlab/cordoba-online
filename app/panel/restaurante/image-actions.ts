"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRestaurant } from "@/lib/auth/require-restaurant";
import {
  buildRestaurantImagePaths,
  getStoragePathsFromPublicUrl,
  IMAGE_BUCKET_NAME,
  isValidImageUploadId,
} from "@/lib/images/storage-paths";
import { createAdminClient } from "@/lib/supabase/admin";

import type {
  RestaurantImageKind,
} from "@/lib/images/storage-paths";

type RestaurantImages = {
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
};

type SignedUploadData = {
  path: string;
  token: string;
};

function isRestaurantImageKind(
  value: string,
): value is RestaurantImageKind {
  return (
    value === "logo" ||
    value === "cover"
  );
}

function getImageKindFromFormData(
  formData: FormData,
): RestaurantImageKind | null {
  const value =
    formData.get("imageKind");

  return (
    typeof value === "string" &&
    isRestaurantImageKind(value)
  )
    ? value
    : null;
}

function redirectToImages(
  type: "message" | "error",
  text: string,
): never {
  const params = new URLSearchParams({
    section: "imagenes",
    [type]: text,
  });

  redirect(
    `/panel/restaurante?${params.toString()}`,
  );
}

async function getRestaurantImages(
  restaurantId: string,
): Promise<RestaurantImages | null> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("restaurants")
    .select(`
      slug,
      logo_url,
      cover_url
    `)
    .eq("id", restaurantId)
    .maybeSingle();

  if (error || !data) {
    console.error(
      "Error al consultar las imágenes del restaurante:",
      error,
    );

    return null;
  }

  return data as RestaurantImages;
}

function getDatabaseColumn(
  imageKind: RestaurantImageKind,
): "logo_url" | "cover_url" {
  return imageKind === "logo"
    ? "logo_url"
    : "cover_url";
}

function getCurrentImageUrl(
  restaurant: RestaurantImages,
  imageKind: RestaurantImageKind,
): string | null {
  return imageKind === "logo"
    ? restaurant.logo_url
    : restaurant.cover_url;
}

function revalidateRestaurantPages(
  slug: string,
) {
  revalidatePath("/");
  revalidatePath("/panel");
  revalidatePath("/panel/restaurante");
  revalidatePath("/comer");
  revalidatePath("/comer/restaurantes");

  if (slug) {
    revalidatePath(`/comer/${slug}`);
  }
}

/*
 * Primera parte del flujo:
 *
 * 1. Valida que el usuario controle un restaurante.
 * 2. Genera rutas nuevas e inmutables.
 * 3. Genera tokens temporales para subir directamente.
 *
 * Ningún archivo pasa por esta Server Action.
 */
export async function prepareRestaurantImageUpload(
  imageKindValue: string,
) {
  const authContext =
    await requireRestaurant();

  if (
    !isRestaurantImageKind(
      imageKindValue,
    )
  ) {
    return {
      ok: false as const,
      error:
        "El tipo de imagen seleccionado no es válido.",
    };
  }

  const restaurantId =
    authContext.restaurant.id;

  const uploadId =
    crypto.randomUUID();

  const paths =
    buildRestaurantImagePaths({
      restaurantId,
      imageKind:
        imageKindValue,
      uploadId,
    });

  const supabase =
    createAdminClient();

  const [
    cardResult,
    displayResult,
  ] = await Promise.all([
    supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .createSignedUploadUrl(
        paths.card,
      ),

    supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .createSignedUploadUrl(
        paths.display,
      ),
  ]);

  if (
    cardResult.error ||
    displayResult.error ||
    !cardResult.data ||
    !displayResult.data
  ) {
    console.error(
      "Error al preparar la subida firmada:",
      {
        cardError:
          cardResult.error,
        displayError:
          displayResult.error,
      },
    );

    return {
      ok: false as const,
      error:
        "No fue posible preparar la carga de la imagen.",
    };
  }

  const cardUpload: SignedUploadData = {
    path: paths.card,
    token:
      cardResult.data.token,
  };

  const displayUpload:
    SignedUploadData = {
      path: paths.display,
      token:
        displayResult.data.token,
    };

  return {
    ok: true as const,
    uploadId,
    uploads: {
      card: cardUpload,
      display: displayUpload,
    },
  };
}

/*
 * Segunda parte del flujo:
 *
 * Se ejecuta después de que el navegador haya subido
 * card.webp y display.webp directamente a Storage.
 */
export async function finalizeRestaurantImageUpload(
  imageKindValue: string,
  uploadId: string,
) {
  const authContext =
    await requireRestaurant();

  if (
    !isRestaurantImageKind(
      imageKindValue,
    ) ||
    !isValidImageUploadId(
      uploadId,
    )
  ) {
    return {
      ok: false as const,
      error:
        "La información de la imagen no es válida.",
    };
  }

  const restaurantId =
    authContext.restaurant.id;

  const imageKind =
    imageKindValue;

  const paths =
    buildRestaurantImagePaths({
      restaurantId,
      imageKind,
      uploadId,
    });

  const supabase =
    createAdminClient();

  /*
   * Confirmamos que las dos variantes realmente existen.
   */
  const directory =
    `${restaurantId}/${imageKind}/${uploadId}`;

  const {
    data: uploadedFiles,
    error: listError,
  } = await supabase.storage
    .from(IMAGE_BUCKET_NAME)
    .list(directory, {
      limit: 10,
    });

  const uploadedNames =
    new Set(
      uploadedFiles?.map(
        (file) => file.name,
      ) ?? [],
    );

  if (
    listError ||
    !uploadedNames.has("card.webp") ||
    !uploadedNames.has("display.webp")
  ) {
    console.error(
      "No se encontraron todas las variantes subidas:",
      listError,
    );

    await supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .remove([
        paths.card,
        paths.display,
      ]);

    return {
      ok: false as const,
      error:
        "La carga no se completó correctamente. Inténtalo nuevamente.",
    };
  }

  const restaurant =
    await getRestaurantImages(
      restaurantId,
    );

  if (!restaurant) {
    await supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .remove([
        paths.card,
        paths.display,
      ]);

    return {
      ok: false as const,
      error:
        "No fue posible consultar el restaurante.",
    };
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(IMAGE_BUCKET_NAME)
    .getPublicUrl(
      paths.display,
    );

  const imageUrl =
    publicUrlData.publicUrl;

  const databaseColumn =
    getDatabaseColumn(imageKind);

  const previousImageUrl =
    getCurrentImageUrl(
      restaurant,
      imageKind,
    );

  const {
    error: updateError,
  } = await supabase
    .from("restaurants")
    .update({
      [databaseColumn]:
        imageUrl,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", restaurantId);

  if (updateError) {
    console.error(
      "Error al guardar la nueva imagen:",
      updateError,
    );

    await supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .remove([
        paths.card,
        paths.display,
      ]);

    return {
      ok: false as const,
      error:
        "Las imágenes se subieron, pero no fue posible actualizar el restaurante.",
    };
  }

  /*
   * La base ya apunta a la imagen nueva.
   * Ahora es seguro eliminar las variantes anteriores.
   */
  const previousStoragePaths =
    getStoragePathsFromPublicUrl(
      previousImageUrl,
    );

  if (
    previousStoragePaths.length > 0
  ) {
    const {
      error: removePreviousError,
    } = await supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .remove(
        previousStoragePaths,
      );

    if (removePreviousError) {
      console.error(
        "No fue posible eliminar la imagen anterior:",
        removePreviousError,
      );
    }
  }

  revalidateRestaurantPages(
    restaurant.slug,
  );

  return {
    ok: true as const,
    imageUrl,
    message:
      imageKind === "logo"
        ? "El logo se optimizó y actualizó correctamente."
        : "La portada se optimizó y actualizó correctamente.",
  };
}

/*
 * Limpia una carga incompleta si una de las dos
 * variantes falla desde el navegador.
 */
export async function cancelRestaurantImageUpload(
  imageKindValue: string,
  uploadId: string,
) {
  const authContext =
    await requireRestaurant();

  if (
    !isRestaurantImageKind(
      imageKindValue,
    ) ||
    !isValidImageUploadId(
      uploadId,
    )
  ) {
    return;
  }

  const paths =
    buildRestaurantImagePaths({
      restaurantId:
        authContext.restaurant.id,
      imageKind:
        imageKindValue,
      uploadId,
    });

  const supabase =
    createAdminClient();

  const {
    error,
  } = await supabase.storage
    .from(IMAGE_BUCKET_NAME)
    .remove([
      paths.card,
      paths.display,
    ]);

  if (error) {
    console.error(
      "No fue posible limpiar la carga incompleta:",
      error,
    );
  }
}

export async function deleteRestaurantImage(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const imageKind =
    getImageKindFromFormData(
      formData,
    );

  if (!imageKind) {
    redirectToImages(
      "error",
      "El tipo de imagen seleccionado no es válido.",
    );
  }

  const restaurantId =
    authContext.restaurant.id;

  const restaurant =
    await getRestaurantImages(
      restaurantId,
    );

  if (!restaurant) {
    redirectToImages(
      "error",
      "No fue posible consultar las imágenes actuales.",
    );
  }

  const currentImageUrl =
    getCurrentImageUrl(
      restaurant,
      imageKind,
    );

  if (!currentImageUrl) {
    redirectToImages(
      "error",
      imageKind === "logo"
        ? "El restaurante no tiene un logo para eliminar."
        : "El restaurante no tiene una portada para eliminar.",
    );
  }

  const databaseColumn =
    getDatabaseColumn(
      imageKind,
    );

  const supabase =
    createAdminClient();

  const {
    error: updateError,
  } = await supabase
    .from("restaurants")
    .update({
      [databaseColumn]: null,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", restaurantId);

  if (updateError) {
    console.error(
      "Error al eliminar la URL de la imagen:",
      updateError,
    );

    redirectToImages(
      "error",
      "No fue posible eliminar la imagen.",
    );
  }

  const storagePaths =
    getStoragePathsFromPublicUrl(
      currentImageUrl,
    );

  if (storagePaths.length > 0) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .remove(storagePaths);

    if (storageError) {
      console.error(
        "No fue posible eliminar los archivos de Storage:",
        storageError,
      );
    }
  }

  revalidateRestaurantPages(
    restaurant.slug,
  );

  redirectToImages(
    "message",
    imageKind === "logo"
      ? "El logo se eliminó correctamente."
      : "La portada se eliminó correctamente.",
  );
}