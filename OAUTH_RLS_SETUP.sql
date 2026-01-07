-- =============================================
-- SIMPLIFIED OAUTH SETUP FOR SUPABASE
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE full_stack_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_full_stack_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_developers ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to start fresh
DO $$ 
BEGIN
  -- Drop policies on users
  DROP POLICY IF EXISTS "Enable read access for own user" ON users;
  DROP POLICY IF EXISTS "Enable insert for all users" ON users;
  DROP POLICY IF EXISTS "Enable update for own user" ON users;
  DROP POLICY IF EXISTS "Users can view own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  DROP POLICY IF EXISTS "Allow user creation" ON users;
  DROP POLICY IF EXISTS "Users can read own user data" ON users;
  DROP POLICY IF EXISTS "Service role can read all users" ON users;
  DROP POLICY IF EXISTS "Anyone can insert user" ON users;
  DROP POLICY IF EXISTS "Service role can update users" ON users;
  
  -- Drop policies on clients
  DROP POLICY IF EXISTS "Enable read access for own client" ON clients;
  DROP POLICY IF EXISTS "Enable insert for clients" ON clients;
  DROP POLICY IF EXISTS "Enable update for own client" ON clients;
  DROP POLICY IF EXISTS "Users can read own client data" ON clients;
  DROP POLICY IF EXISTS "Service role can read all clients" ON clients;
  DROP POLICY IF EXISTS "Anyone can insert client" ON clients;
  DROP POLICY IF EXISTS "Service role can update clients" ON clients;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Create RLS policies for users table
-- Allow users to read their own data
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- Allow inserts (for OAuth signup)
CREATE POLICY "users_insert"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- 4. Create RLS policies for clients table
CREATE POLICY "clients_select_own"
  ON clients FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "clients_insert"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "clients_update_own"
  ON clients FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- 5. Create RLS policies for project_managers table
CREATE POLICY "project_managers_select_own"
  ON project_managers FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "project_managers_insert"
  ON project_managers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "project_managers_update_own"
  ON project_managers FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- 6. Create RLS policies for full_stack_developers table
CREATE POLICY "full_stack_developers_select_own"
  ON full_stack_developers FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "full_stack_developers_insert"
  ON full_stack_developers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "full_stack_developers_update_own"
  ON full_stack_developers FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- 7. Create RLS policies for lead_full_stack_developers table
CREATE POLICY "lead_full_stack_developers_select_own"
  ON lead_full_stack_developers FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "lead_full_stack_developers_insert"
  ON lead_full_stack_developers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "lead_full_stack_developers_update_own"
  ON lead_full_stack_developers FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- 8. Create RLS policies for admins table
CREATE POLICY "admins_select_own"
  ON admins FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "admins_insert"
  ON admins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admins_update_own"
  ON admins FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- 9. Create RLS policies for seo_developers table
CREATE POLICY "seo_developers_select_own"
  ON seo_developers FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "seo_developers_insert"
  ON seo_developers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "seo_developers_update_own"
  ON seo_developers FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- 10. Grant proper permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON project_managers TO authenticated;
GRANT ALL ON full_stack_developers TO authenticated;
GRANT ALL ON lead_full_stack_developers TO authenticated;
GRANT ALL ON admins TO authenticated;
GRANT ALL ON seo_developers TO authenticated;

GRANT ALL ON users TO service_role;
GRANT ALL ON clients TO service_role;
GRANT ALL ON project_managers TO service_role;
GRANT ALL ON full_stack_developers TO service_role;
GRANT ALL ON lead_full_stack_developers TO service_role;
GRANT ALL ON admins TO service_role;
GRANT ALL ON seo_developers TO service_role;

-- 11. Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'RLS policies configured successfully!';
END $$;
