"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRestaurant } from "@/lib/auth/require-restaurant";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "restaurant-images";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type ImageKind = "logo" | "cover";

type RestaurantImages = {
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
};

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

function getImageKind(
  formData: FormData,
): ImageKind | null {
  const value = formData.get("imageKind");

  if (value === "logo" || value === "cover") {
    return value;
  }

  return null;
}

function getExtension(file: File): string {
  switch (file.type) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "";
  }
}

function getStoragePathFromUrl(
  imageUrl: string | null,
): string | null {
  if (!imageUrl) {
    return null;
  }

  const publicPathMarker =
    `/storage/v1/object/public/${BUCKET_NAME}/`;

  const markerIndex =
    imageUrl.indexOf(publicPathMarker);

  if (markerIndex === -1) {
    return null;
  }

  const encodedPath = imageUrl.slice(
    markerIndex + publicPathMarker.length,
  );

  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

async function getRestaurantImages(
  restaurantId: string,
): Promise<RestaurantImages> {
  const supabase = await createClient();

  const {
    data: restaurant,
    error,
  } = await supabase
    .from("restaurants")
    .select(`
      slug,
      logo_url,
      cover_url
    `)
    .eq("id", restaurantId)
    .single();

  if (error || !restaurant) {
    console.error(
      "Error al consultar las imágenes del restaurante:",
      error,
    );

    redirectToImages(
      "error",
      "No fue posible consultar las imágenes actuales.",
    );
  }

  return restaurant as RestaurantImages;
}

function validateImage(
  imageKind: ImageKind,
  file: File,
): string | null {
  if (file.size === 0) {
    return "Selecciona una imagen antes de continuar.";
  }

  if (
    !allowedImageTypes.includes(
      file.type as (typeof allowedImageTypes)[number],
    )
  ) {
    return "Selecciona una imagen JPG, PNG o WebP.";
  }

  const maximumSize =
    imageKind === "logo"
      ? 2 * 1024 * 1024
      : 5 * 1024 * 1024;

  if (file.size > maximumSize) {
    return imageKind === "logo"
      ? "El logo no puede pesar más de 2 MB."
      : "La portada no puede pesar más de 5 MB.";
  }

  return null;
}

function revalidateRestaurantPages(
  slug: string,
) {
  revalidatePath("/panel");
  revalidatePath("/panel/restaurante");
  revalidatePath("/comer");
  revalidatePath("/comer/restaurantes");
  revalidatePath(`/comer/${slug}`);
}

export async function uploadRestaurantImage(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const imageKind =
    getImageKind(formData);

  if (!imageKind) {
    redirectToImages(
      "error",
      "El tipo de imagen seleccionado no es válido.",
    );
  }

  const fileValue =
    formData.get("image");

  if (!(fileValue instanceof File)) {
    redirectToImages(
      "error",
      "Selecciona una imagen antes de continuar.",
    );
  }

  const validationError =
    validateImage(imageKind, fileValue);

  if (validationError) {
    redirectToImages(
      "error",
      validationError,
    );
  }

  const extension =
    getExtension(fileValue);

  if (!extension) {
    redirectToImages(
      "error",
      "No fue posible identificar el formato de la imagen.",
    );
  }

  const restaurantId =
    authContext.restaurant.id;

  const restaurant =
    await getRestaurantImages(
      restaurantId,
    );

  const supabase = await createClient();

  const fileName =
    `${imageKind}-${Date.now()}.${extension}`;

  const storagePath =
    `${restaurantId}/${fileName}`;

  const {
    error: uploadError,
  } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(
      storagePath,
      fileValue,
      {
        cacheControl: "3600",
        contentType: fileValue.type,
        upsert: false,
      },
    );

  if (uploadError) {
    console.error(
      "Error al subir la imagen:",
      uploadError,
    );

    redirectToImages(
      "error",
      "No fue posible subir la imagen. Inténtalo nuevamente.",
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  const imageUrl =
    publicUrlData.publicUrl;

  const databaseColumn =
    imageKind === "logo"
      ? "logo_url"
      : "cover_url";

  const previousImageUrl =
    imageKind === "logo"
      ? restaurant.logo_url
      : restaurant.cover_url;

  const {
    error: updateError,
  } = await supabase
    .from("restaurants")
    .update({
      [databaseColumn]: imageUrl,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", restaurantId);

  if (updateError) {
    console.error(
      "Error al guardar la URL de la imagen:",
      updateError,
    );

    await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    redirectToImages(
      "error",
      "La imagen se subió, pero no fue posible actualizar el restaurante.",
    );
  }

  const previousStoragePath =
    getStoragePathFromUrl(
      previousImageUrl,
    );

  if (
    previousStoragePath &&
    previousStoragePath !== storagePath
  ) {
    const {
      error: removePreviousError,
    } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([previousStoragePath]);

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

  redirectToImages(
    "message",
    imageKind === "logo"
      ? "El logo se actualizó correctamente."
      : "La portada se actualizó correctamente.",
  );
}

export async function deleteRestaurantImage(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const imageKind =
    getImageKind(formData);

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

  const currentImageUrl =
    imageKind === "logo"
      ? restaurant.logo_url
      : restaurant.cover_url;

  if (!currentImageUrl) {
    redirectToImages(
      "error",
      imageKind === "logo"
        ? "El restaurante no tiene un logo para eliminar."
        : "El restaurante no tiene una portada para eliminar.",
    );
  }

  const databaseColumn =
    imageKind === "logo"
      ? "logo_url"
      : "cover_url";

  const supabase = await createClient();

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

  const storagePath =
    getStoragePathFromUrl(
      currentImageUrl,
    );

  if (storagePath) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (storageError) {
      console.error(
        "No fue posible eliminar el archivo de Storage:",
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