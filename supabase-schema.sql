-- ============================================================
-- FISIOCALE - SUPABASE SCHEMA
-- Execute este arquivo no Supabase SQL Editor.
--
-- IMPORTANTE:
-- Login, senha, recuperação de senha e sessão ficam no Supabase Auth.
-- NÃO crie tabela manual para senhas.
-- Usuários reais ficam em auth.users.
-- Dados públicos do usuário ficam em public.profiles.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Usuário',
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can delete their own profile" ON public.profiles;

CREATE POLICY "Profiles: users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

CREATE POLICY "Profiles: users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Profiles: users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Profiles: users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING ((select auth.uid()) = id);

-- ============================================================
-- 2. TRIGGER PARA CRIAR PROFILE AUTOMATICAMENTE
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'Usuário'
    ),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. FUNÇÃO UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 4. TABELAS DO APP
-- Mantive camelCase porque seu frontend usa esses nomes.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.patients (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "birthDate" TEXT,
  "cpf" TEXT,
  "profession" TEXT,
  "attendingPhysician" TEXT,
  "indications" TEXT,
  "status" TEXT,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.services (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" NUMERIC,
  "duration" INTEGER
);

CREATE TABLE IF NOT EXISTS public.professionals (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "specialty" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "registrationNumber" TEXT,
  "color" TEXT
);

CREATE TABLE IF NOT EXISTS public.appointments (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "patientId" TEXT REFERENCES public.patients("id") ON DELETE CASCADE,
  "professionalId" TEXT REFERENCES public.professionals("id") ON DELETE SET NULL,
  "serviceId" TEXT REFERENCES public.services("id") ON DELETE SET NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "notes" TEXT,
  "price" NUMERIC,
  "status" TEXT,
  "weight" NUMERIC,
  "height" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.transactions (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "description" TEXT,
  "amount" NUMERIC,
  "type" TEXT,
  "date" TEXT,
  "category" TEXT,
  "patientId" TEXT REFERENCES public.patients("id") ON DELETE SET NULL,
  "appointmentId" TEXT REFERENCES public.appointments("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.waitlist (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "patientId" TEXT REFERENCES public.patients("id") ON DELETE CASCADE,
  "type" TEXT,
  "serviceId" TEXT REFERENCES public.services("id") ON DELETE SET NULL,
  "notes" TEXT,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.appointment_types (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "color" TEXT
);

CREATE TABLE IF NOT EXISTS public.appointment_statuses (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "color" TEXT
);

CREATE TABLE IF NOT EXISTS public.company_settings (
  "user_id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" TEXT,
  "slogan" TEXT,
  "logoUrl" TEXT
);

CREATE TABLE IF NOT EXISTS public.invoices (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "transactionId" TEXT REFERENCES public.transactions("id") ON DELETE CASCADE,
  "patientId" TEXT REFERENCES public.patients("id") ON DELETE SET NULL,
  "number" TEXT,
  "date" TEXT,
  "amount" NUMERIC,
  "status" TEXT
);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can manage their own services" ON public.services;
DROP POLICY IF EXISTS "Users can manage their own professionals" ON public.professionals;
DROP POLICY IF EXISTS "Users can manage their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage their own waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Users can manage their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can manage their own appointment_types" ON public.appointment_types;
DROP POLICY IF EXISTS "Users can manage their own appointment_statuses" ON public.appointment_statuses;
DROP POLICY IF EXISTS "Users can manage their own company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can manage their own invoices" ON public.invoices;

CREATE POLICY "Users can manage their own patients"
ON public.patients
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own services"
ON public.services
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own professionals"
ON public.professionals
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own appointments"
ON public.appointments
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own transactions"
ON public.transactions
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own waitlist"
ON public.waitlist
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own categories"
ON public.categories
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own appointment_types"
ON public.appointment_types
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own appointment_statuses"
ON public.appointment_statuses
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own company_settings"
ON public.company_settings
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "Users can manage their own invoices"
ON public.invoices
FOR ALL
TO authenticated
USING ((select auth.uid()) = "user_id")
WITH CHECK ((select auth.uid()) = "user_id");

-- ============================================================
-- 6. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients("user_id");
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services("user_id");
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals("user_id");
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments("user_id");
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments("patientId");
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments("date");
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions("user_id");
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions("date");
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.waitlist("user_id");
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories("user_id");
CREATE INDEX IF NOT EXISTS idx_appointment_types_user_id ON public.appointment_types("user_id");
CREATE INDEX IF NOT EXISTS idx_appointment_statuses_user_id ON public.appointment_statuses("user_id");
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings("user_id");
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices("user_id");

-- ============================================================
-- 7. PERMISSÕES
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_statuses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;