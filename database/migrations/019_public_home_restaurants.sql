begin;

-- =========================================================
-- ÍNDICES PARA EL LISTADO PÚBLICO DE RESTAURANTES
-- =========================================================

create index if not exists
  restaurants_public_category_name_idx
on public.restaurants (
  category,
  name,
  id
)
where is_active = true;

create index if not exists
  restaurant_schedules_restaurant_day_idx
on public.restaurant_schedules (
  restaurant_id,
  day
);

create index if not exists
  restaurant_promotions_public_restaurant_idx
on public.restaurant_promotions (
  restaurant_id,
  valid_from,
  valid_until
)
where active = true;

-- =========================================================
-- RESTAURANTES LIGEROS PARA /COMER
--
-- Devuelve únicamente:
--   - información de la tarjeta;
--   - si está abierto actualmente;
--   - si tiene promoción en la fecha seleccionada;
--   - total de resultados;
--   - máximo 10 registros.
-- =========================================================

create or replace function public.get_public_home_restaurants_page(
  p_selected_date date,
  p_day text,
  p_previous_day text,
  p_current_time time without time zone,
  p_category text default null,
  p_offset integer default 0,
  p_limit integer default 10
)
returns table (
  restaurant_id uuid,
  restaurant_slug text,
  restaurant_name text,
  restaurant_category text,
  restaurant_description text,
  restaurant_zone text,
  restaurant_logo_url text,
  restaurant_cover_url text,
  is_open_now boolean,
  has_promotion_today boolean,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with restaurant_cards as (
    select
      restaurant.id as restaurant_id,
      restaurant.slug as restaurant_slug,
      restaurant.name as restaurant_name,
      restaurant.category as restaurant_category,
      restaurant.description as restaurant_description,
      restaurant.zone as restaurant_zone,
      restaurant.logo_url as restaurant_logo_url,
      restaurant.cover_url as restaurant_cover_url,

      (
        exists (
          select 1
          from public.restaurant_schedules as today_schedule
          where
            today_schedule.restaurant_id = restaurant.id
            and today_schedule.day::text = p_day
            and today_schedule.closed = false
            and today_schedule.opens_at is not null
            and today_schedule.closes_at is not null
            and today_schedule.opens_at <> today_schedule.closes_at
            and (
              (
                today_schedule.closes_at >
                  today_schedule.opens_at
                and p_current_time >=
                  today_schedule.opens_at
                and p_current_time <
                  today_schedule.closes_at
              )
              or
              (
                today_schedule.closes_at <
                  today_schedule.opens_at
                and p_current_time >=
                  today_schedule.opens_at
              )
            )
        )
        or
        exists (
          select 1
          from public.restaurant_schedules as previous_schedule
          where
            previous_schedule.restaurant_id = restaurant.id
            and previous_schedule.day::text = p_previous_day
            and previous_schedule.closed = false
            and previous_schedule.opens_at is not null
            and previous_schedule.closes_at is not null
            and previous_schedule.closes_at <
              previous_schedule.opens_at
            and p_current_time <
              previous_schedule.closes_at
        )
      ) as is_open_now,

      exists (
        select 1
        from public.restaurant_promotions as promotion
        inner join public.restaurant_promotion_days as promotion_day
          on promotion_day.promotion_id = promotion.id
        where
          promotion.restaurant_id = restaurant.id
          and promotion.active = true
          and promotion_day.day::text = p_day
          and (
            promotion.valid_from is null
            or promotion.valid_from <= p_selected_date
          )
          and (
            promotion.valid_until is null
            or promotion.valid_until >= p_selected_date
          )
      ) as has_promotion_today

    from public.restaurants as restaurant

    where
      restaurant.is_active = true
      and (
        p_category is null
        or restaurant.category = p_category
      )
  )

  select
    card.restaurant_id,
    card.restaurant_slug,
    card.restaurant_name,
    card.restaurant_category,
    card.restaurant_description,
    card.restaurant_zone,
    card.restaurant_logo_url,
    card.restaurant_cover_url,
    card.is_open_now,
    card.has_promotion_today,
    count(*) over() as total_count

  from restaurant_cards as card

  order by
    card.is_open_now desc,
    card.has_promotion_today desc,
    card.restaurant_name asc,
    card.restaurant_id asc

  limit least(
    greatest(p_limit, 1),
    10
  )

  offset greatest(
    p_offset,
    0
  );
$$;

revoke all
on function public.get_public_home_restaurants_page(
  date,
  text,
  text,
  time without time zone,
  text,
  integer,
  integer
)
from public;

revoke all
on function public.get_public_home_restaurants_page(
  date,
  text,
  text,
  time without time zone,
  text,
  integer,
  integer
)
from anon;

revoke all
on function public.get_public_home_restaurants_page(
  date,
  text,
  text,
  time without time zone,
  text,
  integer,
  integer
)
from authenticated;

grant execute
on function public.get_public_home_restaurants_page(
  date,
  text,
  text,
  time without time zone,
  text,
  integer,
  integer
)
to service_role;

commit;