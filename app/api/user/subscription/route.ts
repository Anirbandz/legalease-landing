import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user subscription details from user_analyses table
    try {
      const { data: userData, error: userError } = await supabase
        .from('user_analyses')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (userError || !userData) {
        return NextResponse.json({
          userData,
          subscription: {
            plan: 'trial',
            pro_plan_type: null,
            status: 'inactive',
          }
        });
      }

      const subscription = {
        plan: userData.plan_type || 'trial',
        pro_plan_type: userData.pro_plan_type || null,
        status: userData.plan_type === 'pro' ? 'active' : 'inactive',
      };
      return NextResponse.json({ userData, subscription });

    } catch (error) {
      return NextResponse.json({
        userData: null,
        subscription: {
          plan: 'trial',
          pro_plan_type: null,
          status: 'inactive',
        }
      });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
} 