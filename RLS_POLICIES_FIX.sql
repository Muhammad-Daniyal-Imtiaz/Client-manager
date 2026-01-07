-- =============================================
-- SUPABASE RLS POLICIES FIX
-- Run this in Supabase SQL Editor to fix RLS issues
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
DROP POLICY IF EXISTS "Enable read access for own user" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for own user" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow user creation" ON users;

DROP POLICY IF EXISTS "Enable read access for own client" ON clients;
DROP POLICY IF EXISTS "Enable insert for clients" ON clients;
DROP POLICY IF EXISTS "Enable update for own client" ON clients;

-- 3. Create RLS policies for users table
-- Allow users to read their own data
CREATE POLICY "Users can read own user data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow service role (from server) to read all users
CREATE POLICY "Service role can read all users"
  ON users FOR SELECT
  USING (auth.role() = 'service_role');

-- Allow anyone to insert (for signup)
CREATE POLICY "Anyone can insert user"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own user data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to update (for auth callbacks)
CREATE POLICY "Service role can update users"
  ON users FOR UPDATE
  USING (auth.role() = 'service_role');

-- 4. Create RLS policies for clients table
CREATE POLICY "Users can read own client data"
  ON clients FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Service role can read all clients"
  ON clients FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert client"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own client data"
  ON clients FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can update clients"
  ON clients FOR UPDATE
  USING (auth.role() = 'service_role');

-- 5. Create RLS policies for project_managers table
CREATE POLICY "Users can read own project_manager data"
  ON project_managers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Service role can read all project_managers"
  ON project_managers FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert project_manager"
  ON project_managers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own project_manager data"
  ON project_managers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can update project_managers"
  ON project_managers FOR UPDATE
  USING (auth.role() = 'service_role');

-- 6. Create RLS policies for full_stack_developers table
CREATE POLICY "Users can read own full_stack_developer data"
  ON full_stack_developers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Service role can read all full_stack_developers"
  ON full_stack_developers FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert full_stack_developer"
  ON full_stack_developers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own full_stack_developer data"
  ON full_stack_developers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can update full_stack_developers"
  ON full_stack_developers FOR UPDATE
  USING (auth.role() = 'service_role');

-- 7. Create RLS policies for lead_full_stack_developers table
CREATE POLICY "Users can read own lead_full_stack_developer data"
  ON lead_full_stack_developers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Service role can read all lead_full_stack_developers"
  ON lead_full_stack_developers FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert lead_full_stack_developer"
  ON lead_full_stack_developers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own lead_full_stack_developer data"
  ON lead_full_stack_developers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can update lead_full_stack_developers"
  ON lead_full_stack_developers FOR UPDATE
  USING (auth.role() = 'service_role');

-- 8. Create RLS policies for admins table
CREATE POLICY "Users can read own admin data"
  ON admins FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Service role can read all admins"
  ON admins FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert admin"
  ON admins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own admin data"
  ON admins FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can update admins"
  ON admins FOR UPDATE
  USING (auth.role() = 'service_role');

-- 9. Create RLS policies for seo_developers table
CREATE POLICY "Users can read own seo_developer data"
  ON seo_developers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Service role can read all seo_developers"
  ON seo_developers FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert seo_developer"
  ON seo_developers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own seo_developer data"
  ON seo_developers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can update seo_developers"
  ON seo_developers FOR UPDATE
  USING (auth.role() = 'service_role');

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
  RAISE NOTICE 'RLS policies have been configured successfully!';
  RAISE NOTICE 'Users can now read their own data and the server can access user data.';
END $$;
