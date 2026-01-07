# Complete OAuth Implementation Guide

## Overview
This guide provides the complete setup for OAuth authentication with role-based access in your Next.js application using Supabase.

## Flow Architecture

### 1. User Signup with Role Selection
- User goes to `/role-selection` page
- Selects their desired role
- Redirected to `/signup?role={selected_role}` 
- Can sign up with Google OAuth
- Role is passed through: `/api/auth/google?redirectTo=/dashboard&role={role}`

### 2. Google OAuth Flow
- `/api/auth/google` - Initiates Google OAuth with role parameter
- Google redirects to `/api/auth/callback?code=...&role={role}`
- Callback creates user in database with selected role
- Redirects to `/dashboard`

### 3. Role-Based Dashboard
- `/dashboard` page checks user's role
- Redirects to role-specific dashboard:
  - `client` → `/dashboard/client`
  - `project_manager` → `/dashboard/project-manager`
  - `full_stack_developer` → `/dashboard/full_stack_developer`
  - `lead_full_stack_developer` → `/dashboard/lead-developer`
  - `admin` → `/dashboard/admin`
  - `seo_developer` → `/dashboard/seo`

### 4. Authentication & Session Management
- `/api/auth/session` - Server-side endpoint that returns authenticated user data
- Uses `getUser()` for secure authentication
- Automatically creates user record if missing (for OAuth users)
- Returns user with role information

## Database Setup (Supabase SQL)

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE full_stack_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_full_stack_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_developers ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "users_select_own" ON users FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- Clients table policies
CREATE POLICY "clients_select_own" ON clients FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "clients_update_own" ON clients FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- Repeat similar policies for other tables:
-- project_managers, full_stack_developers, lead_full_stack_developers, admins, seo_developers

-- Grant permissions
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
```

## Key Features

### 1. Secure Authentication
- Uses `getUser()` instead of `getSession()` for server-side authentication
- All sensitive data fetched on server side
- RLS policies prevent unauthorized access

### 2. Role Persistence
- Role is passed through OAuth flow via URL parameters
- User cannot change their role after signup
- Existing users keep their original role on re-login

### 3. Automatic User Creation
- If user is authenticated but missing from database, `/api/auth/session` creates them
- Sets default role as 'client' if not provided
- Creates role-specific data automatically

### 4. Protected Routes
- Middleware redirects unauthenticated users to `/login`
- Authenticated users on `/login` redirected to `/dashboard`
- Dashboard automatically redirects to role-specific pages

## Files Modified

1. **src/app/signup/page.tsx** - Google signup button passes role
2. **src/app/api/auth/google/route.tsx** - Passes role through OAuth
3. **src/app/api/auth/callback/route.tsx** - Creates user with selected role
4. **src/app/api/auth/session/route.tsx** - Server-side session with auto user creation
5. **src/app/dashboard/page.tsx** - Redirects to role-specific dashboards
6. **src/app/login/page.tsx** - Login page with Google OAuth
7. **src/middleware.ts** - Protects routes and enforces authentication
8. **src/utils/supabase/middleware.ts** - Updates session cookies

## Testing the Flow

### Sign up with Google:
1. Go to `http://localhost:3000/role-selection`
2. Select a role
3. Click "Sign up with Google"
4. Complete Google authentication
5. Should redirect to role-specific dashboard

### Log in again:
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Should recognize existing user and show their role
4. Should redirect to correct role-specific dashboard

### Direct dashboard access:
1. Go to `http://localhost:3000/dashboard`
2. Should authenticate and redirect to role-specific dashboard

## Troubleshooting

### User not created after OAuth:
- Check `/api/auth/session` endpoint
- Verify Supabase RLS policies are enabled
- Check browser console for errors

### Wrong role assigned:
- Verify role parameter is passed through OAuth flow
- Check callback logs for role value
- Verify database has correct role saved

### Users can't access their data:
- Check RLS policies are correctly applied
- Verify `auth.uid()` matches user ID in database
- Check service_role permissions are granted

## Security Notes

1. **Never pass sensitive data via URL** - Role is non-sensitive and only affects UI routing
2. **Always use service_role for server operations** - Using anon key limits functionality
3. **Enable RLS on all tables** - Prevents unauthorized data access
4. **Use getUser() for authentication** - More secure than getSession()
5. **Validate roles on server side** - Don't trust client-side role values for sensitive operations
