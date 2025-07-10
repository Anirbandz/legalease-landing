import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { documentText, userId, userPlan } = await request.json();

    if (!documentText) {
      return NextResponse.json({ error: 'Document text is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 });
    }

    // Get the user's JWT from the Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || null;
    // Create a per-request Supabase client with the user's JWT
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Check user's analysis count and pro plan details
    let currentPlan = userPlan || 'trial';
    let analysisCount = 0;
    let proPlanType = null;
    let periodStart = null;
    let periodCount = 0;
    try {
      const { data: userData, error: userError } = await supabase
        .from('user_analyses')
        .select('analysis_count, plan_type, pro_plan_type, period_start, period_count')
        .eq('user_id', userId)
        .single();
      if (!userError) {
        currentPlan = userPlan || userData?.plan_type || 'trial';
        analysisCount = userData?.analysis_count || 0;
        proPlanType = userData?.pro_plan_type || null;
        periodStart = userData?.period_start || null;
        periodCount = userData?.period_count || 0;
      }
    } catch (error) {
      console.log('Database table not set up yet, using default values');
    }

    // Check limits based on plan
    if (currentPlan === 'trial' && analysisCount >= 1) {
      return NextResponse.json({
        error: 'Trial limit reached',
        requiresUpgrade: true,
        trialCompleted: true
      }, { status: 403 });
    }
    if (currentPlan === 'basic' && analysisCount >= 1) {
      return NextResponse.json({
        error: 'Monthly limit reached',
        requiresUpgrade: true
      }, { status: 403 });
    }
    // Pro plan usage limits
    if (currentPlan === 'pro') {
      const now = new Date();
      let limit = 0;
      let newPeriodStart = periodStart;
      let periodKey = null;
      if (proPlanType === 'pro_monthly') {
        limit = 30;
        periodKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
        if (!periodStart || periodStart !== periodKey) {
          periodCount = 0;
          newPeriodStart = periodKey;
        }
      } else if (proPlanType === 'pro_yearly') {
        limit = 4000;
        periodKey = `${now.getFullYear()}`;
        if (!periodStart || periodStart !== periodKey) {
          periodCount = 0;
          newPeriodStart = periodKey;
        }
      }
      if (limit > 0 && periodCount >= limit) {
        return NextResponse.json({
          error: 'Pro plan usage limit reached',
          requiresUpgrade: false,
          proLimitReached: true
        }, { status: 403 });
      }
      // Update periodCount and periodStart for upsert
      periodCount = periodCount + 1;
      periodStart = newPeriodStart;
    }

    // Analyze document with OpenAI or provide sample analysis
    let parsedAnalysis;
    if (openai) {
      const prompt = `Analyze the following legal document and provide a comprehensive analysis in simple, non-legal language.

Document:
${documentText}

Please provide your response in the following JSON format:

{
  "summary": "Write a comprehensive summary in exactly 5-10 lines covering: 1) What type of document this is and what it's for, 2) Who the main parties are and what they're agreeing to, 3) Key terms and conditions in simple terms, 4) Payment or money details, 5) How long the agreement lasts, 6) Important rules and protections, 7) What each party must do, 8) How the agreement can end, 9) How disputes will be resolved, 10) Overall assessment of the agreement. Each line should be a complete sentence in plain English.",
  "risks": "Start with RISK LEVEL (LOW/MEDIUM/HIGH/CRITICAL) followed by specific risk assessment in simple terms. Explain potential problems, unclear terms, missing protections, and what could go wrong in everyday language. Be specific about financial, legal, or business risks.",
  "recommendations": "Provide actionable recommendations for improvement in simple terms. Include specific suggestions for better terms, missing clauses, clearer language, and protective measures that would make the agreement safer and fairer."
}

IMPORTANT: Write everything in simple, non-legal language that anyone can understand. Focus on practical implications and actionable advice.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a legal document analyst. Provide clear, concise analysis in plain English that non-lawyers can understand."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      const analysis = completion.choices[0]?.message?.content;
      if (!analysis) {
        return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
      }
      try {
        parsedAnalysis = JSON.parse(analysis);
      } catch (e) {
        parsedAnalysis = {
          summary: analysis,
          risks: "Analysis completed but formatting may be incomplete.",
          recommendations: "Please review the document carefully."
        };
      }
    } else {
      parsedAnalysis = {
        summary: "This legal document appears to be a standard business contract between two parties for the provision of services. The agreement outlines the scope of work, payment terms, and project timeline. Key provisions include confidentiality clauses, intellectual property rights, and dispute resolution mechanisms. The contract establishes clear deliverables and acceptance criteria for the services. Both parties have defined obligations and responsibilities throughout the project duration. The agreement includes standard termination clauses and force majeure provisions. Payment is structured in milestones with specific due dates and amounts. The document contains standard indemnification and limitation of liability clauses. Overall, this appears to be a well-structured commercial agreement with typical legal protections.",
        risks: "MEDIUM RISK: The termination clause allows either party to terminate with 30 days notice, which may be too short for complex projects. Payment terms lack late payment penalties, potentially causing cash flow issues. The indemnification clause is broad and may expose parties to unexpected liabilities. Force majeure provisions are standard but may not cover all potential disruptions. Intellectual property ownership is clearly defined but transfer mechanisms could be more detailed.",
        recommendations: "Consider extending the termination notice period to 60-90 days for better project continuity. Add late payment penalties and interest charges to payment terms. Review and potentially narrow the scope of indemnification clauses. Enhance force majeure provisions to include specific scenarios like cyber attacks or supply chain disruptions. Clarify intellectual property transfer procedures and timelines. Consider adding a dispute resolution clause that specifies mediation before litigation. Include clear definitions for key terms to avoid misunderstandings. Add a clause for regular review and updates of the agreement."
      };
    }

    // After a successful analysis (before returning the response), upsert the user's analysis count and plan_type:
    try {
      const { data, error } = await supabase
        .from('user_analyses')
        .upsert({
          user_id: userId,
          analysis_count: analysisCount + 1,
          plan_type: currentPlan,
          pro_plan_type: proPlanType,
          period_start: periodStart,
          period_count: periodCount,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        console.log('Could not update analysis count in database', error);
      }
    } catch (error) {
      console.log('Could not update analysis count in database', error);
    }

    return NextResponse.json({
      analysis: parsedAnalysis,
      remainingAnalyses: currentPlan === 'trial' ? 0 :
                        currentPlan === 'basic' ? 0 :
                        currentPlan === 'pro' ? Math.max(0, 10 - (analysisCount + 1)) :
                        'unlimited'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 