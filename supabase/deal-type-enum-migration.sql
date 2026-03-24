DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'deal_type'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    ALTER TYPE public.deal_type RENAME TO deal_type_old;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.deal_type AS ENUM ('off_plan', 'secondary', 'distressed', 'urgent_sale');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.listings
  ALTER COLUMN deal_type TYPE public.deal_type
  USING (
    CASE deal_type::text
      WHEN 'sale' THEN 'secondary'::public.deal_type
      WHEN 'rent' THEN 'urgent_sale'::public.deal_type
      WHEN 'off_plan' THEN 'off_plan'::public.deal_type
      WHEN 'secondary' THEN 'secondary'::public.deal_type
      WHEN 'distressed' THEN 'distressed'::public.deal_type
      WHEN 'urgent_sale' THEN 'urgent_sale'::public.deal_type
      ELSE 'secondary'::public.deal_type
    END
  );

ALTER TABLE public.requirements
  ALTER COLUMN deal_type TYPE public.deal_type
  USING (
    CASE deal_type::text
      WHEN 'sale' THEN 'secondary'::public.deal_type
      WHEN 'rent' THEN 'urgent_sale'::public.deal_type
      WHEN 'off_plan' THEN 'off_plan'::public.deal_type
      WHEN 'secondary' THEN 'secondary'::public.deal_type
      WHEN 'distressed' THEN 'distressed'::public.deal_type
      WHEN 'urgent_sale' THEN 'urgent_sale'::public.deal_type
      ELSE 'secondary'::public.deal_type
    END
  );

DROP TYPE IF EXISTS public.deal_type_old;
