import {
  cancelPromotionImageUpload,
  finalizePromotionImageUpload,
  preparePromotionImageUpload,
} from "@/app/panel/restaurante/promociones/actions";
import {
  processImage,
} from "@/lib/images/process-image";
import {
  uploadProcessedImage,
} from "@/lib/images/upload-image";

type PromotionImageStage =
  | "processing"
  | "preparing"
  | "uploading"
  | "saving";

type UploadPromotionImageOptions = {
  promotionId: string;
  file: File;
  onStageChange?: (
    stage: PromotionImageStage,
  ) => void;
};

type UploadPromotionImageResult =
  | {
      ok: true;
      imageUrl: string;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function uploadPromotionImageFlow({
  promotionId,
  file,
  onStageChange,
}: UploadPromotionImageOptions): Promise<UploadPromotionImageResult> {
  let uploadId: string | null = null;

  try {
    onStageChange?.("processing");

    const processedImage =
      await processImage(
        file,
        "promotion",
      );

    onStageChange?.("preparing");

    const preparation =
      await preparePromotionImageUpload(
        promotionId,
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
      await finalizePromotionImageUpload(
        promotionId,
        uploadId,
      );

    if (!finalization.ok) {
      await cancelPromotionImageUpload(
        promotionId,
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
      "Error en el flujo de imagen de la promoción:",
      error,
    );

    if (uploadId) {
      try {
        await cancelPromotionImageUpload(
          promotionId,
          uploadId,
        );
      } catch (cleanupError) {
        console.error(
          "No fue posible limpiar la carga incompleta de la promoción:",
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
  PromotionImageStage,
  UploadPromotionImageResult,
};