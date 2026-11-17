-- Device measurements: controller-data GET se aane wale electrical params
ALTER TABLE controllers
  ADD COLUMN IF NOT EXISTS bv numeric,
  ADD COLUMN IF NOT EXISTS bi numeric,
  ADD COLUMN IF NOT EXISTS sv numeric,
  ADD COLUMN IF NOT EXISTS si numeric,
  ADD COLUMN IF NOT EXISTS lv numeric,
  ADD COLUMN IF NOT EXISTS li numeric,
  ADD COLUMN IF NOT EXISTS dod integer;
