export type DatabaseWeekDay =
  | "lunes"
  | "martes"
  | "miércoles"
  | "jueves"
  | "viernes"
  | "sábado"
  | "domingo";

export type DatabaseRestaurantProduct = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  featured: boolean;
  active: boolean;
  position: number;
};

export type DatabaseRestaurantPromotionDay = {
  id: string;
  day: DatabaseWeekDay;
};

export type DatabaseRestaurantPromotion = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  image_url: string | null;
  start_time: string | null;
  end_time: string | null;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  position: number;
  days: DatabaseRestaurantPromotionDay[];
};

export type DatabaseRestaurantSchedule = {
  id: string;
  day: DatabaseWeekDay;
  opens_at: string | null;
  closes_at: string | null;
  closed: boolean;
};

export type DatabaseRestaurant = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  zone: string;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_url: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  products?: DatabaseRestaurantProduct[];
  promotions?: DatabaseRestaurantPromotion[];
  schedule?: DatabaseRestaurantSchedule[];
};