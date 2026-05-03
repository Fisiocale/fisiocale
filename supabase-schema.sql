-- Execute this SQL in your Supabase SQL Editor

-- 1. Create a table for users (handled by Supabase Auth, but we can have a profile table if needed)
-- We'll use auth.uid() directly or store it in records.

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

CREATE TABLE IF NOT EXISTS public.appointments (
    "id" TEXT PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "patientId" TEXT REFERENCES public.patients("id") ON DELETE CASCADE,
    "professionalId" TEXT,
    "serviceId" TEXT,
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

CREATE TABLE IF NOT EXISTS public.waitlist (
    "id" TEXT PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "patientId" TEXT REFERENCES public.patients("id") ON DELETE CASCADE,
    "type" TEXT,
    "serviceId" TEXT REFERENCES public.services("id") ON DELETE CASCADE,
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
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    "name" TEXT,
    "slogan" TEXT,
    "logoUrl" TEXT
);

-- Turn on Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow users to access only their own data
CREATE POLICY "Users can manage their own patients" ON public.patients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own services" ON public.services FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own professionals" ON public.professionals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own waitlist" ON public.waitlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own appointment_types" ON public.appointment_types FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own appointment_statuses" ON public.appointment_statuses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own company_settings" ON public.company_settings FOR ALL USING (auth.uid() = user_id);


-- Optional: Create invoices table if needed
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    number TEXT,
    date TEXT,
    amount NUMERIC,
    status TEXT
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id);
