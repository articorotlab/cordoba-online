import type {
  ImageKind,
} from "@/lib/images/types";

export const IMAGE_BUCKET_NAME =
  "restaurant-images";

export type RestaurantImageKind =
  Extract<ImageKind, "logo" | "cover">;

export type ImageStoragePaths = {
  card: string;
  display: string;
};

export function buildRestaurantImagePaths({
  restaurantId,
  imageKind,
  uploadId,
}: {
  restaurantId: string;
  imageKind: RestaurantImageKind;
  uploadId: string;
}): ImageStoragePaths {
  const directory =
    `${restaurantId}/${imageKind}/${uploadId}`;

  return {
    card: `${directory}/card.webp`,
    display: `${directory}/display.webp`,
  };
}

export function buildProductImagePaths({
  restaurantId,
  productId,
  uploadId,
}: {
  restaurantId: string;
  productId: string;
  uploadId: string;
}): ImageStoragePaths {
  const directory =
    `${restaurantId}/products/${productId}/${uploadId}`;

  return {
    card: `${directory}/card.webp`,
    display: `${directory}/display.webp`,
  };
}

export function buildPromotionImagePaths({
  restaurantId,
  promotionId,
  uploadId,
}: {
  restaurantId: string;
  promotionId: string;
  uploadId: string;
}): ImageStoragePaths {
  const directory =
    `${restaurantId}/promotions/${promotionId}/${uploadId}`;

  return {
    card: `${directory}/card.webp`,
    display: `${directory}/display.webp`,
  };
}

export function getStoragePathsFromPublicUrl(
  imageUrl: string | null,
): string[] {
  if (!imageUrl) {
    return [];
  }

  const publicPathMarker =
    `/storage/v1/object/public/${IMAGE_BUCKET_NAME}/`;

  const markerIndex =
    imageUrl.indexOf(publicPathMarker);

  if (markerIndex === -1) {
    return [];
  }

  const encodedPath = imageUrl.slice(
    markerIndex + publicPathMarker.length,
  );

  let storagePath: string;

  try {
    storagePath =
      decodeURIComponent(encodedPath);
  } catch {
    storagePath = encodedPath;
  }

  /*
   * Las imágenes optimizadas guardan display.webp
   * en la base de datos, pero también contienen
   * la variante card.webp.
   */
  if (
    storagePath.endsWith(
      "/display.webp",
    )
  ) {
    return [
      storagePath.replace(
        "/display.webp",
        "/card.webp",
      ),
      storagePath,
    ];
  }

  /*
   * Compatibilidad con imágenes antiguas que
   * solamente tienen un archivo almacenado.
   */
  return [storagePath];
}

export function isValidImageUploadId(
  uploadId: string,
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uploadId,
  );
}
