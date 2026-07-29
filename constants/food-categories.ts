export const restaurantCategories = [
  "Tacos",
  "Hamburguesas",
  "Alitas",
  "Pizzerías",
  "Mariscos",
  "Cafeterías",
  "Desayunos",
  "Postres",
  "Antojitos",
  "Comida mexicana",
  "Saludable",
  "Fast food",
  "Otros",
] as const;

export const foodCategories = [
  "Todos",
  ...restaurantCategories,
] as const;

export type RestaurantCategory =
  (typeof restaurantCategories)[number];

export type FoodCategory =
  (typeof foodCategories)[number];