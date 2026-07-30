"use client";

import {
  CircleCheck,
  FileImage,
  ImageIcon,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import {
  cancelRestaurantImageUpload,
  deleteRestaurantImage,
  finalizeRestaurantImageUpload,
  prepareRestaurantImageUpload,
} from "@/app/panel/restaurante/image-actions";
import {
  ACCEPTED_IMAGE_INPUT,
} from "@/lib/images/presets";
import {
  formatFileSize,
  processImage,
} from "@/lib/images/process-image";
import {
  uploadProcessedImage,
} from "@/lib/images/upload-image";

import type {
  RestaurantImageKind,
} from "@/lib/images/storage-paths";

type RestaurantImageManagerProps = {
  logoUrl: string | null;
  coverUrl: string | null;
};

type ImageUploaderProps = {
  imageKind: RestaurantImageKind;
  title: string;
  description: string;
  currentUrl: string | null;
  recommendation: string;
};

type UploadStage =
  | "idle"
  | "processing"
  | "preparing"
  | "uploading"
  | "saving";

function DeleteButton() {
  const { pending } =
    useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle className="size-5 animate-spin" />
          Eliminando...
        </>
      ) : (
        <>
          <Trash2 className="size-5" />
          Eliminar
        </>
      )}
    </button>
  );
}

function getStageInformation(
  stage: UploadStage,
): {
  label: string;
  progress: number;
} {
  switch (stage) {
    case "processing":
      return {
        label:
          "Optimizando imagen...",
        progress: 25,
      };

    case "preparing":
      return {
        label:
          "Preparando carga segura...",
        progress: 45,
      };

    case "uploading":
      return {
        label:
          "Subiendo versiones optimizadas...",
        progress: 75,
      };

    case "saving":
      return {
        label:
          "Guardando cambios...",
        progress: 92,
      };

    default:
      return {
        label: "",
        progress: 0,
      };
  }
}

function ImageUploader({
  imageKind,
  title,
  description,
  currentUrl,
  recommendation,
}: ImageUploaderProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<string | null>(null);

  const [
    savedImageUrl,
    setSavedImageUrl,
  ] = useState<string | null>(
    currentUrl,
  );

  const [
    stage,
    setStage,
  ] = useState<UploadStage>(
    "idle",
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
    };
  }, [previewUrl]);

  const isUploading =
    stage !== "idle";

  const stageInformation =
    getStageInformation(stage);

  const displayedUrl =
    previewUrl ?? savedImageUrl;

  const isLogo =
    imageKind === "logo";

  function clearSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setSelectedFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ??
      null;

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setError(null);
    setSuccess(null);
    setSelectedFile(file);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (
      file.size >
      25 * 1024 * 1024
    ) {
      setSelectedFile(null);
      setPreviewUrl(null);
      event.target.value = "";

      setError(
        "La imagen original no puede pesar más de 25 MB.",
      );

      return;
    }

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  }

  async function handleUpload() {
    if (
      !selectedFile ||
      isUploading
    ) {
      return;
    }

    setError(null);
    setSuccess(null);

    let preparedUploadId:
      | string
      | null = null;

    try {
      setStage("processing");

      const processed =
        await processImage(
          selectedFile,
          imageKind,
        );

      setStage("preparing");

      const preparation =
        await prepareRestaurantImageUpload(
          imageKind,
        );

      if (!preparation.ok) {
        throw new Error(
          preparation.error,
        );
      }

      preparedUploadId =
        preparation.uploadId;

      setStage("uploading");

      await uploadProcessedImage({
        processedImage: processed,
        uploads: preparation.uploads,
      });

      setStage("saving");

      const finalization =
        await finalizeRestaurantImageUpload(
          imageKind,
          preparation.uploadId,
        );

      if (!finalization.ok) {
        throw new Error(
          finalization.error,
        );
      }

      preparedUploadId = null;

      setSavedImageUrl(
        finalization.imageUrl,
      );

      setSuccess(
        finalization.message,
      );

      clearSelectedFile();
    } catch (uploadError) {
      console.error(
        "Error al procesar la imagen:",
        uploadError,
      );

      if (preparedUploadId) {
        await cancelRestaurantImageUpload(
          imageKind,
          preparedUploadId,
        );
      }

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No fue posible procesar la imagen.",
      );
    } finally {
      setStage("idle");
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
        <h3 className="text-lg font-semibold text-neutral-950">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {description}
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div
          className={[
            "relative overflow-hidden border border-neutral-200 bg-neutral-100",
            isLogo
              ? "mx-auto aspect-square w-full max-w-64 rounded-3xl"
              : "aspect-video w-full rounded-2xl",
          ].join(" ")}
        >
          {displayedUrl ? (
            <Image
              src={displayedUrl}
              alt={
                isLogo
                  ? "Vista previa del logo"
                  : "Vista previa de la portada"
              }
              fill
              unoptimized
              sizes={
                isLogo
                  ? "256px"
                  : "(max-width: 768px) 100vw, 50vw"
              }
              className={
                isLogo
                  ? "object-contain p-4"
                  : "object-cover"
              }
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-5 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-neutral-400 shadow-sm">
                <ImageIcon className="size-6" />
              </div>

              <p className="mt-4 text-sm font-semibold text-neutral-700">
                Aún no hay una imagen
              </p>
            </div>
          )}

          {previewUrl && (
            <div className="absolute left-3 top-3 rounded-full bg-neutral-950/85 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur">
              Vista previa
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-neutral-50 px-4 py-4">
          <p className="text-sm font-semibold leading-5 text-neutral-700">
            {recommendation}
          </p>

          <p className="mt-2 text-sm leading-5 text-neutral-500">
            Puedes seleccionar JPG, PNG o WebP de hasta
            25 MB. El sistema la convertirá y comprimirá
            automáticamente antes de subirla.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-6 text-emerald-700"
          >
            <CircleCheck className="mt-0.5 size-5 shrink-0" />
            {success}
          </div>
        )}

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            id={`image-${imageKind}`}
            type="file"
            accept={ACCEPTED_IMAGE_INPUT}
            disabled={isUploading}
            onChange={handleFileChange}
            className="sr-only"
          />

          <label
            htmlFor={`image-${imageKind}`}
            aria-disabled={isUploading}
            className={[
              "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition",
              isUploading
                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                : "cursor-pointer border-neutral-300 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700",
            ].join(" ")}
          >
            <FileImage className="size-5" />

            {selectedFile
              ? "Seleccionar otra imagen"
              : "Seleccionar imagen"}
          </label>

          {selectedFile && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-orange-900">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-orange-700">
                    Original:{" "}
                    {formatFileSize(
                      selectedFile.size,
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={
                    clearSelectedFile
                  }
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <LoaderCircle className="size-5 shrink-0 animate-spin text-blue-600" />

                <p className="text-sm font-semibold text-blue-800">
                  {stageInformation.label}
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
                  style={{
                    width:
                      `${stageInformation.progress}%`,
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={
              !selectedFile ||
              isUploading
            }
            onClick={handleUpload}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none"
          >
            {isUploading ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="size-5" />

                {savedImageUrl
                  ? "Confirmar reemplazo"
                  : "Confirmar subida"}
              </>
            )}
          </button>
        </div>

        {savedImageUrl && (
          <div className="border-t border-neutral-100 pt-5">
            <form
              action={deleteRestaurantImage}
              onSubmit={(event) => {
                const confirmed =
                  window.confirm(
                    isLogo
                      ? "¿Seguro que deseas eliminar el logo?"
                      : "¿Seguro que deseas eliminar la portada?",
                  );

                if (!confirmed) {
                  event.preventDefault();
                }
              }}
            >
              <input
                type="hidden"
                name="imageKind"
                value={imageKind}
              />

              <DeleteButton />
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

export function RestaurantImageManager({
  logoUrl,
  coverUrl,
}: RestaurantImageManagerProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ImageUploader
        imageKind="logo"
        title="Logo"
        description="Identifica tu restaurante en tarjetas, resultados y perfil público."
        currentUrl={logoUrl}
        recommendation="Recomendado: imagen cuadrada. Se guardarán versiones de 256 × 256 y 600 × 600 px."
      />

      <ImageUploader
        imageKind="cover"
        title="Portada"
        description="Será la imagen principal que verán las personas al visitar tu perfil."
        currentUrl={coverUrl}
        recommendation="Recomendado: imagen horizontal 16:9. Se guardarán versiones de 960 × 540 y 1600 × 900 px."
      />
    </div>
  );
}