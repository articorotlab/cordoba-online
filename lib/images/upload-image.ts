"use client";

import {
  IMAGE_BUCKET_NAME,
} from "@/lib/images/storage-paths";
import { createClient } from "@/lib/supabase/client";

import type {
  ProcessedImageSet,
} from "@/lib/images/types";

export type SignedImageUpload = {
  path: string;
  token: string;
};

export type SignedImageUploads = {
  card: SignedImageUpload;
  display: SignedImageUpload;
};

type UploadProcessedImageOptions = {
  processedImage: ProcessedImageSet;
  uploads: SignedImageUploads;
};

export async function uploadProcessedImage({
  processedImage,
  uploads,
}: UploadProcessedImageOptions): Promise<void> {
  const supabase =
    createClient();

  const [
    cardUploadResult,
    displayUploadResult,
  ] = await Promise.all([
    supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .uploadToSignedUrl(
        uploads.card.path,
        uploads.card.token,
        processedImage.card.file,
        {
          cacheControl: "31536000",
          contentType: "image/webp",
        },
      ),

    supabase.storage
      .from(IMAGE_BUCKET_NAME)
      .uploadToSignedUrl(
        uploads.display.path,
        uploads.display.token,
        processedImage.display.file,
        {
          cacheControl: "31536000",
          contentType: "image/webp",
        },
      ),
  ]);

  if (
    cardUploadResult.error ||
    displayUploadResult.error
  ) {
    console.error(
      "Error durante la subida directa de la imagen:",
      {
        cardError:
          cardUploadResult.error,
        displayError:
          displayUploadResult.error,
      },
    );

    throw new Error(
      "No fue posible subir la imagen. Revisa tu conexión e inténtalo nuevamente.",
    );
  }
}