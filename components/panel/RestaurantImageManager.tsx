"use client";

import {
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
  deleteRestaurantImage,
  uploadRestaurantImage,
} from "@/app/panel/restaurante/image-actions";

type ImageKind = "logo" | "cover";

type RestaurantImageManagerProps = {
  logoUrl: string | null;
  coverUrl: string | null;
};

type ImageUploaderProps = {
  imageKind: ImageKind;
  title: string;
  description: string;
  currentUrl: string | null;
  maximumSizeLabel: string;
  recommendation: string;
};

type UploadButtonProps = {
  hasCurrentImage: boolean;
  hasSelectedFile: boolean;
};

function UploadButton({
  hasCurrentImage,
  hasSelectedFile,
}: UploadButtonProps) {
  const { pending } = useFormStatus();

  const disabled =
    pending || !hasSelectedFile;

  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none"
    >
      {pending ? (
        <>
          <LoaderCircle className="size-5 animate-spin" />
          Subiendo imagen...
        </>
      ) : (
        <>
          <Upload className="size-5" />

          {hasCurrentImage
            ? "Confirmar reemplazo"
            : "Confirmar subida"}
        </>
      )}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

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

function ImageUploader({
  imageKind,
  title,
  description,
  currentUrl,
  maximumSizeLabel,
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
    };
  }, [previewUrl]);

  const displayedUrl =
    previewUrl ?? currentUrl;

  const isLogo =
    imageKind === "logo";

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setSelectedFile(file);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  }

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
              : "aspect-[4/3] w-full rounded-2xl",
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
            JPG, PNG o WebP. Máximo{" "}
            {maximumSizeLabel}.
          </p>
        </div>

        <form
          action={uploadRestaurantImage}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="imageKind"
            value={imageKind}
          />

          <input
            ref={fileInputRef}
            id={`image-${imageKind}`}
            name="image"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />

          <label
            htmlFor={`image-${imageKind}`}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
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
                    {(
                      selectedFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    clearSelectedFile
                  }
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          <UploadButton
            hasCurrentImage={
              Boolean(currentUrl)
            }
            hasSelectedFile={
              Boolean(selectedFile)
            }
          />
        </form>

        {currentUrl && (
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
        maximumSizeLabel="2 MB"
        recommendation="Recomendado: imagen cuadrada de 800 × 800 px."
      />

      <ImageUploader
        imageKind="cover"
        title="Portada"
        description="Será la imagen principal que verán las personas al visitar tu perfil."
        currentUrl={coverUrl}
        maximumSizeLabel="5 MB"
        recommendation="Recomendado: imagen horizontal de 1200 × 900 px."
      />
    </div>
  );
}