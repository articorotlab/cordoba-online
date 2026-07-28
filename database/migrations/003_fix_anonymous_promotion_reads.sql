begin;

-- =========================================================
-- CÓRDOBA.ONLINE
-- MIGRACIÓN 003
--
-- Permite que las consultas públicas incluyan relaciones
-- anidadas de promociones sin revelar ninguna promoción.
--
-- GRANT permite acceder técnicamente a las tablas.
-- RLS continúa bloqueando todas las filas para anon porque
-- no existe ninguna política SELECT destinada a ese rol.
-- =========================================================


-- =========================================================
-- 1. PERMITIR QUE ANON CONSULTE LA TABLA DE PROMOCIONES
-- =========================================================

grant select
on public.restaurant_promotions
to anon;


-- =========================================================
-- 2. PERMITIR QUE ANON CONSULTE LOS DÍAS DE PROMOCIONES
-- =========================================================

grant select
on public.restaurant_promotion_days
to anon;


-- =========================================================
-- 3. ASEGURAR QUE NO EXISTA UNA POLÍTICA PÚBLICA
-- =========================================================

drop policy if exists
  "Anonymous users can read promotions"
on public.restaurant_promotions;

drop policy if exists
  "Public can read promotions"
on public.restaurant_promotions;

drop policy if exists
  "Anonymous users can read promotion days"
on public.restaurant_promotion_days;

drop policy if exists
  "Public can read promotion days"
on public.restaurant_promotion_days;


commit;