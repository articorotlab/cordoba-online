begin;

-- =========================================================
-- DIRECTORIO PÚBLICO DE RESTAURANTES
--
-- Devuelve:
--   - datos ligeros para la tarjeta;
--   - estado abierto/cerrado calculado en PostgreSQL;
--   - total de resultados;
--   - paginación máxima de 10 restaurantes.
--
-- Orden:
--   1. Restaurantes abiertos.
--   2. Restaurantes cerrados.
--   3. Nombre alfabético.
-- =========================================================

create or replace function public.get_public_restaurant_directory_page(
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
  is_open_now boolean,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with directory_restaurants as (
    select
      restaurant.id as restaurant_id,
      restaurant.slug as restaurant_slug,
      restaurant.name as restaurant_name,
      restaurant.category as restaurant_category,
      restaurant.description as restaurant_description,
      restaurant.zone as restaurant_zone,
      restaurant.logo_url as restaurant_logo_url,

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
            and today_schedule.opens_at <>
              today_schedule.closes_at
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
      ) as is_open_now

    from public.restaurants as restaurant

    where
      restaurant.is_active = true
      and (
        p_category is null
        or restaurant.category = p_category
      )
  )

  select
    directory.restaurant_id,
    directory.restaurant_slug,
    directory.restaurant_name,
    directory.restaurant_category,
    directory.restaurant_description,
    directory.restaurant_zone,
    directory.restaurant_logo_url,
    directory.is_open_now,
    count(*) over() as total_count

  from directory_restaurants as directory

  order by
    directory.is_open_now desc,
    directory.restaurant_name asc,
    directory.restaurant_id asc

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
on function public.get_public_restaurant_directory_page(
  text,
  text,
  time without time zone,
  text,
  integer,
  integer
)
from public;

revoke all
on function public.get_public_restaurant_directory_page(
  text,
  text,
  time without time zone,
  text,
  integer,
  integer
)
from anon;

revoke all
on function public.get_public_restaurant_directory_page(
  text,
  text,
  time without time zone,
  text,
  integer,
  integer
)
from authenticated;

grant execute
on function public.get_public_restaurant_directory_page(
  text,
  text,
  time without time zone,
  text,
  integer,
  integer
)
to service_role;

commit;