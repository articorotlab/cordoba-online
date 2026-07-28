import { foodCategories } from "@/constants/food-categories";

export function FoodCategoryFilter() {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-2">
        {foodCategories.map((category, index) => (
          <button
            key={category}
            type="button"
            className={[
              "rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
              index === 0
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950",
            ].join(" ")}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}