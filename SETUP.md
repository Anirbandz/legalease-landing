# LegalEase AI Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (Optional - for real AI analysis)
OPENAI_API_KEY=your_openai_api_key_here
```

## Supabase Setup

1. **Create a Supabase project** at https://supabase.com
2. **Get your credentials** from Settings → API
3. **Run the SQL script** in the SQL Editor:

```sql
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
```

4. **Create storage bucket** (optional):
   - Go to Storage in Supabase dashboard
   - Create a bucket named "documents"
   - Set it to private

## Features

### Current Status ✅
- ✅ Document upload (PDF files)
- ✅ User authentication
- ✅ Sample analysis (works without OpenAI)
- ✅ Usage limits (trial: 1 analysis)
- ✅ Upgrade prompts

### With OpenAI API Key 🔄
- 🔄 Real AI-powered analysis
- 🔄 Detailed document insights
- 🔄 Risk assessment
- 🔄 Recommendations

### Pro Features 📋
- 📋 Download analysis reports
- 📋 Unlimited analyses
- 📋 Advanced insights

## Usage

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Sign up/Sign in** to your account

3. **Upload a PDF document** by dragging and dropping or clicking the upload area

4. **Click "Analyze Document"** to get insights

5. **View results** in the analysis section

## Troubleshooting

- **Upload not working**: Check if you're signed in
- **Analysis fails**: Check if you have remaining analyses (trial users get 1)
- **Storage errors**: Create the "documents" bucket in Supabase or ignore (optional)
- **OpenAI errors**: Set your `OPENAI_API_KEY` or use sample analysis 