-- Migration: Populate users table with existing auth users
-- Run this in your Supabase SQL editor to sync existing auth users

-- Insert existing auth users into the users table
INSERT INTO users (id, email, subscription_plan, subscription_status, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  'trial' as subscription_plan,
  'inactive' as subscription_status,
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE au.email IS NOT NULL
  AND au.email_confirmed_at IS NOT NULL  -- Only confirmed users
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = au.id
  );

-- Also ensure user_analyses records exist for all users
INSERT INTO user_analyses (user_id, analysis_count, plan_type, created_at, updated_at)
SELECT 
  au.id,
  0 as analysis_count,
  'trial' as plan_type,
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE au.email IS NOT NULL
  AND au.email_confirmed_at IS NOT NULL  -- Only confirmed users
  AND NOT EXISTS (
    SELECT 1 FROM user_analyses ua WHERE ua.user_id = au.id
  );

-- Show results
SELECT 'Users table populated' as status, COUNT(*) as count FROM users;
SELECT 'User analyses table populated' as status, COUNT(*) as count FROM user_analyses; 