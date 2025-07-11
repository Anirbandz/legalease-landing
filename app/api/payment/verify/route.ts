import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '../../../../lib/supabaseClient';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment parameters' },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get order details from database
    const { data: orderData, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', razorpay_order_id)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({
        payment_id: razorpay_payment_id,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', razorpay_order_id);

    if (updateError) {
      console.error('Error updating order:', updateError);
    }

    // Calculate subscription expiry date
    const now = new Date();
    const expiryDate = new Date(now);
    
    if (orderData.billing_cycle === 'month') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (orderData.billing_cycle === 'year') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Check if user exists, create if not
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('id', orderData.user_id)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking user:', userCheckError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Create user record if it doesn't exist
    if (!existingUser) {
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: orderData.user_id,
          email: '', // We don't have email in order data, will be updated later
          subscription_plan: 'trial',
          subscription_status: 'inactive',
          created_at: now.toISOString(),
        });

      if (createUserError) {
        console.error('Error creating user:', createUserError);
        // Continue anyway
      }
    }

    // Update user subscription in user_analyses table
    const proPlanType = orderData.billing_cycle === 'year' ? 'pro_yearly' : 'pro_monthly';
    const { error: subscriptionError } = await supabase
      .from('user_analyses')
      .upsert({
        user_id: orderData.user_id,
        plan_type: 'pro',
        pro_plan_type: proPlanType,
        analysis_count: 0, // Reset analysis count for new subscription
        updated_at: now.toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to activate subscription' },
        { status: 500 }
      );
    }

    // Store payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: orderData.user_id,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        amount: orderData.amount,
        currency: orderData.currency,
        plan: orderData.plan,
        billing_cycle: orderData.billing_cycle,
        status: 'success',
        created_at: now.toISOString(),
      });

    if (paymentError) {
      console.error('Error storing payment:', paymentError);
      // Continue anyway as the subscription is activated
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        plan: orderData.plan,
        billingCycle: orderData.billing_cycle,
        expiryDate: expiryDate.toISOString(),
      },
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 