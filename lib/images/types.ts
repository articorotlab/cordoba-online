export type ImageKind =
  | "logo"
  | "cover"
  | "product"
  | "promotion";

export type ImageVariant =
  | "card"
  | "display";

export type ImageVariantPreset = {
  width: number;
  height: number;
  quality: number;
  maximumSizeMb: number;
};

export type ImagePreset = {
  inputMaximumSizeMb: number;
  inputMaximumPixels: number;
  card: ImageVariantPreset;
  display: ImageVariantPreset;
};

export type ProcessedImageVariant = {
  variant: ImageVariant;
  file: File;
  width: number;
  height: number;
};

export type ProcessedImageSet = {
  card: ProcessedImageVariant;
  display: ProcessedImageVariant;
};