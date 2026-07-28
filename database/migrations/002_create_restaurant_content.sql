begin;

-- =========================================================
-- CÓRDOBA.ONLINE
-- MIGRACIÓN 002
--
-- Crea:
--   - productos de restaurantes;
--   - promociones;
--   - días de las promociones;
--   - horarios;
--   - índices;
--   - triggers;
--   - políticas RLS;
--   - privilegios.
-- =========================================================


-- =========================================================
-- 1. TIPO PARA DÍAS DE LA SEMANA
-- =========================================================

do $$
begin
  create type public.week_day as enum (
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
    'domingo'
  );
exception
  when duplicate_object then null;
end;
$$;


-- =========================================================
-- 2. TABLA RESTAURANT_PRODUCTS
-- =========================================================

create table if not exists public.restaurant_products (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants(id)
    on delete cascade,

  name text not null
    check (
      char_length(trim(name))
      between 2 and 150
    ),

  description text not null
    default '',

  price numeric(10, 2)
    check (
      price is null
      or price >= 0
    ),

  image_url text,

  featured boolean
    not null
    default false,

  active boolean
    not null
    default true,

  position integer
    not null
    default 0
    check (
      position >= 0
    ),

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);

comment on table public.restaurant_products is
  'Productos y platillos pertenecientes a cada restaurante.';

comment on column public.restaurant_products.featured is
  'Indica si el producto aparece dentro de Top platillos.';

comment on column public.restaurant_products.position is
  'Controla el orden de aparición de los productos.';


-- =========================================================
-- 3. TABLA RESTAURANT_PROMOTIONS
-- =========================================================

create table if not exists public.restaurant_promotions (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants(id)
    on delete cascade,

  title text not null
    check (
      char_length(trim(title))
      between 2 and 150
    ),

  description text not null
    default '',

  image_url text,

  start_time time,

  end_time time,

  valid_from date,

  valid_until date,

  active boolean
    not null
    default true,

  position integer
    not null
    default 0
    check (
      position >= 0
    ),

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint restaurant_promotions_valid_dates
    check (
      valid_from is null
      or valid_until is null
      or valid_until >= valid_from
    ),

  constraint restaurant_promotions_valid_times
    check (
      start_time is null
      or end_time is null
      or end_time > start_time
    )
);

comment on table public.restaurant_promotions is
  'Promociones creadas por cada restaurante.';

comment on column public.restaurant_promotions.valid_from is
  'Fecha inicial opcional de vigencia.';

comment on column public.restaurant_promotions.valid_until is
  'Fecha final opcional de vigencia.';


-- =========================================================
-- 4. TABLA RESTAURANT_PROMOTION_DAYS
-- =========================================================

create table if not exists public.restaurant_promotion_days (
  id uuid primary key
    default gen_random_uuid(),

  promotion_id uuid not null
    references public.restaurant_promotions(id)
    on delete cascade,

  day public.week_day not null,

  created_at timestamptz
    not null
    default now(),

  constraint restaurant_promotion_days_unique
    unique (
      promotion_id,
      day
    )
);

comment on table public.restaurant_promotion_days is
  'Días de la semana en los que está disponible una promoción.';


-- =========================================================
-- 5. TABLA RESTAURANT_SCHEDULES
-- =========================================================

create table if not exists public.restaurant_schedules (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants(id)
    on delete cascade,

  day public.week_day not null,

  opens_at time,

  closes_at time,

  closed boolean
    not null
    default false,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint restaurant_schedules_unique_day
    unique (
      restaurant_id,
      day
    ),

  constraint restaurant_schedules_valid_hours
    check (
      closed = true
      or (
        opens_at is not null
        and closes_at is not null
        and closes_at > opens_at
      )
    )
);

comment on table public.restaurant_schedules is
  'Horarios semanales de operación de cada restaurante.';


-- =========================================================
-- 6. ÍNDICES DE PRODUCTOS
-- =========================================================

create index if not exists
  restaurant_products_restaurant_id_idx
on public.restaurant_products(
  restaurant_id
);

create index if not exists
  restaurant_products_public_listing_idx
on public.restaurant_products(
  restaurant_id,
  active,
  featured,
  position
);

create index if not exists
  restaurant_products_position_idx
on public.restaurant_products(
  restaurant_id,
  position
);


-- =========================================================
-- 7. ÍNDICES DE PROMOCIONES
-- =========================================================

create index if not exists
  restaurant_promotions_restaurant_id_idx
on public.restaurant_promotions(
  restaurant_id
);

create index if not exists
  restaurant_promotions_active_idx
on public.restaurant_promotions(
  active
);

create index if not exists
  restaurant_promotions_validity_idx
on public.restaurant_promotions(
  valid_from,
  valid_until
);

create index if not exists
  restaurant_promotions_listing_idx
on public.restaurant_promotions(
  restaurant_id,
  active,
  position
);

create index if not exists
  restaurant_promotion_days_promotion_id_idx
on public.restaurant_promotion_days(
  promotion_id
);

create index if not exists
  restaurant_promotion_days_day_idx
on public.restaurant_promotion_days(
  day
);


-- =========================================================
-- 8. ÍNDICES DE HORARIOS
-- =========================================================

create index if not exists
  restaurant_schedules_restaurant_id_idx
on public.restaurant_schedules(
  restaurant_id
);


-- =========================================================
-- 9. TRIGGERS UPDATED_AT
-- =========================================================

drop trigger if exists
  restaurant_products_set_updated_at
on public.restaurant_products;

create trigger restaurant_products_set_updated_at
before update
on public.restaurant_products
for each row
execute function public.set_updated_at();


drop trigger if exists
  restaurant_promotions_set_updated_at
on public.restaurant_promotions;

create trigger restaurant_promotions_set_updated_at
before update
on public.restaurant_promotions
for each row
execute function public.set_updated_at();


drop trigger if exists
  restaurant_schedules_set_updated_at
on public.restaurant_schedules;

create trigger restaurant_schedules_set_updated_at
before update
on public.restaurant_schedules
for each row
execute function public.set_updated_at();


-- =========================================================
-- 10. FUNCIÓN PARA COMPROBAR SI UNA PROMOCIÓN
--     PERTENECE A UN RESTAURANTE DEL USUARIO
-- =========================================================

create or replace function public.is_promotion_restaurant_member(
  target_promotion_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_promotions as promotion
    join public.restaurant_members as membership
      on membership.restaurant_id =
        promotion.restaurant_id
    where promotion.id = target_promotion_id
      and membership.user_id =
        (select auth.uid())
  );
$$;

revoke all
on function public.is_promotion_restaurant_member(uuid)
from public;

grant execute
on function public.is_promotion_restaurant_member(uuid)
to authenticated;


-- =========================================================
-- 11. HABILITAR RLS
-- =========================================================

alter table public.restaurant_products
  enable row level security;

alter table public.restaurant_promotions
  enable row level security;

alter table public.restaurant_promotion_days
  enable row level security;

alter table public.restaurant_schedules
  enable row level security;


-- =========================================================
-- 12. ELIMINAR POLÍTICAS PREVIAS DE PRODUCTOS
-- =========================================================

drop policy if exists
  "Public can read active restaurant products"
on public.restaurant_products;

drop policy if exists
  "Members can read own restaurant products"
on public.restaurant_products;

drop policy if exists
  "Members can insert own restaurant products"
on public.restaurant_products;

drop policy if exists
  "Members can update own restaurant products"
on public.restaurant_products;

drop policy if exists
  "Members can delete own restaurant products"
on public.restaurant_products;

drop policy if exists
  "Admins can manage restaurant products"
on public.restaurant_products;


-- =========================================================
-- 13. POLÍTICAS RLS DE PRODUCTOS
-- =========================================================

create policy
  "Public can read active restaurant products"
on public.restaurant_products
for select
to anon, authenticated
using (
  active = true
  and exists (
    select 1
    from public.restaurants
    where restaurants.id =
      restaurant_products.restaurant_id
      and restaurants.is_active = true
  )
);


create policy
  "Members can read own restaurant products"
on public.restaurant_products
for select
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can insert own restaurant products"
on public.restaurant_products
for insert
to authenticated
with check (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can update own restaurant products"
on public.restaurant_products
for update
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
)
with check (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can delete own restaurant products"
on public.restaurant_products
for delete
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Admins can manage restaurant products"
on public.restaurant_products
for all
to authenticated
using (
  (select public.is_platform_admin())
)
with check (
  (select public.is_platform_admin())
);


-- =========================================================
-- 14. ELIMINAR POLÍTICAS PREVIAS DE PROMOCIONES
-- =========================================================

drop policy if exists
  "Authenticated users can read active promotions"
on public.restaurant_promotions;

drop policy if exists
  "Members can read own restaurant promotions"
on public.restaurant_promotions;

drop policy if exists
  "Members can insert own restaurant promotions"
on public.restaurant_promotions;

drop policy if exists
  "Members can update own restaurant promotions"
on public.restaurant_promotions;

drop policy if exists
  "Members can delete own restaurant promotions"
on public.restaurant_promotions;

drop policy if exists
  "Admins can manage restaurant promotions"
on public.restaurant_promotions;


-- =========================================================
-- 15. POLÍTICAS RLS DE PROMOCIONES
-- =========================================================

create policy
  "Authenticated users can read active promotions"
on public.restaurant_promotions
for select
to authenticated
using (
  active = true
  and (
    valid_from is null
    or valid_from <= current_date
  )
  and (
    valid_until is null
    or valid_until >= current_date
  )
  and exists (
    select 1
    from public.restaurants
    where restaurants.id =
      restaurant_promotions.restaurant_id
      and restaurants.is_active = true
  )
);


create policy
  "Members can read own restaurant promotions"
on public.restaurant_promotions
for select
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can insert own restaurant promotions"
on public.restaurant_promotions
for insert
to authenticated
with check (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can update own restaurant promotions"
on public.restaurant_promotions
for update
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
)
with check (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can delete own restaurant promotions"
on public.restaurant_promotions
for delete
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Admins can manage restaurant promotions"
on public.restaurant_promotions
for all
to authenticated
using (
  (select public.is_platform_admin())
)
with check (
  (select public.is_platform_admin())
);


-- =========================================================
-- 16. ELIMINAR POLÍTICAS DE DÍAS DE PROMOCIONES
-- =========================================================

drop policy if exists
  "Authenticated users can read active promotion days"
on public.restaurant_promotion_days;

drop policy if exists
  "Members can read own promotion days"
on public.restaurant_promotion_days;

drop policy if exists
  "Members can insert own promotion days"
on public.restaurant_promotion_days;

drop policy if exists
  "Members can update own promotion days"
on public.restaurant_promotion_days;

drop policy if exists
  "Members can delete own promotion days"
on public.restaurant_promotion_days;

drop policy if exists
  "Admins can manage promotion days"
on public.restaurant_promotion_days;


-- =========================================================
-- 17. POLÍTICAS DE DÍAS DE PROMOCIONES
-- =========================================================

create policy
  "Authenticated users can read active promotion days"
on public.restaurant_promotion_days
for select
to authenticated
using (
  exists (
    select 1
    from public.restaurant_promotions as promotion
    join public.restaurants as restaurant
      on restaurant.id =
        promotion.restaurant_id
    where promotion.id =
      restaurant_promotion_days.promotion_id
      and promotion.active = true
      and (
        promotion.valid_from is null
        or promotion.valid_from <= current_date
      )
      and (
        promotion.valid_until is null
        or promotion.valid_until >= current_date
      )
      and restaurant.is_active = true
  )
);


create policy
  "Members can read own promotion days"
on public.restaurant_promotion_days
for select
to authenticated
using (
  (
    select public.is_promotion_restaurant_member(
      promotion_id
    )
  )
);


create policy
  "Members can insert own promotion days"
on public.restaurant_promotion_days
for insert
to authenticated
with check (
  (
    select public.is_promotion_restaurant_member(
      promotion_id
    )
  )
);


create policy
  "Members can update own promotion days"
on public.restaurant_promotion_days
for update
to authenticated
using (
  (
    select public.is_promotion_restaurant_member(
      promotion_id
    )
  )
)
with check (
  (
    select public.is_promotion_restaurant_member(
      promotion_id
    )
  )
);


create policy
  "Members can delete own promotion days"
on public.restaurant_promotion_days
for delete
to authenticated
using (
  (
    select public.is_promotion_restaurant_member(
      promotion_id
    )
  )
);


create policy
  "Admins can manage promotion days"
on public.restaurant_promotion_days
for all
to authenticated
using (
  (select public.is_platform_admin())
)
with check (
  (select public.is_platform_admin())
);


-- =========================================================
-- 18. ELIMINAR POLÍTICAS DE HORARIOS
-- =========================================================

drop policy if exists
  "Public can read active restaurant schedules"
on public.restaurant_schedules;

drop policy if exists
  "Members can read own restaurant schedules"
on public.restaurant_schedules;

drop policy if exists
  "Members can insert own restaurant schedules"
on public.restaurant_schedules;

drop policy if exists
  "Members can update own restaurant schedules"
on public.restaurant_schedules;

drop policy if exists
  "Members can delete own restaurant schedules"
on public.restaurant_schedules;

drop policy if exists
  "Admins can manage restaurant schedules"
on public.restaurant_schedules;


-- =========================================================
-- 19. POLÍTICAS RLS DE HORARIOS
-- =========================================================

create policy
  "Public can read active restaurant schedules"
on public.restaurant_schedules
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.restaurants
    where restaurants.id =
      restaurant_schedules.restaurant_id
      and restaurants.is_active = true
  )
);


create policy
  "Members can read own restaurant schedules"
on public.restaurant_schedules
for select
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can insert own restaurant schedules"
on public.restaurant_schedules
for insert
to authenticated
with check (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can update own restaurant schedules"
on public.restaurant_schedules
for update
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
)
with check (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Members can delete own restaurant schedules"
on public.restaurant_schedules
for delete
to authenticated
using (
  (select public.is_restaurant_member(
    restaurant_id
  ))
);


create policy
  "Admins can manage restaurant schedules"
on public.restaurant_schedules
for all
to authenticated
using (
  (select public.is_platform_admin())
)
with check (
  (select public.is_platform_admin())
);


-- =========================================================
-- 20. PRIVILEGIOS DE PRODUCTOS
-- =========================================================

grant select
on public.restaurant_products
to anon;

grant select, insert, update, delete
on public.restaurant_products
to authenticated;

grant select, insert, update, delete
on public.restaurant_products
to service_role;


-- =========================================================
-- 21. PRIVILEGIOS DE PROMOCIONES
-- =========================================================

revoke all
on public.restaurant_promotions
from anon;

grant select, insert, update, delete
on public.restaurant_promotions
to authenticated;

grant select, insert, update, delete
on public.restaurant_promotions
to service_role;


-- =========================================================
-- 22. PRIVILEGIOS DE DÍAS DE PROMOCIONES
-- =========================================================

revoke all
on public.restaurant_promotion_days
from anon;

grant select, insert, update, delete
on public.restaurant_promotion_days
to authenticated;

grant select, insert, update, delete
on public.restaurant_promotion_days
to service_role;


-- =========================================================
-- 23. PRIVILEGIOS DE HORARIOS
-- =========================================================

grant select
on public.restaurant_schedules
to anon;

grant select, insert, update, delete
on public.restaurant_schedules
to authenticated;

grant select, insert, update, delete
on public.restaurant_schedules
to service_role;


-- =========================================================
-- 24. LIMITAR COLUMNAS EDITABLES DEL RESTAURANTE
--
-- Los administradores utilizarán posteriormente acciones
-- seguras del servidor para modificar slug, is_active,
-- created_by y otros campos administrativos.
-- =========================================================

revoke update
on public.restaurants
from authenticated;

grant update (
  name,
  category,
  description,
  zone,
  address,
  phone,
  whatsapp,
  instagram,
  logo_url,
  cover_url,
  latitude,
  longitude
)
on public.restaurants
to authenticated;


commit;