"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRestaurant } from "@/lib/auth/require-restaurant";
import { createClient } from "@/lib/supabase/server";

import type { DatabaseWeekDay } from "@/types/database-restaurants";

const BUCKET_NAME = "restaurant-images";
const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const allowedPromotionDays: DatabaseWeekDay[] = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo"
];

type PromotionRow = {
  id: string;
  restaurant_id: string;
  image_url: string | null;
  active: boolean;
};

function getStringField(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getPromotionDays(
  formData: FormData,
): DatabaseWeekDay[] {
  return formData
    .getAll("days")
    .filter(
      (value): value is DatabaseWeekDay =>
        typeof value === "string" &&
        allowedPromotionDays.includes(
          value as DatabaseWeekDay,
        ),
    );
}

function redirectToPromotions(
  type: "message" | "error",
  text: string,
): never {
  const params = new URLSearchParams({
    [type]: text,
  });

  redirect(
    `/panel/restaurante/promociones?${params.toString()}`,
  );
}

function getExtension(
  file: File,
): string {
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

function validateImage(
  file: File,
): string | null {
  if (file.size === 0) {
    return null;
  }

  if (
    !allowedImageTypes.includes(
      file.type as (typeof allowedImageTypes)[number],
    )
  ) {
    return "Selecciona una imagen JPG, PNG o WebP.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "La imagen no puede pesar más de 5 MB.";
  }

  return null;
}

function getStoragePathFromUrl(
  imageUrl: string | null,
): string | null {
  if (!imageUrl) {
    return null;
  }

  const marker =
    `/storage/v1/object/public/${BUCKET_NAME}/`;

  const markerIndex =
    imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const encodedPath = imageUrl.slice(
    markerIndex + marker.length,
  );

  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

function validatePromotionFields({
  title,
  description,
  priceValue,
  startTime,
  endTime,
  validFrom,
  validUntil,
  days,
}: {
  title: string;
  description: string;
  priceValue: string;
  startTime: string;
  endTime: string;
  validFrom: string;
  validUntil: string;
  days: DatabaseWeekDay[];
}): {
  price: number | null;
  error: string | null;
} {
  if (
    title.length < 2 ||
    title.length > 100
  ) {
    return {
      price: null,
      error:
        "El título debe tener entre 2 y 100 caracteres.",
    };
  }

  if (description.length > 500) {
    return {
      price: null,
      error:
        "La descripción no puede superar los 500 caracteres.",
    };
  }

  let price: number | null = null;

  if (priceValue) {
    const parsedPrice = Number(priceValue);

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      parsedPrice > 999999
    ) {
      return {
        price: null,
        error:
          "Escribe un precio válido o deja el campo vacío.",
      };
    }

    price =
      Math.round(parsedPrice * 100) / 100;
  }

  if (
    (startTime && !endTime) ||
    (!startTime && endTime)
  ) {
    return {
      price,
      error:
        "Completa tanto la hora de inicio como la hora de fin.",
    };
  }

  if (
    validFrom &&
    validUntil &&
    validUntil < validFrom
  ) {
    return {
      price,
      error:
        "La fecha final no puede ser anterior a la fecha inicial.",
    };
  }

  if (days.length === 0) {
    return {
      price,
      error:
        "Selecciona al menos un día válido para la promoción.",
    };
  }

  if (days.length === 7) {
  return {
    price,
    error:
      "Una promoción no puede estar disponible los siete días de la semana. Selecciona máximo seis días.",
  };
}

  return {
    price,
    error: null,
  };
}

async function uploadPromotionImage({
  restaurantId,
  promotionId,
  file,
}: {
  restaurantId: string;
  promotionId: string;
  file: File;
}): Promise<{
  imageUrl: string | null;
  storagePath: string | null;
}> {
  if (file.size === 0) {
    return {
      imageUrl: null,
      storagePath: null,
    };
  }

  const extension =
    getExtension(file);

  if (!extension) {
    redirectToPromotions(
      "error",
      "No fue posible identificar el formato de la imagen.",
    );
  }

  const storagePath =
    `${restaurantId}/promotions/${promotionId}-${Date.now()}.${extension}`;

  const supabase = await createClient();

  const {
    error: uploadError,
  } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error(
      "Error al subir la imagen de la promoción:",
      uploadError,
    );

    redirectToPromotions(
      "error",
      "No fue posible subir la imagen de la promoción.",
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return {
    imageUrl:
      publicUrlData.publicUrl,
    storagePath,
  };
}

async function getOwnedPromotion(
  promotionId: string,
  restaurantId: string,
): Promise<PromotionRow> {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("restaurant_promotions")
    .select(`
      id,
      restaurant_id,
      image_url,
      active
    `)
    .eq("id", promotionId)
    .eq(
      "restaurant_id",
      restaurantId,
    )
    .single();

  if (error || !data) {
    console.error(
      "Error al consultar la promoción:",
      error,
    );

    redirectToPromotions(
      "error",
      "No fue posible encontrar la promoción.",
    );
  }

  return data as PromotionRow;
}

async function getRestaurantSlug(
  restaurantId: string,
): Promise<string> {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", restaurantId)
    .single();

  if (error || !data) {
    console.error(
      "Error al consultar el slug:",
      error,
    );

    return "";
  }

  return data.slug as string;
}

function revalidatePromotionPages(
  slug: string,
) {
  revalidatePath("/panel");
  revalidatePath(
    "/panel/restaurante/promociones",
  );
  revalidatePath("/promociones");
  revalidatePath("/comer");
  revalidatePath(
    "/comer/restaurantes",
  );

  if (slug) {
    revalidatePath(`/comer/${slug}`);
  }
}

async function replacePromotionDays({
  promotionId,
  days,
}: {
  promotionId: string;
  days: DatabaseWeekDay[];
}) {
  const supabase = await createClient();

  const {
    error: deleteError,
  } = await supabase
    .from("restaurant_promotion_days")
    .delete()
    .eq("promotion_id", promotionId);

  if (deleteError) {
    throw deleteError;
  }

  const {
    error: insertError,
  } = await supabase
    .from("restaurant_promotion_days")
    .insert(
      days.map((day) => ({
        promotion_id: promotionId,
        day,
      })),
    );

  if (insertError) {
    throw insertError;
  }
}

export async function createPromotion(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const title = getStringField(
    formData,
    "title",
  );

  const description =
    getStringField(
      formData,
      "description",
    );

  const priceValue =
    getStringField(
      formData,
      "price",
    );

  const startTime =
    getStringField(
      formData,
      "startTime",
    );

  const endTime =
    getStringField(
      formData,
      "endTime",
    );

  const validFrom =
    getStringField(
      formData,
      "validFrom",
    );

  const validUntil =
    getStringField(
      formData,
      "validUntil",
    );

  const days =
    getPromotionDays(formData);

  const {
    price,
    error: validationError,
  } = validatePromotionFields({
    title,
    description,
    priceValue,
    startTime,
    endTime,
    validFrom,
    validUntil,
    days,
  });

  if (validationError) {
    redirectToPromotions(
      "error",
      validationError,
    );
  }

  const fileValue =
    formData.get("image");

  if (
    fileValue instanceof File
  ) {
    const imageError =
      validateImage(fileValue);

    if (imageError) {
      redirectToPromotions(
        "error",
        imageError,
      );
    }
  }

  const supabase = await createClient();

  const {
    data: lastPromotion,
    error: lastPromotionError,
  } = await supabase
    .from("restaurant_promotions")
    .select("position")
    .eq("restaurant_id", restaurantId)
    .order("position", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (lastPromotionError) {
    console.error(
      "Error al consultar la última posición:",
      lastPromotionError,
    );

    redirectToPromotions(
      "error",
      "No fue posible preparar la nueva promoción.",
    );
  }

  const nextPosition =
    typeof lastPromotion?.position ===
    "number"
      ? lastPromotion.position + 1
      : 0;

  const {
    data: createdPromotion,
    error: insertError,
  } = await supabase
    .from("restaurant_promotions")
    .insert({
      restaurant_id: restaurantId,
      title,
      description,
      price,
      image_url: null,
      start_time:
        startTime || null,
      end_time:
        endTime || null,
      valid_from:
        validFrom || null,
      valid_until:
        validUntil || null,
      active: true,
      position: nextPosition,
    })
    .select("id")
    .single();

  if (
    insertError ||
    !createdPromotion
  ) {
    console.error(
      "Error al crear la promoción:",
      insertError,
    );

    redirectToPromotions(
      "error",
      "No fue posible crear la promoción.",
    );
  }

  try {
    await replacePromotionDays({
      promotionId:
        createdPromotion.id,
      days,
    });
  } catch (daysError) {
    console.error(
      "Error al guardar los días de la promoción:",
      daysError,
    );

    await supabase
      .from("restaurant_promotions")
      .delete()
      .eq("id", createdPromotion.id)
      .eq(
        "restaurant_id",
        restaurantId,
      );

    redirectToPromotions(
      "error",
      "No fue posible guardar los días de la promoción.",
    );
  }

  let uploadedStoragePath:
    | string
    | null = null;

  if (
    fileValue instanceof File &&
    fileValue.size > 0
  ) {
    const uploadResult =
      await uploadPromotionImage({
        restaurantId,
        promotionId:
          createdPromotion.id,
        file: fileValue,
      });

    uploadedStoragePath =
      uploadResult.storagePath;

    const {
      error: imageUpdateError,
    } = await supabase
      .from("restaurant_promotions")
      .update({
        image_url:
          uploadResult.imageUrl,
      })
      .eq(
        "id",
        createdPromotion.id,
      )
      .eq(
        "restaurant_id",
        restaurantId,
      );

    if (imageUpdateError) {
      console.error(
        "Error al guardar la imagen de la promoción:",
        imageUpdateError,
      );

      if (uploadedStoragePath) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([
            uploadedStoragePath,
          ]);
      }

      await supabase
        .from("restaurant_promotions")
        .delete()
        .eq(
          "id",
          createdPromotion.id,
        )
        .eq(
          "restaurant_id",
          restaurantId,
        );

      redirectToPromotions(
        "error",
        "No fue posible guardar la imagen de la promoción.",
      );
    }
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidatePromotionPages(slug);

  redirectToPromotions(
    "message",
    "La promoción se creó correctamente.",
  );
}

export async function updatePromotion(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const promotionId =
    getStringField(
      formData,
      "promotionId",
    );

  const promotion =
    await getOwnedPromotion(
      promotionId,
      restaurantId,
    );

  const title = getStringField(
    formData,
    "title",
  );

  const description =
    getStringField(
      formData,
      "description",
    );

  const priceValue =
    getStringField(
      formData,
      "price",
    );

  const startTime =
    getStringField(
      formData,
      "startTime",
    );

  const endTime =
    getStringField(
      formData,
      "endTime",
    );

  const validFrom =
    getStringField(
      formData,
      "validFrom",
    );

  const validUntil =
    getStringField(
      formData,
      "validUntil",
    );

  const days =
    getPromotionDays(formData);

  const {
    price,
    error: validationError,
  } = validatePromotionFields({
    title,
    description,
    priceValue,
    startTime,
    endTime,
    validFrom,
    validUntil,
    days,
  });

  if (validationError) {
    redirectToPromotions(
      "error",
      validationError,
    );
  }

  const fileValue =
    formData.get("image");

  if (
    fileValue instanceof File
  ) {
    const imageError =
      validateImage(fileValue);

    if (imageError) {
      redirectToPromotions(
        "error",
        imageError,
      );
    }
  }

  const supabase = await createClient();

  let nextImageUrl =
    promotion.image_url;

  let newStoragePath:
    | string
    | null = null;

  if (
    fileValue instanceof File &&
    fileValue.size > 0
  ) {
    const uploadResult =
      await uploadPromotionImage({
        restaurantId,
        promotionId,
        file: fileValue,
      });

    nextImageUrl =
      uploadResult.imageUrl;

    newStoragePath =
      uploadResult.storagePath;
  }

  const {
    error: updateError,
  } = await supabase
    .from("restaurant_promotions")
    .update({
      title,
      description,
      price,
      image_url: nextImageUrl,
      start_time:
        startTime || null,
      end_time:
        endTime || null,
      valid_from:
        validFrom || null,
      valid_until:
        validUntil || null,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", promotionId)
    .eq(
      "restaurant_id",
      restaurantId,
    );

  if (updateError) {
    console.error(
      "Error al actualizar la promoción:",
      updateError,
    );

    if (newStoragePath) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([newStoragePath]);
    }

    redirectToPromotions(
      "error",
      "No fue posible actualizar la promoción.",
    );
  }

  try {
    await replacePromotionDays({
      promotionId,
      days,
    });
  } catch (daysError) {
    console.error(
      "Error al actualizar los días de la promoción:",
      daysError,
    );

    if (newStoragePath) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([newStoragePath]);
    }

    redirectToPromotions(
      "error",
      "La promoción se actualizó, pero no fue posible guardar sus días.",
    );
  }

  if (
    newStoragePath &&
    promotion.image_url
  ) {
    const previousStoragePath =
      getStoragePathFromUrl(
        promotion.image_url,
      );

    if (
      previousStoragePath &&
      previousStoragePath !==
        newStoragePath
    ) {
      const {
        error: removeError,
      } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([
          previousStoragePath,
        ]);

      if (removeError) {
        console.error(
          "No fue posible eliminar la imagen anterior de la promoción:",
          removeError,
        );
      }
    }
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidatePromotionPages(slug);

  redirectToPromotions(
    "message",
    "La promoción se actualizó correctamente.",
  );
}

export async function togglePromotionActive(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const promotionId =
    getStringField(
      formData,
      "promotionId",
    );

  const promotion =
    await getOwnedPromotion(
      promotionId,
      restaurantId,
    );

  const nextActive =
    !promotion.active;

  const supabase = await createClient();

  const {
    error: updateError,
  } = await supabase
    .from("restaurant_promotions")
    .update({
      active: nextActive,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", promotionId)
    .eq(
      "restaurant_id",
      restaurantId,
    );

  if (updateError) {
    console.error(
      "Error al cambiar el estado de la promoción:",
      updateError,
    );

    redirectToPromotions(
      "error",
      "No fue posible cambiar el estado de la promoción.",
    );
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidatePromotionPages(slug);

  redirectToPromotions(
    "message",
    nextActive
      ? "La promoción ahora está visible."
      : "La promoción se ocultó.",
  );
}

export async function deletePromotion(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const promotionId =
    getStringField(
      formData,
      "promotionId",
    );

  const promotion =
    await getOwnedPromotion(
      promotionId,
      restaurantId,
    );

  const supabase = await createClient();

  const {
    error: deleteError,
  } = await supabase
    .from("restaurant_promotions")
    .delete()
    .eq("id", promotionId)
    .eq(
      "restaurant_id",
      restaurantId,
    );

  if (deleteError) {
    console.error(
      "Error al eliminar la promoción:",
      deleteError,
    );

    redirectToPromotions(
      "error",
      "No fue posible eliminar la promoción.",
    );
  }

  const storagePath =
    getStoragePathFromUrl(
      promotion.image_url,
    );

  if (storagePath) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (storageError) {
      console.error(
        "No fue posible eliminar la imagen de la promoción:",
        storageError,
      );
    }
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidatePromotionPages(slug);

  redirectToPromotions(
    "message",
    "La promoción se eliminó correctamente.",
  );
}
