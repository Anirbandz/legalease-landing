import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { analysis, userId, userPlan } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 });
    }

    if (userPlan !== 'pro' && userPlan !== 'enterprise') {
      return NextResponse.json({ error: 'Pro plan required for downloads' }, { status: 403 });
    }

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis data required' }, { status: 400 });
    }

    // Pro plan usage limits
    let proPlanType = null;
    let periodStart = null;
    let periodCount = 0;
    let planType = userPlan;
    try {
      const { data: userData, error: userError } = await supabase
        .from('user_analyses')
        .select('plan_type, pro_plan_type, period_start, period_count')
        .eq('user_id', userId)
        .single();
      if (!userError && userData) {
        planType = userData.plan_type;
        proPlanType = userData.pro_plan_type;
        periodStart = userData.period_start;
        periodCount = userData.period_count || 0;
      }
    } catch (error) {
      // fallback: do nothing
    }
    if (planType === 'pro') {
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
      // Upsert usage
      try {
        await supabase
          .from('user_analyses')
          .upsert({
            user_id: userId,
            plan_type: planType,
            pro_plan_type: proPlanType,
            period_start: periodStart,
            period_count: periodCount,
            updated_at: new Date().toISOString(),
          });
      } catch (error) {
        // fallback: do nothing
      }
    }

    // Create formatted report
    const reportContent = `LEGAL DOCUMENT ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}
User ID: ${userId}

SUMMARY
${analysis.summary}

RISK ASSESSMENT
${analysis.risks}

RECOMMENDATIONS
${analysis.recommendations}

---
Generated by LegalEase AI
For professional legal advice, please consult with a qualified attorney.`;

    // Convert to buffer
    const buffer = Buffer.from(reportContent, 'utf-8');

    // Return the file as a download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="legal-analysis-${Date.now()}.txt"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 