import { Utensils } from "lucide-react";

import { getImageVariantUrl } from "@/lib/images/storage-url";

import type { PublicRestaurant } from "@/types/public-restaurants";


type RestaurantProduct =
  PublicRestaurant["products"][number];

type RestaurantProductCardProps = {
  product: RestaurantProduct;
};

function formatPrice(price: number | null): string | null {
  if (price === null) {
    return null;
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function RestaurantProductCard({
  product,
}: RestaurantProductCardProps) {
  const formattedPrice = formatPrice(product.price);

  const productDisplayUrl =
  getImageVariantUrl(
    product.image,
    "display",
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-white">
        {productDisplayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={productDisplayUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-[1.5rem] bg-white/80 shadow-sm backdrop-blur-sm">
            <Utensils
              aria-hidden="true"
              className="size-9 text-orange-400 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        )}

        {product.featured && (
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-orange-600 shadow-sm backdrop-blur-md">
            Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold leading-tight text-slate-950">
            {product.name}
          </h3>

          {formattedPrice && (
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
              {formattedPrice}
            </span>
          )}
        </div>

        {product.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {product.description}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Consulta directamente con el restaurante para conocer
            más detalles.
          </p>
        )}
      </div>
    </article>
  );
}