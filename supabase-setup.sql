-- Create user_analyses table
CREATE TABLE IF NOT EXISTS user_analyses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_count INTEGER DEFAULT 0,
  plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'basic', 'pro', 'enterprise')),
  pro_plan_type TEXT CHECK (pro_plan_type IN ('pro_monthly', 'pro_yearly')),
  period_start TEXT, -- Format: "2024-1" for monthly, "2024" for yearly
  period_count INTEGER DEFAULT 0, -- Count within current period
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_analyses_user_id ON user_analyses(user_id);

-- Create storage bucket for documents (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Set up RLS (Row Level Security) policies
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own analysis data
CREATE POLICY "Users can view their own analysis data" ON user_analyses
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to update their own analysis data
CREATE POLICY "Users can update their own analysis data" ON user_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to insert their own analysis data
CREATE POLICY "Users can insert their own analysis data" ON user_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_analyses_updated_at 
  BEFORE UPDATE ON user_analyses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Payment-related tables
-- Create payment_orders table
CREATE TABLE IF NOT EXISTS payment_orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('month', 'year')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'completed', 'failed')),
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  plan TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table with subscription fields
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscription_plan TEXT DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'pro')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  billing_cycle TEXT CHECK (billing_cycle IN ('month', 'year')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment tables
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Set up RLS for payment tables
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for payment_orders
CREATE POLICY "Users can view their own payment orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment orders" ON payment_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment orders" ON payment_orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for users
CREATE POLICY "Users can view their own user data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own user data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own user data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Triggers for payment tables
CREATE TRIGGER update_payment_orders_updated_at 
  BEFORE UPDATE ON payment_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 