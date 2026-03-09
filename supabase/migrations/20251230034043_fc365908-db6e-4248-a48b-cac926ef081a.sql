-- Add new columns to hospitals table for Chandigarh Hospital Finder
ALTER TABLE public.hospitals 
ADD COLUMN IF NOT EXISTS emergency_services boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS available_24x7 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS sector text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON public.hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_type ON public.hospitals(type);
CREATE INDEX IF NOT EXISTS idx_hospitals_sector ON public.hospitals(sector);
CREATE INDEX IF NOT EXISTS idx_hospitals_emergency ON public.hospitals(emergency_services);
CREATE INDEX IF NOT EXISTS idx_hospitals_24x7 ON public.hospitals(available_24x7);