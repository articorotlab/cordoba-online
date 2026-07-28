export const foodCategories = [
  "Todos",
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

export type FoodCategory =
  (typeof foodCategories)[number];