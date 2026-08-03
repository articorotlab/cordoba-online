"use client";

import {
  useRef,
  useState,
} from "react";
import {
  LoaderCircle,
  Trash2,
} from "lucide-react";

import {
  deleteRestaurant,
} from "@/app/admin/restaurantes/actions";
import {
  Button,
} from "@/components/ui/button";

type DeleteRestaurantButtonProps = {
  restaurantId: string;
  restaurantName: string;
};

export function DeleteRestaurantButton({
  restaurantId,
  restaurantName,
}: DeleteRestaurantButtonProps) {
  const formRef =
    useRef<HTMLFormElement>(
      null,
    );

  const confirmationInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  function handleDeleteClick() {
    const confirmation =
      window.prompt(
        [
          "Esta acción es permanente.",
          "",
          `Se eliminará ${restaurantName}, sus platillos, promociones, horarios, imágenes y cuentas asignadas.`,
          "",
          `Escribe exactamente "${restaurantName}" para confirmar:`,
        ].join("\n"),
      );

    if (
      confirmation === null
    ) {
      return;
    }

    if (
      confirmationInputRef.current
    ) {
      confirmationInputRef.current.value =
        confirmation;
    }

    setIsSubmitting(true);

    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action={deleteRestaurant}
    >
      <input
        type="hidden"
        name="restaurantId"
        value={restaurantId}
      />

      <input
        ref={
          confirmationInputRef
        }
        type="hidden"
        name="confirmationName"
        defaultValue=""
      />

      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={
          handleDeleteClick
        }
        className="h-9 rounded-full border-red-200 px-3 text-xs font-bold text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="size-3.5 animate-spin"
            />

            Eliminando...
          </>
        ) : (
          <>
            <Trash2
              aria-hidden="true"
              className="size-3.5"
            />

            Eliminar
          </>
        )}
      </Button>
    </form>
  );
}