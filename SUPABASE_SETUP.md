# Supabase Setup Guide for LeadsFlow180 Project Tracker

## Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub, Google, or email
4. Create a new organization (if needed)

## Step 2: Create New Project
1. Click "New Project"
2. Choose your organization
3. Enter project name: `leadsflow180-project-tracker`
4. Enter database password (save this!)
5. Choose region closest to you
6. Click "Create new project"

## Step 3: Get Your API Keys
1. In your project dashboard, go to **Settings** → **API**
2. Copy the **Project URL** (looks like: `https://your-project-id.supabase.co`)
3. Copy the **anon public** key (starts with `eyJ...`)

## Step 4: Update Environment Variables
1. Open `.env.local` in your project
2. Replace the placeholder values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Step 5: Set Up Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "Run" to create all tables

## Step 6: Test the Connection
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Your app should now connect to Supabase!

## What's Included:
✅ **Tasks Table** - Store all checklist items with status tracking
✅ **Clients Table** - Manage client information
✅ **Project Progress Table** - Track progress per client/department
✅ **Automatic Timestamps** - Created/updated dates
✅ **Row Level Security** - Ready for authentication later
✅ **Indexes** - Fast queries
✅ **TypeScript Types** - Full type safety

## Next Steps:
- Your data will now persist between sessions
- Multiple team members can access the same data
- Real-time updates when data changes
- Automatic backups in Supabase

## Troubleshooting:
- If you get connection errors, check your API keys
- Make sure you ran the SQL setup script
- Restart your dev server after updating `.env.local`

Need help? Check the Supabase docs or ask me! 🚀 