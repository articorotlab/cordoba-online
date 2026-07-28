begin;

-- =========================================================
-- CÓRDOBA.ONLINE
-- MIGRACIÓN 001
--
-- Crea:
--   - perfiles de usuarios;
--   - restaurantes;
--   - relación entre usuarios y restaurantes;
--   - funciones auxiliares de autorización;
--   - triggers;
--   - índices;
--   - políticas RLS.
-- =========================================================


-- =========================================================
-- 1. EXTENSIÓN PARA UUID
-- =========================================================

create extension if not exists pgcrypto;


-- =========================================================
-- 2. TIPOS ENUMERADOS
-- =========================================================

do $$
begin
  create type public.platform_role as enum (
    'user',
    'admin'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.restaurant_member_role as enum (
    'owner',
    'editor'
  );
exception
  when duplicate_object then null;
end;
$$;


-- =========================================================
-- 3. FUNCIÓN GENERAL PARA UPDATED_AT
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =========================================================
-- 4. TABLA PROFILES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text not null
    check (char_length(trim(full_name)) between 2 and 120),

  phone text,

  platform_role public.platform_role
    not null
    default 'user',

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);

comment on table public.profiles is
  'Perfil público y rol de plataforma de cada usuario autenticado.';

comment on column public.profiles.platform_role is
  'Rol general en Córdoba Online: user o admin.';


-- =========================================================
-- 5. TABLA RESTAURANTS
-- =========================================================

create table if not exists public.restaurants (
  id uuid primary key
    default gen_random_uuid(),

  slug text not null unique
    check (
      slug = lower(slug)
      and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  name text not null
    check (char_length(trim(name)) between 2 and 150),

  category text not null
    check (char_length(trim(category)) between 2 and 80),

  description text not null
    default '',

  zone text not null
    default '',

  address text not null
    default '',

  phone text,

  whatsapp text,

  instagram text,

  logo_url text,

  cover_url text,

  latitude numeric(9, 6),

  longitude numeric(9, 6),

  is_active boolean
    not null
    default true,

  created_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint restaurants_latitude_range
    check (
      latitude is null
      or latitude between -90 and 90
    ),

  constraint restaurants_longitude_range
    check (
      longitude is null
      or longitude between -180 and 180
    )
);

comment on table public.restaurants is
  'Información principal de cada restaurante publicado en Córdoba Online.';

comment on column public.restaurants.created_by is
  'Administrador que creó el restaurante.';

comment on column public.restaurants.is_active is
  'Controla si el restaurante puede aparecer públicamente.';


-- =========================================================
-- 6. TABLA RESTAURANT_MEMBERS
-- =========================================================

create table if not exists public.restaurant_members (
  id uuid primary key
    default gen_random_uuid(),

  restaurant_id uuid not null
    references public.restaurants(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  role public.restaurant_member_role
    not null
    default 'editor',

  created_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint restaurant_members_unique_membership
    unique (restaurant_id, user_id)
);

comment on table public.restaurant_members is
  'Relaciona las cuentas autenticadas con los restaurantes que pueden administrar.';

comment on column public.restaurant_members.role is
  'owner tiene control principal; editor puede administrar contenido.';


-- =========================================================
-- 7. ÍNDICES
-- =========================================================

create index if not exists restaurants_is_active_idx
  on public.restaurants(is_active);

create index if not exists restaurants_category_idx
  on public.restaurants(category);

create index if not exists restaurants_zone_idx
  on public.restaurants(zone);

create index if not exists restaurants_created_by_idx
  on public.restaurants(created_by);

create index if not exists restaurant_members_user_id_idx
  on public.restaurant_members(user_id);

create index if not exists restaurant_members_restaurant_id_idx
  on public.restaurant_members(restaurant_id);

create index if not exists restaurant_members_user_restaurant_idx
  on public.restaurant_members(user_id, restaurant_id);


-- =========================================================
-- 8. TRIGGERS UPDATED_AT
-- =========================================================

drop trigger if exists profiles_set_updated_at
  on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


drop trigger if exists restaurants_set_updated_at
  on public.restaurants;

create trigger restaurants_set_updated_at
before update on public.restaurants
for each row
execute function public.set_updated_at();


drop trigger if exists restaurant_members_set_updated_at
  on public.restaurant_members;

create trigger restaurant_members_set_updated_at
before update on public.restaurant_members
for each row
execute function public.set_updated_at();


-- =========================================================
-- 9. TRIGGER PARA CREAR PROFILES AUTOMÁTICAMENTE
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_phone text;
begin
  v_full_name :=
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'full_name',
          ''
        )
      ),
      ''
    );

  v_phone :=
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'phone_number',
          new.phone,
          ''
        )
      ),
      ''
    );

  insert into public.profiles (
    id,
    full_name,
    phone
  )
  values (
    new.id,
    coalesce(
      v_full_name,
      split_part(new.email, '@', 1),
      'Usuario'
    ),
    v_phone
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


drop trigger if exists on_auth_user_created
  on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- =========================================================
-- 10. CREAR PROFILES PARA USUARIOS YA EXISTENTES
-- =========================================================

insert into public.profiles (
  id,
  full_name,
  phone
)
select
  users.id,

  coalesce(
    nullif(
      trim(
        users.raw_user_meta_data ->> 'full_name'
      ),
      ''
    ),
    split_part(users.email, '@', 1),
    'Usuario'
  ),

  nullif(
    trim(
      coalesce(
        users.raw_user_meta_data ->> 'phone_number',
        users.phone,
        ''
      )
    ),
    ''
  )
from auth.users as users
where not exists (
  select 1
  from public.profiles as profiles
  where profiles.id = users.id
);


-- =========================================================
-- 11. FUNCIONES AUXILIARES DE AUTORIZACIÓN
-- =========================================================

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.platform_role = 'admin'
  );
$$;


create or replace function public.is_restaurant_member(
  target_restaurant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_members
    where restaurant_members.restaurant_id =
      target_restaurant_id
      and restaurant_members.user_id =
        (select auth.uid())
  );
$$;


create or replace function public.is_restaurant_owner(
  target_restaurant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_members
    where restaurant_members.restaurant_id =
      target_restaurant_id
      and restaurant_members.user_id =
        (select auth.uid())
      and restaurant_members.role = 'owner'
  );
$$;


revoke all on function public.is_platform_admin()
  from public;

revoke all on function public.is_restaurant_member(uuid)
  from public;

revoke all on function public.is_restaurant_owner(uuid)
  from public;

grant execute on function public.is_platform_admin()
  to authenticated;

grant execute on function public.is_restaurant_member(uuid)
  to authenticated;

grant execute on function public.is_restaurant_owner(uuid)
  to authenticated;


-- =========================================================
-- 12. HABILITAR ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles
  enable row level security;

alter table public.restaurants
  enable row level security;

alter table public.restaurant_members
  enable row level security;


-- =========================================================
-- 13. BORRAR POLÍTICAS PREVIAS
-- =========================================================

drop policy if exists "Users can read own profile"
  on public.profiles;

drop policy if exists "Users can update own profile"
  on public.profiles;

drop policy if exists "Admins can read all profiles"
  on public.profiles;

drop policy if exists "Public can read active restaurants"
  on public.restaurants;

drop policy if exists "Members can read assigned restaurants"
  on public.restaurants;

drop policy if exists "Members can update assigned restaurants"
  on public.restaurants;

drop policy if exists "Admins can manage restaurants"
  on public.restaurants;

drop policy if exists "Members can read own memberships"
  on public.restaurant_members;

drop policy if exists "Admins can manage restaurant memberships"
  on public.restaurant_members;


-- =========================================================
-- 14. POLÍTICAS RLS DE PROFILES
-- =========================================================

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);


create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
)
with check (
  (select auth.uid()) = id
  and platform_role = (
    select current_profile.platform_role
    from public.profiles as current_profile
    where current_profile.id = (select auth.uid())
  )
);


create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  public.is_platform_admin()
);


-- =========================================================
-- 15. POLÍTICAS RLS DE RESTAURANTS
-- =========================================================

create policy "Public can read active restaurants"
on public.restaurants
for select
to anon, authenticated
using (
  is_active = true
);


create policy "Members can read assigned restaurants"
on public.restaurants
for select
to authenticated
using (
  public.is_restaurant_member(id)
);


create policy "Members can update assigned restaurants"
on public.restaurants
for update
to authenticated
using (
  public.is_restaurant_member(id)
)
with check (
  public.is_restaurant_member(id)
);


create policy "Admins can manage restaurants"
on public.restaurants
for all
to authenticated
using (
  public.is_platform_admin()
)
with check (
  public.is_platform_admin()
);


-- =========================================================
-- 16. POLÍTICAS RLS DE RESTAURANT_MEMBERS
-- =========================================================

create policy "Members can read own memberships"
on public.restaurant_members
for select
to authenticated
using (
  user_id = (select auth.uid())
);


create policy "Admins can manage restaurant memberships"
on public.restaurant_members
for all
to authenticated
using (
  public.is_platform_admin()
)
with check (
  public.is_platform_admin()
);


-- =========================================================
-- 17. PRIVILEGIOS
-- =========================================================

grant select, update
on public.profiles
to authenticated;

grant select
on public.restaurants
to anon;

grant select, insert, update, delete
on public.restaurants
to authenticated;

grant select, insert, update, delete
on public.restaurant_members
to authenticated;

grant select, insert, update, delete
on public.profiles
to service_role;

grant select, insert, update, delete
on public.restaurants
to service_role;

grant select, insert, update, delete
on public.restaurant_members
to service_role;


commit;