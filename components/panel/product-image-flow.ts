import {
  cancelProductImageUpload,
  finalizeProductImageUpload,
  prepareProductImageUpload,
} from "@/app/panel/restaurante/platillos/actions";
import {
  processImage,
} from "@/lib/images/process-image";
import {
  uploadProcessedImage,
} from "@/lib/images/upload-image";

type ProductImageStage =
  | "processing"
  | "preparing"
  | "uploading"
  | "saving";

type UploadProductImageOptions = {
  productId: string;
  file: File;
  onStageChange?: (
    stage: ProductImageStage,
  ) => void;
};

type UploadProductImageResult =
  | {
      ok: true;
      imageUrl: string;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function uploadProductImageFlow({
  productId,
  file,
  onStageChange,
}: UploadProductImageOptions): Promise<UploadProductImageResult> {
  let uploadId: string | null = null;

  try {
    onStageChange?.("processing");

    const processedImage =
      await processImage(
        file,
        "product",
      );

    onStageChange?.("preparing");

    const preparation =
      await prepareProductImageUpload(
        productId,
      );

    if (!preparation.ok) {
      return {
        ok: false,
        error: preparation.error,
      };
    }

    uploadId = preparation.uploadId;

    onStageChange?.("uploading");

    await uploadProcessedImage({
      processedImage,
      uploads:
        preparation.uploads,
    });

    onStageChange?.("saving");

    const finalization =
      await finalizeProductImageUpload(
        productId,
        uploadId,
      );

    if (!finalization.ok) {
      await cancelProductImageUpload(
        productId,
        uploadId,
      );

      return {
        ok: false,
        error: finalization.error,
      };
    }

    return {
      ok: true,
      imageUrl:
        finalization.imageUrl,
      message:
        finalization.message,
    };
  } catch (error) {
    console.error(
      "Error en el flujo de imagen del platillo:",
      error,
    );

    if (uploadId) {
      try {
        await cancelProductImageUpload(
          productId,
          uploadId,
        );
      } catch (cleanupError) {
        console.error(
          "No fue posible limpiar la carga incompleta del platillo:",
          cleanupError,
        );
      }
    }

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No fue posible procesar y subir la imagen.",
    };
  }
}

export type {
  ProductImageStage,
  UploadProductImageResult,
};
