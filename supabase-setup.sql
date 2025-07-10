-- Create user_analyses table
CREATE TABLE IF NOT EXISTS user_analyses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_count INTEGER DEFAULT 0,
  plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'basic', 'pro', 'enterprise')),
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