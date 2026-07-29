"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  LoaderCircle,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  TriangleAlert,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import {
  createProduct,
  deleteProduct,
  toggleProductFeatured,
  updateProduct,
} from "@/app/panel/restaurante/platillos/actions";

type RestaurantProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  featured: boolean;
};

type RestaurantProductsManagerProps = {
  products: RestaurantProduct[];
  message?: string;
  error?: string;
};

type FeedbackMessageProps = {
  type: "success" | "error";
  text: string;
};

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  icon?: typeof Save;
  className?: string;
  disabled?: boolean;
};

const inputClassName =
  "min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

function FeedbackMessage({
  type,
  text,
}: FeedbackMessageProps) {
  const [visible, setVisible] =
    useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        setVisible(false);
      },
      3500,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  if (!visible) {
    return null;
  }

  const isSuccess =
    type === "success";

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800",
      ].join(" ")}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
      ) : (
        <TriangleAlert className="mt-0.5 size-5 shrink-0" />
      )}

      <p className="leading-6">
        {text}
      </p>
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  icon: Icon = Save,
  className,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={
        className ??
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          <Icon className="size-4" />
          {label}
        </>
      )}
    </button>
  );
}

function ProductImageInput({
  id,
}: {
  id: string;
}) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={id}
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          setSelectedFile(
            event.target.files?.[0] ??
              null,
          );
        }}
        className="sr-only"
      />

      <label
        htmlFor={id}
        className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
      >
        <ImageIcon className="size-5" />

        {selectedFile
          ? "Cambiar imagen seleccionada"
          : "Seleccionar imagen"}
      </label>

      {selectedFile && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-orange-900">
              {selectedFile.name}
            </p>

            <p className="mt-0.5 text-[11px] text-orange-700">
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
            onClick={() => {
              setSelectedFile(null);

              if (inputRef.current) {
                inputRef.current.value =
                  "";
              }
            }}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  featuredCount,
}: {
  product: RestaurantProduct;
  featuredCount: number;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const featuredLimitReached =
    featuredCount >= 5 &&
    !product.featured;

  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-white">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-orange-400 shadow-sm">
              <UtensilsCrossed className="size-7" />
            </div>

            <p className="mt-4 text-sm font-semibold text-neutral-600">
              Sin fotografía
            </p>
          </div>
        )}

        {product.featured && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-sm">
              <Star className="size-3 fill-current" />
              Visible en el perfil
            </span>
          </div>
        )}
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold text-neutral-950">
              {product.name}
            </h2>

            <p className="shrink-0 text-lg font-bold text-orange-600">
              {new Intl.NumberFormat(
                "es-MX",
                {
                  style: "currency",
                  currency: "MXN",
                },
              ).format(product.price)}
            </p>
          </div>

          {product.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
              {product.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <form
            action={
              toggleProductFeatured
            }
          >
            <input
              type="hidden"
              name="productId"
              value={product.id}
            />

            <SubmitButton
              label={
                product.featured
                  ? "Ocultar del perfil"
                  : featuredLimitReached
                    ? "Límite alcanzado"
                    : "Mostrar en mi perfil"
              }
              pendingLabel="Guardando..."
              icon={Star}
              disabled={
                featuredLimitReached
              }
              className={[
                "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                product.featured
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : featuredLimitReached
                    ? "border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800",
              ].join(" ")}
            />
          </form>

          <button
            type="button"
            onClick={() => {
              setEditing(
                (current) => !current,
              );
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            {editing ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}

            {editing
              ? "Cerrar edición"
              : "Editar"}
          </button>
        </div>

        {editing && (
          <div className="border-t border-neutral-100 pt-5">
            <form
              action={updateProduct}
              className="space-y-4"
            >
              <input
                type="hidden"
                name="productId"
                value={product.id}
              />

              <div className="space-y-2">
                <label
                  htmlFor={`name-${product.id}`}
                  className="text-sm font-semibold text-neutral-800"
                >
                  Nombre
                </label>

                <input
                  id={`name-${product.id}`}
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  defaultValue={product.name}
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`price-${product.id}`}
                  className="text-sm font-semibold text-neutral-800"
                >
                  Precio
                </label>

                <input
                  id={`price-${product.id}`}
                  name="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="999999"
                  step="0.01"
                  required
                  defaultValue={product.price}
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`description-${product.id}`}
                  className="text-sm font-semibold text-neutral-800"
                >
                  Descripción
                </label>

                <textarea
                  id={`description-${product.id}`}
                  name="description"
                  rows={4}
                  maxLength={500}
                  defaultValue={
                    product.description
                  }
                  className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <ProductImageInput
                id={`image-${product.id}`}
              />

              <SubmitButton
                label="Guardar cambios"
                pendingLabel="Guardando..."
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>

            <form
              action={deleteProduct}
              onSubmit={(event) => {
                const confirmed =
                  window.confirm(
                    `¿Seguro que deseas eliminar "${product.name}"?`,
                  );

                if (!confirmed) {
                  event.preventDefault();
                }
              }}
              className="mt-3"
            >
              <input
                type="hidden"
                name="productId"
                value={product.id}
              />

              <SubmitButton
                label="Eliminar platillo"
                pendingLabel="Eliminando..."
                icon={Trash2}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

export function RestaurantProductsManager({
  products,
  message,
  error,
}: RestaurantProductsManagerProps) {
  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(products.length === 0);

  const featuredCount =
    products.filter(
      (product) => product.featured,
    ).length;

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div className="space-y-3">
          {message && (
            <FeedbackMessage
              type="success"
              text={message}
            />
          )}

          {error && (
            <FeedbackMessage
              type="error"
              text={error}
            />
          )}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-neutral-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <Sparkles className="size-6" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Platillos visibles
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Puedes mostrar hasta cinco platillos en tu perfil público.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-sm sm:justify-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                En tu perfil
              </p>

              <p className="mt-1 text-lg font-bold text-neutral-950">
                {featuredCount}/5
              </p>
            </div>

            <div className="flex gap-1">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <span
                  key={index}
                  className={[
                    "size-2.5 rounded-full",
                    index < featuredCount
                      ? "bg-amber-400"
                      : "bg-neutral-200",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(
                (current) => !current,
              );
            }}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-neutral-950/15 transition hover:bg-neutral-800 sm:w-auto"
          >
            {showCreateForm ? (
              <ChevronUp className="size-5" />
            ) : (
              <Plus className="size-5" />
            )}

            {showCreateForm
              ? "Cerrar formulario"
              : "Agregar platillo"}
          </button>

          {showCreateForm && (
            <form
              action={createProduct}
              className="mt-6 grid gap-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 lg:grid-cols-2"
            >
              <div className="space-y-2">
                <label
                  htmlFor="new-product-name"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Nombre del platillo
                </label>

                <input
                  id="new-product-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Ej. Alitas BBQ"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="new-product-price"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Precio
                </label>

                <input
                  id="new-product-price"
                  name="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="999999"
                  step="0.01"
                  required
                  placeholder="185.00"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label
                  htmlFor="new-product-description"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Descripción
                </label>

                <textarea
                  id="new-product-description"
                  name="description"
                  rows={4}
                  maxLength={500}
                  placeholder="Describe brevemente el platillo."
                  className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="lg:col-span-2">
                <ProductImageInput id="new-product-image" />

                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  JPG, PNG o WebP. Máximo 5 MB. Recomendado: 1200 × 900 px.
                </p>
              </div>

              <div className="lg:col-span-2">
                <SubmitButton
                  label="Crear platillo"
                  pendingLabel="Creando platillo..."
                  icon={Plus}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                />
              </div>
            </form>
          )}
        </div>
      </section>

      {products.length > 0 ? (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-neutral-950">
              Todos los platillos
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {products.length === 1
                ? "1 platillo registrado"
                : `${products.length} platillos registrados`}
            </p>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  featuredCount={
                    featuredCount
                  }
                />
              ),
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
            <UtensilsCrossed className="size-8" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-neutral-950">
            Aún no tienes platillos
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Agrega tu primer platillo para comenzar a construir el perfil gastronómico del restaurante.
          </p>
        </section>
      )}
    </div>
  );
}
