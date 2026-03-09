-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  manufacturer TEXT,
  price DECIMAL(10,2),
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  specialties TEXT[],
  type TEXT DEFAULT 'hospital',
  rating DECIMAL(2,1) DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Medicines policies (public read, admin write)
CREATE POLICY "Anyone can view medicines" ON public.medicines
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert medicines" ON public.medicines
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update medicines" ON public.medicines
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete medicines" ON public.medicines
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Hospitals policies (public read, admin write)
CREATE POLICY "Anyone can view hospitals" ON public.hospitals
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert hospitals" ON public.hospitals
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hospitals" ON public.hospitals
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hospitals" ON public.hospitals
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.medicines (name, description, manufacturer, price, category, stock_quantity) VALUES
  ('Paracetamol 500mg', 'Pain reliever and fever reducer', 'Cipla', 25.00, 'Pain Relief', 150),
  ('Amoxicillin 250mg', 'Antibiotic for bacterial infections', 'Sun Pharma', 85.00, 'Antibiotics', 80),
  ('Omeprazole 20mg', 'Reduces stomach acid production', 'Dr. Reddys', 45.00, 'Digestive', 120),
  ('Metformin 500mg', 'Controls blood sugar levels', 'Lupin', 35.00, 'Diabetes', 200),
  ('Atorvastatin 10mg', 'Lowers cholesterol levels', 'Zydus', 55.00, 'Cardiovascular', 90),
  ('Cetirizine 10mg', 'Antihistamine for allergies', 'Mankind', 15.00, 'Allergy', 300),
  ('Azithromycin 500mg', 'Antibiotic for various infections', 'Alkem', 120.00, 'Antibiotics', 60),
  ('Pantoprazole 40mg', 'Treats acid reflux and ulcers', 'Torrent', 65.00, 'Digestive', 140);

INSERT INTO public.hospitals (name, city, address, phone, email, specialties, type, rating) VALUES
  ('Apollo Hospital', 'Mumbai', '21 Andheri West, Mumbai 400058', '+91-22-12345678', 'apollo.mumbai@hospital.com', ARRAY['Cardiology', 'Oncology', 'Neurology'], 'hospital', 4.5),
  ('Fortis Healthcare', 'Delhi', 'Sector 44, Gurgaon, Delhi NCR', '+91-11-98765432', 'fortis.delhi@hospital.com', ARRAY['Orthopedics', 'Pediatrics', 'Dermatology'], 'hospital', 4.3),
  ('Max Super Specialty', 'Bangalore', 'BTM Layout, Bangalore 560076', '+91-80-11223344', 'max.blr@hospital.com', ARRAY['Gastroenterology', 'Pulmonology', 'ENT'], 'hospital', 4.6),
  ('Medanta Hospital', 'Delhi', 'Sector 38, Gurgaon, Delhi NCR', '+91-11-55667788', 'medanta@hospital.com', ARRAY['Cardiology', 'Transplant', 'Oncology'], 'hospital', 4.7),
  ('Narayana Health', 'Bangalore', 'Hosur Road, Bangalore 560099', '+91-80-99887766', 'narayana.blr@hospital.com', ARRAY['Cardiac Surgery', 'Nephrology', 'Urology'], 'hospital', 4.4),
  ('AIIMS', 'Delhi', 'Ansari Nagar, New Delhi 110029', '+91-11-26588500', 'aiims@gov.in', ARRAY['General Medicine', 'Surgery', 'Psychiatry'], 'hospital', 4.8),
  ('Dr. Lal PathLabs', 'Mumbai', 'Bandra West, Mumbai 400050', '+91-22-44556677', 'lal.mumbai@labs.com', ARRAY['Pathology', 'Radiology'], 'lab', 4.2),
  ('SRL Diagnostics', 'Chennai', 'T Nagar, Chennai 600017', '+91-44-33445566', 'srl.chennai@labs.com', ARRAY['Blood Tests', 'Imaging'], 'lab', 4.1);