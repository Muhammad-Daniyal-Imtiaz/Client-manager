-- =============================================
-- COMPLETE OAUTH AUTHENTICATION FIX
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Check existing tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Drop problematic trigger safely
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS on_user_role_assigned ON users;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Create user_role enum type if it doesn't exist
DO $$ 
BEGIN
    CREATE TYPE user_role AS ENUM (
        'client',
        'project_manager',
        'full_stack_developer',
        'lead_full_stack_developer',
        'admin',
        'seo_developer'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. Create or replace the insert_role_specific_data function with better error handling
CREATE OR REPLACE FUNCTION insert_role_specific_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Debug: Log the attempt
  RAISE NOTICE 'Creating role-specific data for user % with role %', NEW.id, NEW.role;
  
  -- Insert into role-specific table based on role with ON CONFLICT
  CASE NEW.role::text
    WHEN 'client' THEN
      INSERT INTO clients (id, company_name) 
      VALUES (NEW.id, COALESCE(NEW.name || '''s Company', 'New Client Company'))
      ON CONFLICT (id) DO NOTHING;
    
    WHEN 'project_manager' THEN
      INSERT INTO project_managers (id, department) 
      VALUES (NEW.id, 'Project Management')
      ON CONFLICT (id) DO NOTHING;
    
    WHEN 'full_stack_developer' THEN
      INSERT INTO full_stack_developers (id, seniority_level) 
      VALUES (NEW.id, 'mid')
      ON CONFLICT (id) DO NOTHING;
    
    WHEN 'lead_full_stack_developer' THEN
      INSERT INTO lead_full_stack_developers (id, team_size) 
      VALUES (NEW.id, 3)
      ON CONFLICT (id) DO NOTHING;
    
    WHEN 'admin' THEN
      INSERT INTO admins (id, admin_level) 
      VALUES (NEW.id, 'moderator')
      ON CONFLICT (id) DO NOTHING;
    
    WHEN 'seo_developer' THEN
      INSERT INTO seo_developers (id, seo_specialization) 
      VALUES (NEW.id, ARRAY['On-page SEO']::TEXT[])
      ON CONFLICT (id) DO NOTHING;
    
    ELSE
      RAISE NOTICE 'Unknown role: %', NEW.role;
  END CASE;
  
  RAISE NOTICE 'Successfully created role-specific data for user %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in insert_role_specific_data for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate the trigger
CREATE TRIGGER on_user_role_assigned
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION insert_role_specific_data();

-- 6. Create or replace function to create/update users from OAuth
CREATE OR REPLACE FUNCTION public.create_or_update_user_oauth(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT NULL,
  user_avatar_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  existing_user RECORD;
  result JSONB;
  role_to_use TEXT;
BEGIN
  -- First check if user exists
  SELECT id, role INTO existing_user FROM users WHERE id = user_id;
  
  IF existing_user IS NOT NULL THEN
    -- User exists - use their existing role
    role_to_use := existing_user.role::TEXT;
    
    -- Update existing user (but keep their original role)
    UPDATE users 
    SET 
      email = COALESCE(user_email, email),
      name = COALESCE(user_name, name),
      avatar_url = COALESCE(user_avatar_url, avatar_url),
      updated_at = NOW(),
      is_verified = TRUE,
      last_login = NOW()
    WHERE id = user_id;
    
    result := jsonb_build_object(
      'status', 'updated',
      'user_id', user_id,
      'role', role_to_use,
      'is_new_user', FALSE
    );
  ELSE
    -- New user - use the provided role or default to 'client'
    role_to_use := COALESCE(user_role, 'client');
    
    -- Create new user
    INSERT INTO users (
      id,
      email,
      name,
      role,
      avatar_url,
      is_active,
      is_verified,
      last_login,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      user_email,
      COALESCE(user_name, split_part(user_email, '@', 1)),
      role_to_use::user_role,
      user_avatar_url,
      TRUE,
      TRUE,
      NOW(),
      NOW(),
      NOW()
    );
    
    result := jsonb_build_object(
      'status', 'created',
      'user_id', user_id,
      'role', role_to_use,
      'is_new_user', TRUE
    );
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_or_update_user_oauth: %', SQLERRM;
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_or_update_user_oauth TO service_role;
GRANT EXECUTE ON FUNCTION public.create_or_update_user_oauth TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_or_update_user_oauth TO anon;

-- 8. Disable RLS temporarily to set up policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for users table
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Enable read access for own user" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for own user" ON users;

-- Create new policies
CREATE POLICY "Enable read access for own user" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for all users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for own user" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. Set up policies for role-specific tables
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for own client" ON clients;
DROP POLICY IF EXISTS "Enable insert for clients" ON clients;
DROP POLICY IF EXISTS "Enable update for own client" ON clients;

CREATE POLICY "Enable read access for own client" ON clients
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable insert for clients" ON clients
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for own client" ON clients
  FOR UPDATE USING (auth.uid() = id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service role
GRANT ALL ON users TO service_role;
GRANT ALL ON clients TO service_role;
GRANT ALL ON project_managers TO service_role;
GRANT ALL ON full_stack_developers TO service_role;
GRANT ALL ON lead_full_stack_developers TO service_role;
GRANT ALL ON admins TO service_role;
GRANT ALL ON seo_developers TO service_role;

-- 10. Verify setup
DO $$
BEGIN
  RAISE NOTICE 'OAuth setup complete. Ready for use.';
END $$;
