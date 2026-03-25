-- ============================================================
-- Supabase Setup SQL
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Function to set user role in app_metadata on signup
-- This is triggered automatically when a new user signs up.
-- The role is stored in app_metadata which CANNOT be modified
-- by the client, making it secure for authorization.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Set the role from user_metadata (passed during signUp) into app_metadata
  -- app_metadata is server-only and cannot be spoofed by clients
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || 
    jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data->>'role', 'ATTENDEE'))
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to run the function on new user creation
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 3. (Optional) Function to update a user's role — only callable by service_role
-- Use this from your admin API routes or Supabase Dashboard
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_user_role(user_id UUID, new_role TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new_role)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. (Optional) Create your first SUPER_ADMIN
-- Replace 'your-super-admin@example.com' with your actual email
-- First register normally, then run this to promote:
-- ============================================================

-- SELECT public.set_user_role(
--   (SELECT id FROM auth.users WHERE email = 'your-super-admin@example.com'),
--   'SUPER_ADMIN'
-- );
-- 
-- Also update the Prisma users table:
-- UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'your-super-admin@example.com';
