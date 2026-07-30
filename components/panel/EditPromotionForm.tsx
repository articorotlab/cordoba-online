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
  updatePromotionMetadata,
} from "@/app/panel/restaurante/promociones/actions";
import {
  uploadPromotionImageFlow,
} from "@/components/panel/promotion-image-flow";
import {
  ACCEPTED_IMAGE_INPUT,
} from "@/lib/images/presets";
import {
  formatFileSize,
} from "@/lib/images/process-image";

import type {
  DatabaseWeekDay,
} from "@/types/database-restaurants";

type RestaurantPromotion = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  startTime: string;
  endTime: string;
  validFrom: string;
  validUntil: string;
  active: boolean;
  days: DatabaseWeekDay[];
};

type EditPromotionFormProps = {
  promotion: RestaurantPromotion;
};

type EditStage =
  | "idle"
  | "updating"
  | "processing"
  | "preparing"
  | "uploading"
  | "saving";

const promotionDays: {
  value: DatabaseWeekDay;
  label: string;
}[] = [
  {
    value: "lunes",
    label: "Lunes",
  },
  {
    value: "martes",
    label: "Martes",
  },
  {
    value: "miércoles",
    label: "Miércoles",
  },
  {
    value: "jueves",
    label: "Jueves",
  },
  {
    value: "viernes",
    label: "Viernes",
  },
  {
    value: "sábado",
    label: "Sábado",
  },
  {
    value: "domingo",
    label: "Domingo",
  },
];

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
          "Actualizando la promoción...",
        progress: 20,
      };

    case "processing":
      return {
        label:
          "Optimizando la imagen...",
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
          "Guardando la imagen...",
        progress: 94,
      };

    default:
      return {
        label: "",
        progress: 0,
      };
  }
}

export function EditPromotionForm({
  promotion,
}: EditPromotionFormProps) {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    selectedDays,
    setSelectedDays,
  ] = useState<DatabaseWeekDay[]>(
    promotion.days,
  );

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

  function clearSelectedFile() {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDayChange(
    day: DatabaseWeekDay,
    checked: boolean,
  ) {
    setError(null);
    setSuccess(null);

    if (checked) {
      if (
        selectedDays.length >= 6 ||
        selectedDays.includes(day)
      ) {
        return;
      }

      setSelectedDays([
        ...selectedDays,
        day,
      ]);

      return;
    }

    setSelectedDays(
      selectedDays.filter(
        (selectedDay) =>
          selectedDay !== day,
      ),
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setSuccess(null);

    /*
     * Se crea FormData antes de deshabilitar los campos.
     */
    const formData =
  new FormData(
    event.currentTarget,
  );

const imageFile =
  selectedFile;

const startTime =
  String(
    formData.get("startTime") ?? "",
  ).trim();

const endTime =
  String(
    formData.get("endTime") ?? "",
  ).trim();

if (
  (startTime && !endTime) ||
  (!startTime && endTime)
) {
  setError(
    "Completa tanto la hora de inicio como la hora de fin.",
  );

  return;
}

if (
  startTime &&
  endTime &&
  endTime <= startTime
) {
  setError(
    "La hora de fin no puede ser del día siguiente. La promoción debe finalizar antes de las 11:59 PM del mismo día.",
  );

  return;
}

/*
 * La imagen no debe viajar a la Server Action.
 * La Server Action recibe únicamente metadatos.
 */
formData.delete("image");

    try {
      setStage("updating");

      const updateResult =
        await updatePromotionMetadata(
          formData,
        );

      if (!updateResult.ok) {
        throw new Error(
          updateResult.error,
        );
      }

      let finalMessage =
        updateResult.message;

      if (imageFile) {
        const imageResult =
          await uploadPromotionImageFlow({
            promotionId:
              promotion.id,
            file: imageFile,
            onStageChange: (
              nextStage,
            ) => {
              setStage(nextStage);
            },
          });

        if (!imageResult.ok) {
          setError(
            `Los datos se actualizaron, pero hubo un problema con la imagen: ${imageResult.error}`,
          );

          clearSelectedFile();
          router.refresh();

          return;
        }

        finalMessage =
          imageResult.message;

        clearSelectedFile();
      }

      setSuccess(finalMessage);

      router.refresh();
    } catch (updateError) {
      console.error(
        "Error al actualizar la promoción:",
        updateError,
      );

      setError(
        updateError instanceof Error
          ? updateError.message
          : "No fue posible actualizar la promoción.",
      );
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
        name="promotionId"
        value={promotion.id}
      />

      <div className="space-y-2">
        <label
          htmlFor={`title-${promotion.id}`}
          className="text-sm font-semibold text-neutral-800"
        >
          Título
        </label>

        <input
          id={`title-${promotion.id}`}
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          disabled={isSubmitting}
          defaultValue={
            promotion.title
          }
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`price-${promotion.id}`}
          className="text-sm font-semibold text-neutral-800"
        >
          Precio promocional
        </label>

        <input
          id={`price-${promotion.id}`}
          name="price"
          type="number"
          inputMode="decimal"
          min="0"
          max="999999"
          step="0.01"
          disabled={isSubmitting}
          defaultValue={
            promotion.price ?? ""
          }
          placeholder="Opcional"
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`description-${promotion.id}`}
          className="text-sm font-semibold text-neutral-800"
        >
          Descripción
        </label>

        <textarea
          id={`description-${promotion.id}`}
          name="description"
          rows={4}
          maxLength={500}
          disabled={isSubmitting}
          defaultValue={
            promotion.description
          }
          className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </div>

      <fieldset
        disabled={isSubmitting}
        className="space-y-3"
      >
        <legend className="text-sm font-semibold text-neutral-800">
          Días válidos
        </legend>

        <p className="text-xs leading-5 text-neutral-500">
          Selecciona entre uno y seis días. Una
          promoción no puede estar disponible toda la
          semana.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {promotionDays.map((day) => {
            const inputId =
              `days-${promotion.id}-${day.value}`;

            const checked =
              selectedDays.includes(
                day.value,
              );

            const maximumReached =
              selectedDays.length >= 6;

            const disabled =
              isSubmitting ||
              (!checked &&
                maximumReached);

            return (
              <label
                key={day.value}
                htmlFor={inputId}
                className={[
                  "flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition",
                  disabled
                    ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "cursor-pointer border-neutral-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50",
                ].join(" ")}
              >
                <input
                  id={inputId}
                  name="days"
                  type="checkbox"
                  value={day.value}
                  checked={checked}
                  disabled={disabled}
                  onChange={(changeEvent) => {
                    handleDayChange(
                      day.value,
                      changeEvent.target
                        .checked,
                    );
                  }}
                  className="size-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-400 disabled:cursor-not-allowed"
                />

                {day.label}
              </label>
            );
          })}
        </div>

        <p className="text-xs font-medium text-neutral-500">
          {selectedDays.length}/6 días seleccionados
        </p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`start-time-${promotion.id}`}
            className="text-sm font-semibold text-neutral-800"
          >
            Hora de inicio
          </label>

          <input
            id={`start-time-${promotion.id}`}
            name="startTime"
            type="time"
            disabled={isSubmitting}
            defaultValue={
              promotion.startTime
            }
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`end-time-${promotion.id}`}
            className="text-sm font-semibold text-neutral-800"
          >
            Hora de fin
          </label>

          <input
            id={`end-time-${promotion.id}`}
            name="endTime"
            type="time"
            disabled={isSubmitting}
            defaultValue={
              promotion.endTime
            }
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`valid-from-${promotion.id}`}
            className="text-sm font-semibold text-neutral-800"
          >
            Vigente desde
          </label>

          <input
            id={`valid-from-${promotion.id}`}
            name="validFrom"
            type="date"
            disabled={isSubmitting}
            defaultValue={
              promotion.validFrom
            }
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`valid-until-${promotion.id}`}
            className="text-sm font-semibold text-neutral-800"
          >
            Vigente hasta
          </label>

          <input
            id={`valid-until-${promotion.id}`}
            name="validUntil"
            type="date"
            disabled={isSubmitting}
            defaultValue={
              promotion.validUntil
            }
            className={inputClassName}
          />
        </div>
      </div>

      <div className="space-y-3">
        <input
          ref={fileInputRef}
          id={`image-${promotion.id}`}
          name="image"
          type="file"
          accept={ACCEPTED_IMAGE_INPUT}
          disabled={isSubmitting}
          onChange={(changeEvent) => {
            setError(null);
            setSuccess(null);

            setSelectedFile(
              changeEvent.target
                .files?.[0] ?? null,
            );
          }}
          className="sr-only"
        />

        <label
          htmlFor={`image-${promotion.id}`}
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
            : promotion.imageUrl
              ? "Reemplazar imagen"
              : "Seleccionar imagen"}
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
          {promotion.imageUrl
            ? "La imagen actual se conservará si no seleccionas una nueva."
            : "La promoción actualmente no tiene una imagen."}
        </p>

        <p className="text-xs leading-5 text-neutral-500">
          JPG, PNG o WebP de hasta 25 MB. Se crearán
          automáticamente versiones WebP de 640 × 480 y
          1200 × 900 px.
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