import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '../../../../lib/supabaseClient';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { plan, billingCycle } = await request.json();

    if (!plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Only allow 'pro' plan
    if (plan !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid plan. Only Pro plan is available.' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Set the auth token for this request
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'User not authenticated or not found' },
        { status: 401 }
      );
    }

    // Check if user exists and their current subscription status
    let existingUser = null;
    try {
      const { data: userData, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userCheckError) {
        console.error('Error checking user:', userCheckError);
        console.error('Error code:', userCheckError.code);
        console.error('Error message:', userCheckError.message);
        
        // If it's a "not found" error, that's expected for new users
        if (userCheckError.code === 'PGRST116') {
          // User doesn't exist, we'll try to create them below
        } else {
          // It's a real database error, but let's continue anyway
          console.log('Database error, but continuing with payment...');
        }
      } else {
        existingUser = userData;
      }
    } catch (error) {
      console.error('Exception checking user:', error);
      // Continue anyway
    }

    // Check subscription upgrade/downgrade rules for existing Pro users
    try {
      const { data: userAnalysisData, error: userAnalysisError } = await supabase
        .from('user_analyses')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (!userAnalysisError && userAnalysisData && userAnalysisData.plan_type === 'pro') {
        const currentProPlanType = userAnalysisData.pro_plan_type;
        
        if (currentProPlanType === 'pro_yearly') {
          return NextResponse.json(
            { error: 'You already have a yearly Pro subscription. No further upgrades available.' },
            { status: 400 }
          );
        } else if (currentProPlanType === 'pro_monthly' && billingCycle === 'month') {
          return NextResponse.json(
            { error: 'You already have a monthly Pro subscription. You can only upgrade to yearly.' },
            { status: 400 }
          );
        } else if (currentProPlanType === 'pro_monthly' && billingCycle === 'year') {
          // Allow upgrade from monthly to yearly
          console.log('User upgrading from monthly to yearly Pro subscription');
        }
      }
    } catch (error) {
      console.error('Error checking user analysis:', error);
      // Continue anyway
    }

    // Try to create user record if it doesn't exist, but don't fail if it doesn't work
    if (!existingUser) {
      console.log('Attempting to create new user record for:', authUser.id);
      try {
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            subscription_plan: 'trial',
            subscription_status: 'inactive',
            created_at: new Date().toISOString(),
          });

        if (createUserError) {
          console.error('Error creating user:', createUserError);
          console.error('Error code:', createUserError.code);
          console.error('Error message:', createUserError.message);
          // Continue anyway as we can still process the payment
        } else {
          console.log('User record created successfully');
        }
      } catch (error) {
        console.error('Exception creating user:', error);
        // Continue anyway
      }
    }

    // Define pricing based on plan and billing cycle
    const pricing = {
      pro: {
        month: 9900, // ₹99 in paise
        year: 99900, // ₹999 in paise
      },
    };

    const amount = pricing[plan as keyof typeof pricing]?.[billingCycle as keyof typeof pricing.pro];
    
    if (!amount) {
      return NextResponse.json(
        { error: 'Invalid plan or billing cycle' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: authUser.id,
        plan: plan,
        billingCycle: billingCycle,
      },
    });

    // Try to store order details in database, but don't fail if it doesn't work
    console.log('Attempting to store order in database:', order.id);
    try {
      const { error: orderError } = await supabase
        .from('payment_orders')
        .insert({
          order_id: order.id,
          user_id: authUser.id,
          plan: plan,
          billing_cycle: billingCycle,
          amount: amount,
          currency: 'INR',
          status: 'created',
          created_at: new Date().toISOString(),
        });

      if (orderError) {
        console.error('Error storing order:', orderError);
        console.error('Error code:', orderError.code);
        console.error('Error message:', orderError.message);
        // Continue anyway as the order is created in Razorpay
      } else {
        console.log('Order stored successfully');
      }
    } catch (error) {
      console.error('Exception storing order:', error);
      // Continue anyway
    }

    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 