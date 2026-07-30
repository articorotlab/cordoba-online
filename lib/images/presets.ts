import type {
  ImageKind,
  ImagePreset,
} from "@/lib/images/types";

export const IMAGE_PRESETS: Record<
  ImageKind,
  ImagePreset
> = {
  logo: {
    inputMaximumSizeMb: 25,
    inputMaximumPixels: 50_000_000,
    card: {
      width: 256,
      height: 256,
      quality: 0.76,
      maximumSizeMb: 0.12,
    },
    display: {
      width: 600,
      height: 600,
      quality: 0.82,
      maximumSizeMb: 0.22,
    },
  },

  cover: {
    inputMaximumSizeMb: 25,
    inputMaximumPixels: 50_000_000,
    card: {
      width: 640,
      height: 360,
      quality: 0.72,
      maximumSizeMb: 0.22,
    },
    display: {
      width: 1600,
      height: 900,
      quality: 0.8,
      maximumSizeMb: 0.5,
    },
  },

  product: {
    inputMaximumSizeMb: 25,
    inputMaximumPixels: 50_000_000,
    card: {
      width: 480,
      height: 480,
      quality: 0.72,
      maximumSizeMb: 0.2,
    },
    display: {
      width: 1200,
      height: 1200,
      quality: 0.8,
      maximumSizeMb: 0.45,
    },
  },

  promotion: {
    inputMaximumSizeMb: 25,
    inputMaximumPixels: 50_000_000,
    card: {
      width: 640,
      height: 480,
      quality: 0.72,
      maximumSizeMb: 0.24,
    },
    display: {
      width: 1200,
      height: 900,
      quality: 0.8,
      maximumSizeMb: 0.5,
    },
  },
};

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_IMAGE_INPUT =
  "image/jpeg,image/png,image/webp";