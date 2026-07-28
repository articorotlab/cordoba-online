export type WeekDay =
  | "lunes"
  | "martes"
  | "miércoles"
  | "jueves"
  | "viernes"
  | "sábado"
  | "domingo";

export type RestaurantProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  active?: boolean;
};

export type RestaurantPromotion = {
  id: string;
  title: string;
  description: string;
  image: string;
  days: WeekDay[];
  startTime?: string;
  endTime?: string;
  active: boolean;
};

export type RestaurantSchedule = {
  day: string;
  opensAt: string | null;
  closesAt: string | null;
  closed: boolean;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  zone: string;
  address: string;
  whatsapp: string;
  phone?: string;
  instagram?: string;

  /**
   * Logo principal del restaurante.
   * Sustituirá la imagen grande de portada.
   */
  logoImage?: string;

  /**
   * Campo anterior. Lo conservamos temporalmente para no romper
   * los componentes que todavía lo usan.
   */
  coverImage: string;

  isOpen: boolean;

  /**
   * Campo temporal. Después se calculará automáticamente
   * usando el arreglo de promociones.
   */
  hasPromotions: boolean;

  /**
   * Las promociones todavía son opcionales para poder migrar
   * los datos poco a poco.
   */
  promotions?: RestaurantPromotion[];

  latitude?: number;
  longitude?: number;
  products: RestaurantProduct[];
  schedule: RestaurantSchedule[];
};