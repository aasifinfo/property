CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('broker', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'suspended', 'deactivated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.deal_type AS ENUM ('sale', 'rent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.property_type AS ENUM ('apartment', 'villa', 'townhouse', 'penthouse', 'office', 'retail', 'warehouse', 'land');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.requirement_urgency AS ENUM ('hot', 'active', 'planning');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_type AS ENUM ('listing_enquiry', 'requirement_match');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'won', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  rera_brn text,
  status public.user_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL DEFAULT 'Dubai',
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  phone text,
  role public.user_role NOT NULL DEFAULT 'broker',
  status public.user_status NOT NULL DEFAULT 'pending',
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.broker_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  rera_brn text,
  covered_area_ids uuid[] DEFAULT '{}',
  speciality text,
  experience_years integer,
  whatsapp_number text,
  bio text,
  application_status public.user_status NOT NULL DEFAULT 'pending',
  application_submitted_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  property_type public.property_type NOT NULL,
  deal_type public.deal_type NOT NULL,
  bedrooms integer,
  size_sqft numeric(12,2),
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  developer text,
  price numeric(14,2) NOT NULL CHECK (price >= 0),
  payment_plan text,
  handover_date date,
  yield_percent numeric(5,2),
  notes text,
  description text,
  status public.listing_status NOT NULL DEFAULT 'pending',
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  renewal_due_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  deal_type public.deal_type NOT NULL,
  property_type public.property_type NOT NULL,
  bedrooms integer,
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  budget_min numeric(14,2),
  budget_max numeric(14,2),
  urgency public.requirement_urgency NOT NULL DEFAULT 'active',
  notes text,
  posted_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  requirement_id uuid REFERENCES public.requirements(id) ON DELETE SET NULL,
  from_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lead_type public.lead_type NOT NULL,
  lead_status public.lead_status NOT NULL DEFAULT 'new',
  message text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  preferred_channel text NOT NULL DEFAULT 'both',
  email_triggered_at timestamptz,
  whatsapp_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commission_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
  co_broke_percent numeric(5,2) NOT NULL CHECK (co_broke_percent >= 0),
  payment_terms text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_table text,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  status public.listing_status NOT NULL,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = COALESCE(p_user_id, auth.uid())
      AND role = 'admin'
      AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_broker(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = COALESCE(p_user_id, auth.uid())
      AND (role = 'admin' OR (role = 'broker' AND status = 'approved'))
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'broker',
    'pending'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE VIEW public.renewal_reminders AS
  SELECT * FROM public.listings
  WHERE renewal_due_at IS NOT NULL
    AND renewal_due_at::date BETWEEN CURRENT_DATE + 7 AND CURRENT_DATE + 14;

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_broker_profiles_updated_at BEFORE UPDATE ON public.broker_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON public.requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commission_terms_updated_at BEFORE UPDATE ON public.commission_terms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY areas_read ON public.areas FOR SELECT USING (true);
CREATE POLICY agencies_read ON public.agencies FOR SELECT USING (public.is_approved_broker() OR public.is_admin());
CREATE POLICY users_read ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin() OR (public.is_approved_broker() AND status = 'approved'));
CREATE POLICY users_update_self ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY broker_profiles_read ON public.broker_profiles FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR (public.is_approved_broker() AND application_status = 'approved'));
CREATE POLICY broker_profiles_update ON public.broker_profiles FOR UPDATE USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY listings_public_read ON public.listings FOR SELECT USING (status = 'approved' AND approved_at IS NOT NULL);
CREATE POLICY listings_owner_admin_read ON public.listings FOR SELECT USING (auth.uid() = created_by OR public.is_admin());
CREATE POLICY listings_insert ON public.listings FOR INSERT WITH CHECK (auth.uid() = created_by AND public.is_approved_broker());
CREATE POLICY listings_update ON public.listings FOR UPDATE USING (auth.uid() = created_by OR public.is_admin()) WITH CHECK (auth.uid() = created_by OR public.is_admin());
CREATE POLICY listings_delete ON public.listings FOR DELETE USING (auth.uid() = created_by OR public.is_admin());
CREATE POLICY listing_images_read ON public.listing_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (status = 'approved' OR created_by = auth.uid() OR public.is_admin())));
CREATE POLICY listing_images_write ON public.listing_images FOR ALL USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (created_by = auth.uid() OR public.is_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (created_by = auth.uid() OR public.is_admin())));
CREATE POLICY listing_documents_read ON public.listing_documents FOR SELECT USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (status = 'approved' OR created_by = auth.uid() OR public.is_admin())));
CREATE POLICY listing_documents_write ON public.listing_documents FOR ALL USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (created_by = auth.uid() OR public.is_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (created_by = auth.uid() OR public.is_admin())));
CREATE POLICY commission_terms_read ON public.commission_terms FOR SELECT USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (status = 'approved' OR created_by = auth.uid() OR public.is_admin())));
CREATE POLICY commission_terms_write ON public.commission_terms FOR ALL USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (created_by = auth.uid() OR public.is_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (created_by = auth.uid() OR public.is_admin())));
CREATE POLICY requirements_read ON public.requirements FOR SELECT USING (public.is_approved_broker() OR public.is_admin());
CREATE POLICY requirements_insert ON public.requirements FOR INSERT WITH CHECK (auth.uid() = posted_by AND public.is_approved_broker());
CREATE POLICY requirements_update ON public.requirements FOR UPDATE USING (auth.uid() = posted_by OR public.is_admin()) WITH CHECK (auth.uid() = posted_by OR public.is_admin());
CREATE POLICY leads_read ON public.leads FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid() OR public.is_admin());
CREATE POLICY leads_insert ON public.leads FOR INSERT WITH CHECK (from_user_id = auth.uid() AND public.is_approved_broker());
CREATE POLICY leads_update ON public.leads FOR UPDATE USING (to_user_id = auth.uid() OR public.is_admin()) WITH CHECK (to_user_id = auth.uid() OR public.is_admin());
CREATE POLICY activity_log_read ON public.activity_log FOR SELECT USING (actor_user_id = auth.uid() OR public.is_admin());
CREATE POLICY listing_status_history_read ON public.listing_status_history FOR SELECT USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (status = 'approved' OR created_by = auth.uid())));

GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON public.areas TO anon, authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT, UPDATE ON public.broker_profiles TO authenticated;
GRANT SELECT ON public.agencies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.commission_terms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_documents TO authenticated;
GRANT SELECT ON public.activity_log TO authenticated;
GRANT SELECT, INSERT ON public.listing_status_history TO authenticated;
GRANT SELECT (id, title, property_type, deal_type, bedrooms, size_sqft, area_id, developer, price, payment_plan, handover_date, yield_percent, description, status, created_at, updated_at, created_by, agency_id, renewal_due_at, approved_at) ON public.listings TO anon, authenticated;
GRANT INSERT (title, property_type, deal_type, bedrooms, size_sqft, area_id, developer, price, payment_plan, handover_date, yield_percent, notes, description, status, created_by, agency_id, renewal_due_at) ON public.listings TO authenticated;
GRANT UPDATE (title, property_type, deal_type, bedrooms, size_sqft, area_id, developer, price, payment_plan, handover_date, yield_percent, notes, description, agency_id, renewal_due_at) ON public.listings TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('listing-images', 'listing-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('listing-documents', 'listing-documents', true, 2097152, NULL)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY listing_storage_read ON storage.objects FOR SELECT USING (bucket_id IN ('listing-images', 'listing-documents'));
CREATE POLICY listing_storage_write ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('listing-images', 'listing-documents') AND public.is_approved_broker());
CREATE POLICY listing_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('listing-images', 'listing-documents') AND public.is_approved_broker());

INSERT INTO public.areas (name, city, slug)
VALUES
  ('Palm Jumeirah', 'Dubai', 'palm-jumeirah'),
  ('Business Bay', 'Dubai', 'business-bay'),
  ('Dubai Hills', 'Dubai', 'dubai-hills'),
  ('JVC', 'Dubai', 'jvc'),
  ('DIFC', 'Dubai', 'difc'),
  ('Dubai Marina', 'Dubai', 'dubai-marina'),
  ('Downtown Dubai', 'Dubai', 'downtown-dubai'),
  ('Arabian Ranches', 'Dubai', 'arabian-ranches')
ON CONFLICT (slug) DO NOTHING;
