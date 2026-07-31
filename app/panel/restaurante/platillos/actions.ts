"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRestaurant } from "@/lib/auth/require-restaurant";
import {
  buildProductImagePaths,
  getStoragePathsFromPublicUrl,
  IMAGE_BUCKET_NAME,
  isValidImageUploadId,
} from "@/lib/images/storage-paths";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_FEATURED_PRODUCTS = 5;
type ProductRow = {
  id: string;
  restaurant_id: string;
  image_url: string | null;
  featured: boolean;
};

type SignedUploadData = {
  path: string;
  token: string;
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

async function getOwnedProductForImageUpload(
  productId: string,
  restaurantId: string,
): Promise<ProductRow | null> {
  const supabase =
    createAdminClient();

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
    .maybeSingle();

  if (error) {
    console.error(
      "Error al validar el platillo para su imagen:",
      error,
    );

    return null;
  }

  return data as ProductRow | null;
}

/*
 * Primera parte del nuevo flujo de imágenes:
 *
 * 1. Comprueba que el platillo pertenece al restaurante.
 * 2. Genera rutas inmutables para card.webp y display.webp.
 * 3. Genera tokens temporales para subir directamente a Storage.
 *
 * Ningún archivo pasa por esta Server Action.
 */
export async function prepareProductImageUpload(
  productId: string,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  const product =
    await getOwnedProductForImageUpload(
      productId,
      restaurantId,
    );

  if (!product) {
    return {
      ok: false as const,
      error:
        "No fue posible encontrar el platillo.",
    };
  }

  const uploadId =
    crypto.randomUUID();

  const paths =
    buildProductImagePaths({
      restaurantId,
      productId,
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
      "Error al preparar la imagen del platillo:",
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

  const cardUpload:
    SignedUploadData = {
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
 * Segunda parte del nuevo flujo:
 *
 * Se ejecuta después de que el navegador subió
 * card.webp y display.webp directamente a Storage.
 */
export async function finalizeProductImageUpload(
  productId: string,
  uploadId: string,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  if (
    !productId ||
    !isValidImageUploadId(uploadId)
  ) {
    return {
      ok: false as const,
      error:
        "La información de la imagen no es válida.",
    };
  }

  const product =
    await getOwnedProductForImageUpload(
      productId,
      restaurantId,
    );

  if (!product) {
    return {
      ok: false as const,
      error:
        "No fue posible encontrar el platillo.",
    };
  }

  const paths =
    buildProductImagePaths({
      restaurantId,
      productId,
      uploadId,
    });

  const supabase =
    createAdminClient();

  const directory =
    `${restaurantId}/products/${productId}/${uploadId}`;

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
      "No se encontraron todas las variantes del platillo:",
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

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(IMAGE_BUCKET_NAME)
    .getPublicUrl(
      paths.display,
    );

  const imageUrl =
    publicUrlData.publicUrl;

  const previousImageUrl =
    product.image_url;

  const {
    error: updateError,
  } = await supabase
    .from("restaurant_products")
    .update({
      image_url: imageUrl,
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
      "Error al guardar la imagen optimizada del platillo:",
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
        "Las imágenes se subieron, pero no fue posible actualizar el platillo.",
    };
  }

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
        "No fue posible eliminar la imagen anterior del platillo:",
        removePreviousError,
      );
    }
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidateProductPages(slug);

  return {
    ok: true as const,
    imageUrl,
    message:
      "La imagen del platillo se optimizó y actualizó correctamente.",
  };
}

/*
 * Elimina una carga incompleta cuando falla una
 * de las dos variantes desde el navegador.
 */
export async function cancelProductImageUpload(
  productId: string,
  uploadId: string,
) {
  const authContext =
    await requireRestaurant();

  const restaurantId =
    authContext.restaurant.id;

  if (
    !productId ||
    !isValidImageUploadId(uploadId)
  ) {
    return;
  }

  const product =
    await getOwnedProductForImageUpload(
      productId,
      restaurantId,
    );

  if (!product) {
    return;
  }

  const paths =
    buildProductImagePaths({
      restaurantId,
      productId,
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
      "No fue posible limpiar la carga incompleta del platillo:",
      error,
    );
  }
}

/*
 * Crea únicamente la información del platillo.
 *
 * La imagen se procesa y se sube posteriormente
 * desde el navegador mediante el nuevo flujo:
 *
 * prepare -> upload -> finalize.
 */
export async function createProductMetadata(
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
    return {
      ok: false as const,
      error: validationError,
    };
  }

  const supabase =
    await createClient();

  const {
    data: createdProduct,
    error: insertError,
  } = await supabase
    .from("restaurant_products")
    .insert({
      restaurant_id: restaurantId,
      name,
      description,
      price,
      image_url: null,
      featured: false,
    })
    .select(`
      id,
      name,
      description,
      price,
      image_url,
      featured
    `)
    .single();

  if (
    insertError ||
    !createdProduct
  ) {
    console.error(
      "Error al crear los datos del platillo:",
      insertError,
    );

    return {
      ok: false as const,
      error:
        "No fue posible crear el platillo.",
    };
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidateProductPages(slug);

  return {
    ok: true as const,
    product: {
      id:
        createdProduct.id as string,
      name:
        createdProduct.name as string,
      description:
        (createdProduct.description as string | null) ??
        "",
      price:
        Number(createdProduct.price),
      imageUrl:
        createdProduct.image_url as string | null,
      featured:
        createdProduct.featured as boolean,
    },
    message:
      "El platillo se creó correctamente.",
  };
}

/*
 * Actualiza únicamente la información textual
 * del platillo.
 *
 * La imagen se procesa y se actualiza por separado
 * mediante el flujo:
 *
 * prepare -> upload -> finalize.
 *
 * Ningún archivo debe llegar a esta Server Action.
 */
export async function updateProductMetadata(
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

  if (!productId) {
    return {
      ok: false as const,
      error:
        "No fue posible identificar el platillo.",
    };
  }

  const product =
    await getOwnedProductForImageUpload(
      productId,
      restaurantId,
    );

  if (!product) {
    return {
      ok: false as const,
      error:
        "No fue posible encontrar el platillo.",
    };
  }

  const name =
    getStringField(
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
    return {
      ok: false as const,
      error: validationError,
    };
  }

  const supabase =
    createAdminClient();

  const {
    data: updatedProduct,
    error: updateError,
  } = await supabase
    .from("restaurant_products")
    .update({
      name,
      description,
      price,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", productId)
    .eq(
      "restaurant_id",
      restaurantId,
    )
    .select(`
      id,
      name,
      description,
      price,
      image_url,
      featured
    `)
    .single();

  if (
    updateError ||
    !updatedProduct
  ) {
    console.error(
      "Error al actualizar los datos del platillo:",
      updateError,
    );

    return {
      ok: false as const,
      error:
        "No fue posible actualizar el platillo.",
    };
  }

  const slug =
    await getRestaurantSlug(
      restaurantId,
    );

  revalidateProductPages(slug);

  return {
    ok: true as const,
    product: {
      id:
        updatedProduct.id as string,
      name:
        updatedProduct.name as string,
      description:
        (
          updatedProduct.description as
            | string
            | null
        ) ?? "",
      price:
        Number(
          updatedProduct.price,
        ),
      imageUrl:
        updatedProduct.image_url as
          | string
          | null,
      featured:
        updatedProduct.featured as boolean,
    },
    message:
      "El platillo se actualizó correctamente.",
  };
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

  const storagePaths =
    getStoragePathsFromPublicUrl(
      product.image_url,
    );

  if (storagePaths.length > 0) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .remove(storagePaths);

    if (storageError) {
      console.error(
        "No fue posible eliminar las imágenes del platillo:",
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