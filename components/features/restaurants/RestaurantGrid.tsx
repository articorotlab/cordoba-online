import {
  RestaurantCard,
} from "@/components/features/restaurants/RestaurantCard";

import type {
  PublicRestaurantCardItem,
} from "@/types/public-restaurants";

type RestaurantGridProps = {
  restaurants:
    PublicRestaurantCardItem[];
};

export function RestaurantGrid({
  restaurants,
}: RestaurantGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {restaurants.map(
        (restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ),
      )}
    </div>
  );
}