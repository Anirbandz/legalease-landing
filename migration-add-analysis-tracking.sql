-- Migration: Add analysis tracking fields to user_analyses table
-- Run this in your Supabase SQL editor if you have an existing database

-- Add pro_plan_type column
ALTER TABLE user_analyses 
ADD COLUMN IF NOT EXISTS pro_plan_type TEXT CHECK (pro_plan_type IN ('pro_monthly', 'pro_yearly'));

-- Add period_start column
ALTER TABLE user_analyses 
ADD COLUMN IF NOT EXISTS period_start TEXT;

-- Add period_count column
ALTER TABLE user_analyses 
ADD COLUMN IF NOT EXISTS period_count INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN user_analyses.pro_plan_type IS 'Type of Pro plan: pro_monthly or pro_yearly';
COMMENT ON COLUMN user_analyses.period_start IS 'Period identifier: "2024-1" for monthly, "2024" for yearly';
COMMENT ON COLUMN user_analyses.period_count IS 'Number of analyses used in current period'; 