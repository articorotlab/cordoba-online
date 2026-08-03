begin;

-- =========================================================
-- ÍNDICE PARA CONSULTAR PROMOCIONES POR DÍA
-- =========================================================

create index if not exists
  restaurant_promotion_days_day_promotion_idx
on public.restaurant_promotion_days (
  day,
  promotion_id
);

-- =========================================================
-- OBTENER PROMOCIONES PÚBLICAS PAGINADAS
-- =========================================================

create or replace function public.get_public_promotions_page(
  p_selected_date date,
  p_day text,
  p_offset integer default 0,
  p_limit integer default 16
)
returns table (
  promotion_id uuid,
  promotion_title text,
  promotion_description text,
  promotion_price numeric,
  promotion_image_url text,
  promotion_start_time time without time zone,
  promotion_end_time time without time zone,
  promotion_valid_from date,
  promotion_valid_until date,
  promotion_active boolean,
  promotion_position integer,
  promotion_days text[],
  restaurant_id uuid,
  restaurant_slug text,
  restaurant_name text,
  restaurant_zone text,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with filtered_promotions as (
    select
      promotion.id as promotion_id,
      promotion.title as promotion_title,
      promotion.description as promotion_description,
      promotion.price as promotion_price,
      promotion.image_url as promotion_image_url,
      promotion.start_time as promotion_start_time,
      promotion.end_time as promotion_end_time,
      promotion.valid_from as promotion_valid_from,
      promotion.valid_until as promotion_valid_until,
      promotion.active as promotion_active,
      promotion.position as promotion_position,

      restaurant.id as restaurant_id,
      restaurant.slug as restaurant_slug,
      restaurant.name as restaurant_name,
      restaurant.zone as restaurant_zone

    from public.restaurant_promotions as promotion

    inner join public.restaurants as restaurant
      on restaurant.id = promotion.restaurant_id

    where
      restaurant.is_active = true
      and promotion.active = true

      and (
        promotion.valid_from is null
        or promotion.valid_from <= p_selected_date
      )

      and (
        promotion.valid_until is null
        or promotion.valid_until >= p_selected_date
      )

      and exists (
        select 1
        from public.restaurant_promotion_days as selected_day
        where
          selected_day.promotion_id = promotion.id
          and selected_day.day::text = p_day
      )
  )

  select
    filtered.promotion_id,
    filtered.promotion_title,
    filtered.promotion_description,
    filtered.promotion_price,
    filtered.promotion_image_url,
    filtered.promotion_start_time,
    filtered.promotion_end_time,
    filtered.promotion_valid_from,
    filtered.promotion_valid_until,
    filtered.promotion_active,
    filtered.promotion_position,

    coalesce(
      (
        select array_agg(
          promotion_day.day::text
          order by
            case promotion_day.day::text
              when 'lunes' then 1
              when 'martes' then 2
              when 'miércoles' then 3
              when 'jueves' then 4
              when 'viernes' then 5
              when 'sábado' then 6
              when 'domingo' then 7
              else 8
            end
        )
        from public.restaurant_promotion_days as promotion_day
        where
          promotion_day.promotion_id =
            filtered.promotion_id
      ),
      array[]::text[]
    ) as promotion_days,

    filtered.restaurant_id,
    filtered.restaurant_slug,
    filtered.restaurant_name,
    filtered.restaurant_zone,

    count(*) over() as total_count

  from filtered_promotions as filtered

  order by
    case
      when filtered.promotion_price is null
        then 1
      else 0
    end asc,

    filtered.promotion_price asc nulls last,

    case
      when filtered.promotion_price is null
        then filtered.promotion_position
      else 0
    end asc,

    filtered.promotion_title asc,
    filtered.promotion_id asc

  limit least(
    greatest(p_limit, 1),
    16
  )

  offset greatest(
    p_offset,
    0
  );
$$;

revoke all
on function public.get_public_promotions_page(
  date,
  text,
  integer,
  integer
)
from public;

revoke all
on function public.get_public_promotions_page(
  date,
  text,
  integer,
  integer
)
from anon;

revoke all
on function public.get_public_promotions_page(
  date,
  text,
  integer,
  integer
)
from authenticated;

grant execute
on function public.get_public_promotions_page(
  date,
  text,
  integer,
  integer
)
to service_role;

commit;