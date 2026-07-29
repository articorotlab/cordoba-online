import type {
  DatabaseRestaurant,
  DatabaseRestaurantProduct,
  DatabaseRestaurantPromotion,
  DatabaseRestaurantSchedule,
  DatabaseWeekDay,
} from "@/types/database-restaurants";

import type {
  PublicRestaurant,
  PublicRestaurantProduct,
  PublicRestaurantPromotion,
  PublicRestaurantSchedule,
} from "@/types/public-restaurants";

const weekDayPosition: Record<DatabaseWeekDay, number> = {
  lunes: 1,
  martes: 2,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6,
  domingo: 7,
};

function normalizeTime(
  value: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.slice(0, 5);
}

export function mapRestaurantProduct(
  product: DatabaseRestaurantProduct,
): PublicRestaurantProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image_url,
    featured: product.featured,
    active: product.active,
  };
}

export function mapRestaurantPromotion(
  promotion: DatabaseRestaurantPromotion,
): PublicRestaurantPromotion {
  return {
    id: promotion.id,
    title: promotion.title,
    description: promotion.description,
    price: promotion.price,
    image: promotion.image_url,
    days: promotion.days
      .map((item) => item.day)
      .sort((firstDay, secondDay) => {
        return (
          weekDayPosition[firstDay] -
          weekDayPosition[secondDay]
        );
      }),
    startTime: normalizeTime(promotion.start_time),
    endTime: normalizeTime(promotion.end_time),
    validFrom: promotion.valid_from ?? undefined,
    validUntil: promotion.valid_until ?? undefined,
    active: promotion.active,
    position: promotion.position,
  };
}

export function mapRestaurantSchedule(
  schedule: DatabaseRestaurantSchedule,
): PublicRestaurantSchedule {
  return {
    id: schedule.id,
    day: schedule.day,
    opensAt: schedule.opens_at
      ? schedule.opens_at.slice(0, 5)
      : null,
    closesAt: schedule.closes_at
      ? schedule.closes_at.slice(0, 5)
      : null,
    closed: schedule.closed,
  };
}

export function mapRestaurant(
  restaurant: DatabaseRestaurant,
): PublicRestaurant {
  const products = restaurant.products ?? [];
  const promotions = restaurant.promotions ?? [];
  const schedule = restaurant.schedule ?? [];

  return {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    category: restaurant.category,
    description: restaurant.description,
    zone: restaurant.zone,
    address: restaurant.address,
    phone: restaurant.phone,
    whatsapp: restaurant.whatsapp,
    instagram: restaurant.instagram,
    logo: restaurant.logo_url,
    cover: restaurant.cover_url,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,

    products: products.map(mapRestaurantProduct),

    promotions: promotions
      .map(mapRestaurantPromotion)
      .sort((firstPromotion, secondPromotion) => {
        return firstPromotion.position - secondPromotion.position;
      }),

    schedule: schedule
      .map(mapRestaurantSchedule)
      .sort((firstSchedule, secondSchedule) => {
        return (
          weekDayPosition[firstSchedule.day] -
          weekDayPosition[secondSchedule.day]
        );
      }),
  };
}