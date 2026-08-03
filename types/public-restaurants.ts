import type { DatabaseWeekDay } from "@/types/database-restaurants";

export type PublicRestaurantProduct = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image: string | null;
  featured: boolean;
  active: boolean;
};

export type PublicRestaurantPromotion = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  image: string | null;
  days: DatabaseWeekDay[];
  startTime?: string;
  endTime?: string;
  validFrom?: string;
  validUntil?: string;
  active: boolean;
  position: number;
};

export type PublicPromotionRestaurantSummary = {
  id: string;
  slug: string;
  name: string;
  zone: string;
};

export type PublicRestaurantSchedule = {
  id: string;
  day: DatabaseWeekDay;
  opensAt: string | null;
  closesAt: string | null;
  closed: boolean;
};

export type PublicRestaurantDirectoryItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  zone: string;
  logo: string | null;
  schedule: PublicRestaurantSchedule[];
};

export type PublicRestaurantCardItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  zone: string;
  logo: string | null;
  cover: string | null;
  isOpen: boolean;
  hasPromotionToday: boolean;
};

export type PublicRestaurant = {
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
  logo: string | null;
  cover: string | null;
  latitude: number | null;
  longitude: number | null;
  products: PublicRestaurantProduct[];
  promotions: PublicRestaurantPromotion[];
  schedule: PublicRestaurantSchedule[];
};