import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Test if users table exists
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    // Test if payment_orders table exists
    const { data: ordersData, error: ordersError } = await supabase
      .from('payment_orders')
      .select('count')
      .limit(1);

    // Test if payments table exists
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('count')
      .limit(1);

    return NextResponse.json({
      users: {
        exists: !usersError,
        error: usersError?.message || null,
        code: usersError?.code || null,
      },
      payment_orders: {
        exists: !ordersError,
        error: ordersError?.message || null,
        code: ordersError?.code || null,
      },
      payments: {
        exists: !paymentsError,
        error: paymentsError?.message || null,
        code: paymentsError?.code || null,
      },
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Database test failed' },
      { status: 500 }
    );
  }
} 