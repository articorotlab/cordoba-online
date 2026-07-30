"use client";

import {
  CircleCheck,
  FileImage,
  LoaderCircle,
  Save,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  updateProductMetadata,
} from "@/app/panel/restaurante/platillos/actions";
import {
  uploadProductImageFlow,
} from "@/components/panel/product-image-flow";
import {
  ACCEPTED_IMAGE_INPUT,
} from "@/lib/images/presets";
import {
  formatFileSize,
} from "@/lib/images/process-image";

type EditStage =
  | "idle"
  | "updating"
  | "processing"
  | "preparing"
  | "uploading"
  | "saving";

type EditProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
};

type EditProductFormProps = {
  product: EditProduct;
};

const inputClassName =
  "min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-neutral-100";

function getStageInformation(
  stage: EditStage,
): {
  label: string;
  progress: number;
} {
  switch (stage) {
    case "updating":
      return {
        label:
          "Guardando los datos del platillo...",
        progress: 20,
      };

    case "processing":
      return {
        label:
          "Optimizando la nueva imagen...",
        progress: 40,
      };

    case "preparing":
      return {
        label:
          "Preparando carga segura...",
        progress: 58,
      };

    case "uploading":
      return {
        label:
          "Subiendo versiones optimizadas...",
        progress: 78,
      };

    case "saving":
      return {
        label:
          "Guardando la nueva imagen...",
        progress: 94,
      };

    default:
      return {
        label: "",
        progress: 0,
      };
  }
}

export function EditProductForm({
  product,
}: EditProductFormProps) {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    stage,
    setStage,
  ] = useState<EditStage>("idle");

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

  const isSubmitting =
    stage !== "idle";

  const stageInformation =
    getStageInformation(stage);

  const nameInputId =
    `edit-product-name-${product.id}`;

  const priceInputId =
    `edit-product-price-${product.id}`;

  const descriptionInputId =
    `edit-product-description-${product.id}`;

  const imageInputId =
    `edit-product-image-${product.id}`;

  function clearSelectedFile() {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    if (isSubmitting) {
      return;
    }

    setError(null);
    setSuccess(null);

    /*
     * FormData se crea antes de cambiar el stage,
     * porque el cambio de estado deshabilita los campos.
     */
    const formData =
      new FormData(form);

    const imageFile =
      selectedFile;

    /*
     * La imagen nunca se envía mediante la Server Action.
     */
    formData.delete("image");

    /*
     * Garantiza que la Server Action reciba el ID
     * correcto del platillo.
     */
    formData.set(
      "productId",
      product.id,
    );

    let metadataUpdated =
      false;

    try {
      setStage("updating");

      const updateResult =
        await updateProductMetadata(
          formData,
        );

      if (!updateResult.ok) {
        throw new Error(
          updateResult.error,
        );
      }

      metadataUpdated = true;

      let finalMessage =
        "Los datos del platillo se actualizaron correctamente.";

      if (imageFile) {
        const imageResult =
          await uploadProductImageFlow({
            productId:
              product.id,
            file:
              imageFile,
            onStageChange: (
              nextStage,
            ) => {
              setStage(nextStage);
            },
          });

        if (!imageResult.ok) {
          throw new Error(
            imageResult.error,
          );
        }

        finalMessage =
          imageResult.message;
      }

      clearSelectedFile();

      setSuccess(
        finalMessage,
      );

      router.refresh();
    } catch (updateError) {
      console.error(
        "Error al actualizar el platillo:",
        updateError,
      );

      const errorMessage =
        updateError instanceof Error
          ? updateError.message
          : "No fue posible actualizar el platillo.";

      /*
       * Si los datos textuales sí se guardaron, pero la
       * imagen falló, se informa sin revertir los datos.
       */
      setError(
        metadataUpdated && imageFile
          ? `Los datos del platillo se guardaron, pero hubo un problema con la nueva imagen: ${errorMessage}`
          : errorMessage,
      );

      if (metadataUpdated) {
        router.refresh();
      }
    } finally {
      setStage("idle");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        type="hidden"
        name="productId"
        value={product.id}
      />

      <div className="space-y-2">
        <label
          htmlFor={nameInputId}
          className="text-sm font-semibold text-neutral-800"
        >
          Nombre
        </label>

        <input
          id={nameInputId}
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={product.name}
          disabled={isSubmitting}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor={priceInputId}
          className="text-sm font-semibold text-neutral-800"
        >
          Precio
        </label>

        <input
          id={priceInputId}
          name="price"
          type="number"
          inputMode="decimal"
          min="0"
          max="999999"
          step="0.01"
          required
          defaultValue={product.price}
          disabled={isSubmitting}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor={descriptionInputId}
          className="text-sm font-semibold text-neutral-800"
        >
          Descripción
        </label>

        <textarea
          id={descriptionInputId}
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={
            product.description
          }
          disabled={isSubmitting}
          placeholder="Describe brevemente el platillo."
          className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </div>

      <div className="space-y-3">
        <input
          ref={fileInputRef}
          id={imageInputId}
          name="image"
          type="file"
          accept={ACCEPTED_IMAGE_INPUT}
          disabled={isSubmitting}
          onChange={(event) => {
            setError(null);
            setSuccess(null);

            setSelectedFile(
              event.target.files?.[0] ??
                null,
            );
          }}
          className="sr-only"
        />

        <label
          htmlFor={imageInputId}
          aria-disabled={isSubmitting}
          className={[
            "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition",
            isSubmitting
              ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700",
          ].join(" ")}
        >
          <FileImage className="size-5" />

          {selectedFile
            ? "Cambiar imagen seleccionada"
            : product.imageUrl
              ? "Reemplazar imagen actual"
              : "Agregar imagen"}
        </label>

        {selectedFile && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-orange-900">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-[11px] text-orange-700">
                Original:{" "}
                {formatFileSize(
                  selectedFile.size,
                )}
              </p>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={
                clearSelectedFile
              }
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quitar
            </button>
          </div>
        )}

        <p className="text-xs leading-5 text-neutral-500">
          {product.imageUrl
            ? "Selecciona un archivo únicamente si deseas reemplazar la imagen actual."
            : "Este platillo todavía no tiene imagen. Puedes agregar una de manera opcional."}
        </p>

        <p className="text-xs leading-5 text-neutral-500">
          JPG, PNG o WebP de hasta 25 MB. Se
          crearán automáticamente versiones WebP
          de 480 × 480 y 1200 × 1200 px.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" />

          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-6 text-emerald-700"
        >
          <CircleCheck className="mt-0.5 size-5 shrink-0" />

          <p>{success}</p>
        </div>
      )}

      {isSubmitting && (
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
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            Guardando cambios...
          </>
        ) : (
          <>
            <Save className="size-5" />
            Guardar cambios
          </>
        )}
      </button>
    </form>
  );
}