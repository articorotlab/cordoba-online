import type { PublicRestaurantPromotion } from "@/types/public-restaurants";

export function formatPromotionPrice(
  price: number | null,
): string | null {
  if (price === null) {
    return null;
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: Number.isInteger(price)
      ? 0
      : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function comparePromotionsByPrice(
  firstPromotion: PublicRestaurantPromotion,
  secondPromotion: PublicRestaurantPromotion,
): number {
  if (
    firstPromotion.price === null &&
    secondPromotion.price === null
  ) {
    const positionDifference =
      firstPromotion.position -
      secondPromotion.position;

    if (positionDifference !== 0) {
      return positionDifference;
    }

    return firstPromotion.title.localeCompare(
      secondPromotion.title,
      "es-MX",
    );
  }

  if (firstPromotion.price === null) {
    return 1;
  }

  if (secondPromotion.price === null) {
    return -1;
  }

  const priceDifference =
    firstPromotion.price -
    secondPromotion.price;

  if (priceDifference !== 0) {
    return priceDifference;
  }

  return firstPromotion.title.localeCompare(
    secondPromotion.title,
    "es-MX",
  );
}