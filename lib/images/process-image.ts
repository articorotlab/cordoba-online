"use client";

import imageCompression from "browser-image-compression";

import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_PRESETS,
} from "@/lib/images/presets";

import type {
  ImageKind,
  ImageVariant,
  ImageVariantPreset,
  ProcessedImageSet,
  ProcessedImageVariant,
} from "@/lib/images/types";

function getImageDimensions(
  file: File,
): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl =
      URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(
        new Error(
          "No fue posible leer las dimensiones de la imagen.",
        ),
      );
    };

    image.src = objectUrl;
  });
}

function validateImageType(
  file: File,
): void {
  const accepted =
    ACCEPTED_IMAGE_TYPES.includes(
      file.type as (
        typeof ACCEPTED_IMAGE_TYPES
      )[number],
    );

  if (!accepted) {
    throw new Error(
      "Selecciona una imagen JPG, PNG o WebP.",
    );
  }
}

async function validateInputImage(
  file: File,
  imageKind: ImageKind,
): Promise<void> {
  if (file.size === 0) {
    throw new Error(
      "Selecciona una imagen antes de continuar.",
    );
  }

  validateImageType(file);

  const preset =
    IMAGE_PRESETS[imageKind];

  const maximumBytes =
    preset.inputMaximumSizeMb *
    1024 *
    1024;

  if (file.size > maximumBytes) {
    throw new Error(
      `La imagen original no puede pesar más de ${preset.inputMaximumSizeMb} MB.`,
    );
  }

  const {
    width,
    height,
  } = await getImageDimensions(file);

  const totalPixels =
    width * height;

  if (
    totalPixels >
    preset.inputMaximumPixels
  ) {
    throw new Error(
      "La resolución de la imagen es demasiado grande. Selecciona una imagen menor a 50 megapíxeles.",
    );
  }
}

async function processVariant({
  sourceFile,
  imageKind,
  variant,
  preset,
}: {
  sourceFile: File;
  imageKind: ImageKind;
  variant: ImageVariant;
  preset: ImageVariantPreset;
}): Promise<ProcessedImageVariant> {
  const compressedBlob =
  await imageCompression(
    sourceFile,
    {
      fileType: "image/webp",
      initialQuality:
        preset.quality,
      maxSizeMB:
        preset.maximumSizeMb,
      maxWidthOrHeight:
        Math.max(
          preset.width,
          preset.height,
        ),

      /*
       * Respeta la resolución definida por el preset.
       *
       * Por ejemplo, una imagen de producto display
       * se limitará primero a 1200 × 1200 px, pero no
       * seguirá reduciendo sus dimensiones para llegar
       * al peso máximo. En su lugar, ajustará la calidad.
       */
      alwaysKeepResolution: true,

      useWebWorker: true,
      preserveExif: false,
    },
  );

  const processedFile =
    new File(
      [compressedBlob],
      `${imageKind}-${variant}.webp`,
      {
        type: "image/webp",
        lastModified: Date.now(),
      },
    );

  const dimensions =
    await getImageDimensions(
      processedFile,
    );

  return {
    variant,
    file: processedFile,
    width: dimensions.width,
    height: dimensions.height,
  };
}

export async function processImage(
  sourceFile: File,
  imageKind: ImageKind,
): Promise<ProcessedImageSet> {
  await validateInputImage(
    sourceFile,
    imageKind,
  );

  const preset =
    IMAGE_PRESETS[imageKind];

  const [
    card,
    display,
  ] = await Promise.all([
    processVariant({
      sourceFile,
      imageKind,
      variant: "card",
      preset: preset.card,
    }),

    processVariant({
      sourceFile,
      imageKind,
      variant: "display",
      preset: preset.display,
    }),
  ]);

  return {
    card,
    display,
  };
}

export function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes =
    bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(0)} KB`;
  }

  return `${(
    kilobytes / 1024
  ).toFixed(2)} MB`;
}