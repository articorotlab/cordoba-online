import {
  Camera,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import type { PublicRestaurant } from "@/types/public-restaurants";

type RestaurantContactCardProps = {
  restaurant: PublicRestaurant;
};

function getWhatsAppUrl(
  whatsapp: string | null,
): string | null {
  if (!whatsapp) {
    return null;
  }

  const phoneNumber = whatsapp.replace(/\D/g, "");

  if (!phoneNumber) {
    return null;
  }

  const numberWithCountryCode = phoneNumber.startsWith("52")
    ? phoneNumber
    : `52${phoneNumber}`;

  return `https://wa.me/${numberWithCountryCode}`;
}

function getInstagramUrl(
  instagram: string | null,
): string | null {
  if (!instagram) {
    return null;
  }

  const username = instagram
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/\/$/, "");

  if (!username) {
    return null;
  }

  return `https://instagram.com/${username}`;
}

function getDirectionsUrl(
  restaurant: PublicRestaurant,
): string | null {
  if (
    restaurant.latitude !== null &&
    restaurant.longitude !== null
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
  }

  if (restaurant.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      restaurant.address,
    )}`;
  }

  return null;
}

export function RestaurantContactCard({
  restaurant,
}: RestaurantContactCardProps) {
  const whatsappUrl = getWhatsAppUrl(restaurant.whatsapp);
  const instagramUrl = getInstagramUrl(restaurant.instagram);
  const directionsUrl = getDirectionsUrl(restaurant);

  const instagramUsername = restaurant.instagram
    ?.trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/\/$/, "");

  const hasContactInformation = Boolean(
    whatsappUrl ||
      restaurant.phone ||
      instagramUrl ||
      directionsUrl,
  );

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-blue-100/60 blur-3xl"
      />

      <div className="relative">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
          Información
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Contacto y ubicación
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Comunícate directamente con el restaurante o consulta
          cómo llegar.
        </p>

        {hasContactInformation ? (
          <div className="mt-6 space-y-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <span className="inline-flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <MessageCircle
                      aria-hidden="true"
                      className="size-5 text-emerald-600"
                    />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-slate-500">
                      Mensaje directo
                    </span>

                    <span className="block truncate font-semibold text-slate-800">
                      WhatsApp
                    </span>
                  </span>
                </span>

                <ExternalLink
                  aria-hidden="true"
                  className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}

            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <span className="inline-flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Phone
                      aria-hidden="true"
                      className="size-5 text-blue-600"
                    />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-slate-500">
                      Llamar
                    </span>

                    <span className="block truncate font-semibold text-slate-800">
                      {restaurant.phone}
                    </span>
                  </span>
                </span>

                <ExternalLink
                  aria-hidden="true"
                  className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}

            {instagramUrl && instagramUsername && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-fuchsia-200 hover:bg-fuchsia-50/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2"
              >
                <span className="inline-flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50">
                    <Camera
                      aria-hidden="true"
                      className="size-5 text-fuchsia-600"
                    />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-slate-500">
                      Instagram
                    </span>

                    <span className="block truncate font-semibold text-slate-800">
                      @{instagramUsername}
                    </span>
                  </span>
                </span>

                <ExternalLink
                  aria-hidden="true"
                  className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}

            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                <span className="inline-flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <MapPin
                      aria-hidden="true"
                      className="size-5 text-orange-600"
                    />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-slate-500">
                      Cómo llegar
                    </span>

                    <span className="block min-w-0 font-semibold leading-5 text-slate-800">
                      {restaurant.address || "Ver ubicación en el mapa"}
                    </span>
                  </span>
                </span>

                <ExternalLink
                  aria-hidden="true"
                  className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <MapPin
              aria-hidden="true"
              className="mx-auto size-7 text-slate-400"
            />

            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              Este restaurante todavía no ha publicado información
              de contacto.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}