import type {
  ImageVariant,
} from "@/lib/images/types";

const DISPLAY_FILE_NAME =
  "/display.webp";

export function getImageVariantUrl(
  imageUrl: string | null,
  variant: ImageVariant,
): string | null {
  if (!imageUrl) {
    return null;
  }

  if (
    !imageUrl.endsWith(
      DISPLAY_FILE_NAME,
    )
  ) {
    /*
     * Compatibilidad con las imágenes antiguas.
     */
    return imageUrl;
  }

  return imageUrl.replace(
    DISPLAY_FILE_NAME,
    `/${variant}.webp`,
  );
}