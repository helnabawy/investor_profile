-- Price growth since launch, per unit type, shown as charts on the project page.
-- Shape (validated in the app, src/lib/price-growth.ts):
--   { label?, beforeLabel?, nowLabel?, note?,
--     units: [{ unit, size?, before, now, psfBefore?, psfNow?, paid? }] }
alter table public.projects add column price_growth jsonb
  check (price_growth is null or jsonb_typeof(price_growth) = 'object');
