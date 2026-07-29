"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRestaurant } from "@/lib/auth/require-restaurant";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "restaurant-images";
const MAX_FEATURED_PRODUCTS = 5;
const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type ProductRow = {
  id: string;
  restaurant_id: string;
  image_url: string | null;
  featured: boolean;
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

function redirectToProducts(
  type: "message" | "error",
  text: string,
): never {
  const params = new URLSearchParams({
    [type]: text,
  });

  redirect(
    `/panel/restaurante/platillos?${params.toString()}`,
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

function validateProductFields(
  name: string,
  description: string,
  priceValue: string,
): {
  price: number;
  error: string | null;
} {
  if (
    name.length < 2 ||
    name.length > 100
  ) {
    return {
      price: 0,
      error:
        "El nombre debe tener entre 2 y 100 caracteres.",
    };
  }

  if (description.length > 500) {
    return {
      price: 0,
      error:
        "La descripción no puede superar los 500 caracteres.",
    };
  }

  const price = Number(priceValue);

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    price > 999999
  ) {
    return {
      price: 0,
      error:
        "Escribe un precio válido.",
    };
  }

  return {
    price:
      Math.round(price * 100) / 100,
    error: null,
  };
}

async function uploadProductImage({
  restaurantId,
  productId,
  file,
}: {
  restaurantId: string;
  productId: string;
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
    redirectToProducts(
      "error",
      "No fue posible identificar el formato de la imagen.",
    );
  }

  const storagePath =
    `${restaurantId}/products/${productId}-${Date.now()}.${extension}`;

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
      "Error al subir la imagen del platillo:",
      uploadError,
    );

    redirectToProducts(
      "error",
      "No fue posible subir la imagen del platillo.",
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

async function getOwnedProduct(
  productId: string,
  restaurantId: string,
): Promise<ProductRow> {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("restaurant_products")
    .select(`
      id,
      restaurant_id,
      image_url,
      featured
    `)
    .eq("id", productId)
    .eq(
      "restaurant_id",
      restaurantId,
    )
    .single();

  if (error || !data) {
    console.error(
      "Error al consultar el platillo:",
      error,
    );

    redirectToProducts(
      "error",
      "No fue posible encontrar el platillo.",
    );
  }

  return data as ProductRow;
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

function revalidateProductPages(
  slug: string,
) {
  revalidatePath("/panel");
  revalidatePath(
    "/panel/restaurante/platillos",
  );
  revalidatePath("/comer");
  revalidatePath(
    "/comer/restaurantes",
  );

  if (slug) {
    revalidatePath(`/comer/${slug}`);
  }
}

export async function createProduct(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const name = getStringField(
    formData,
    "name",
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

  const {
    price,
    error: validationError,
  } = validateProductFields(
    name,
    description,
    priceValue,
  );

  if (validationError) {
    redirectToProducts(
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
      redirectToProducts(
        "error",
        imageError,
      );
    }
  }

  const supabase = await createClient();

  const {
    data: createdProduct,
    error: insertError,
  } = await supabase
    .from("restaurant_products")
    .insert({
      restaurant_id: restaurantId,
      name,
      description:
        description || null,
      price,
      image_url: null,
      featured: false,
    })
    .select("id")
    .single();

  if (
    insertError ||
    !createdProduct
  ) {
    console.error(
      "Error al crear el platillo:",
      insertError,
    );

    redirectToProducts(
      "error",
      "No fue posible crear el platillo.",
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
      await uploadProductImage({
        restaurantId,
        productId:
          createdProduct.id,
        file: fileValue,
      });

    uploadedStoragePath =
      uploadResult.storagePath;

    const {
      error: imageUpdateError,
    } = await supabase
      .from("restaurant_products")
      .update({
        image_url:
          uploadResult.imageUrl,
      })
      .eq(
        "id",
        createdProduct.id,
      )
      .eq(
        "restaurant_id",
        restaurantId,
      );

    if (imageUpdateError) {
      console.error(
        "Error al guardar la imagen del platillo:",
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
        .from("restaurant_products")
        .delete()
        .eq(
          "id",
          createdProduct.id,
        )
        .eq(
          "restaurant_id",
          restaurantId,
        );

      redirectToProducts(
        "error",
        "No fue posible guardar la imagen del platillo.",
      );
    }
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidateProductPages(slug);

  redirectToProducts(
    "message",
    "El platillo se creó correctamente.",
  );
}

export async function updateProduct(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const productId =
    getStringField(
      formData,
      "productId",
    );

  const product =
    await getOwnedProduct(
      productId,
      restaurantId,
    );

  const name = getStringField(
    formData,
    "name",
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

  const {
    price,
    error: validationError,
  } = validateProductFields(
    name,
    description,
    priceValue,
  );

  if (validationError) {
    redirectToProducts(
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
      redirectToProducts(
        "error",
        imageError,
      );
    }
  }

  const supabase = await createClient();

  let nextImageUrl =
    product.image_url;

  let newStoragePath:
    | string
    | null = null;

  if (
    fileValue instanceof File &&
    fileValue.size > 0
  ) {
    const uploadResult =
      await uploadProductImage({
        restaurantId,
        productId,
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
    .from("restaurant_products")
    .update({
      name,
      description:
        description || null,
      price,
      image_url: nextImageUrl,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", productId)
    .eq(
      "restaurant_id",
      restaurantId,
    );

  if (updateError) {
    console.error(
      "Error al actualizar el platillo:",
      updateError,
    );

    if (newStoragePath) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([newStoragePath]);
    }

    redirectToProducts(
      "error",
      "No fue posible actualizar el platillo.",
    );
  }

  if (
    newStoragePath &&
    product.image_url
  ) {
    const previousStoragePath =
      getStoragePathFromUrl(
        product.image_url,
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
          "No fue posible eliminar la imagen anterior del platillo:",
          removeError,
        );
      }
    }
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidateProductPages(slug);

  redirectToProducts(
    "message",
    "El platillo se actualizó correctamente.",
  );
}

export async function toggleProductFeatured(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const productId =
    getStringField(
      formData,
      "productId",
    );

  const product =
    await getOwnedProduct(
      productId,
      restaurantId,
    );

  const nextFeatured =
    !product.featured;

  const supabase = await createClient();

  if (nextFeatured) {
    const {
      count,
      error: countError,
    } = await supabase
      .from("restaurant_products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "restaurant_id",
        restaurantId,
      )
      .eq("featured", true);

    if (countError) {
      console.error(
        "Error al contar platillos visibles:",
        countError,
      );

      redirectToProducts(
        "error",
        "No fue posible validar los platillos visibles.",
      );
    }

    if (
      (count ?? 0) >=
      MAX_FEATURED_PRODUCTS
    ) {
      redirectToProducts(
        "error",
        "Ya alcanzaste el límite de 5 platillos visibles en tu perfil.",
      );
    }
  }

  const {
    error: updateError,
  } = await supabase
    .from("restaurant_products")
    .update({
      featured: nextFeatured,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", productId)
    .eq(
      "restaurant_id",
      restaurantId,
    );

  if (updateError) {
    console.error(
      "Error al cambiar la visibilidad del platillo:",
      updateError,
    );

    redirectToProducts(
      "error",
      "No fue posible cambiar la visibilidad del platillo.",
    );
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidateProductPages(slug);

  redirectToProducts(
    "message",
    nextFeatured
      ? "El platillo ahora se muestra en tu perfil."
      : "El platillo se ocultó de tu perfil.",
  );
}

export async function deleteProduct(
  formData: FormData,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const productId =
    getStringField(
      formData,
      "productId",
    );

  const product =
    await getOwnedProduct(
      productId,
      restaurantId,
    );

  const supabase = await createClient();

  const {
    error: deleteError,
  } = await supabase
    .from("restaurant_products")
    .delete()
    .eq("id", productId)
    .eq(
      "restaurant_id",
      restaurantId,
    );

  if (deleteError) {
    console.error(
      "Error al eliminar el platillo:",
      deleteError,
    );

    redirectToProducts(
      "error",
      "No fue posible eliminar el platillo.",
    );
  }

  const storagePath =
    getStoragePathFromUrl(
      product.image_url,
    );

  if (storagePath) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (storageError) {
      console.error(
        "No fue posible eliminar la imagen del platillo:",
        storageError,
      );
    }
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidateProductPages(slug);

  redirectToProducts(
    "message",
    "El platillo se eliminó correctamente.",
  );
}
