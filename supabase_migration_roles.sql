-- ============================================================
-- MIGRATION: Roles de Admin y Vendedor
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. Crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role      TEXT NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies para profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. Actualizar policies de ventas para que admin vea todo
DROP POLICY IF EXISTS "ventas_select_own" ON ventas;
CREATE POLICY "ventas_select_own" ON ventas FOR SELECT USING (
  auth.uid() = user_id OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "ventas_delete_own" ON ventas;
CREATE POLICY "ventas_delete_own" ON ventas FOR DELETE USING (
  auth.uid() = user_id OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. Reemplazar trigger anterior por uno que cree el profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.set_full_name_from_email();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', UPPER(SPLIT_PART(NEW.email, '@', 1))),
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Crear profiles para usuarios existentes
INSERT INTO public.profiles (id, full_name, role)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', UPPER(SPLIT_PART(email, '@', 1))),
  COALESCE(raw_user_meta_data->>'role', 'vendedor')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 7. Para asignar rol admin a un usuario existente:
-- UPDATE public.profiles SET role = 'admin' WHERE full_name = 'TU_NOMBRE';
