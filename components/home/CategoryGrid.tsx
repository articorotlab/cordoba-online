import { homeCategories } from "@/constants/home-categories";

import { CategoryCard } from "./CategoryCard";

const visibleCategoryTitles = new Set([
  "Comer",
  "Comprar",
]);

export function CategoryGrid() {
  const visibleCategories = homeCategories.filter(
    (category) => {
      return visibleCategoryTitles.has(category.title);
    },
  );

  return (
    <section aria-labelledby="categories-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
          Explora la ciudad
        </p>

        <h2
          id="categories-title"
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
        >
          Navega por nuestras secciones principales
        </h2>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
        {visibleCategories.map((category) => (
          <CategoryCard
            key={category.title}
            category={category}
          />
        ))}
      </div>
    </section>
  );
}