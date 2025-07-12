"use client";
import { Shield, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Footer from "../../components/Footer";
import { useUser } from "../../components/UserProvider";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Link from 'next/link';
import AuthModal from "../../components/AuthModal";
import { loadRazorpay, createRazorpayInstance, RazorpayResponse } from "../../lib/razorpay";
import { useToast } from "../../components/ui/use-toast";
import { supabase } from "../../lib/supabaseClient";

export default function ProPage() {
  const [billing, setBilling] = useState<'month' | 'year'>('month');
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [userPlan, setUserPlan] = useState<'trial' | 'basic' | 'pro' | 'enterprise'>('trial');
  const [proPlanType, setProPlanType] = useState<string | null>(null);

  const { user, signOut } = useUser();
  const [authOpen, setAuthOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const { toast } = useToast();

  // Load Razorpay script on component mount
  useEffect(() => {
    loadRazorpay().catch(console.error);
  }, []);

  // Fetch user subscription status and plan type
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoadingSubscription(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // Fetch subscription data
        const subscriptionResponse = await fetch('/api/user/subscription', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });

        if (subscriptionResponse.ok) {
          const data = await subscriptionResponse.json();
          console.log('DEBUG subscription API response:', data);
          setUserSubscription(data);
        }

        // Fetch user plan type from user_analyses table
        const { data: userData, error } = await supabase
          .from('user_analyses')
          .select('plan_type, pro_plan_type')
          .eq('user_id', user.id)
          .single();

        if (!error && userData) {
          setUserPlan(userData.plan_type || 'trial');
          setProPlanType(userData.pro_plan_type || null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log('DEBUG: Logged in user id:', user.id);
    }
  }, [user]);

  const handlePlanClick = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Create payment order
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plan: 'pro',
          billingCycle: billing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Initialize Razorpay payment
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'LegalEase AI',
        description: `Pro Plan - ${billing}ly subscription`,
        order_id: data.orderId,
        handler: async (response: RazorpayResponse) => {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: user.user_metadata?.full_name || user.user_metadata?.username || '',
          email: user.email || '',
        },
        notes: {
          plan: 'pro',
          billing_cycle: billing,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentStatus('idle');
          },
        },
      };

      const razorpay = createRazorpayInstance(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      // Verify payment
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const data = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      setPaymentStatus('success');
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated successfully.",
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      toast({
        title: "Payment verification failed",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="LegalEase AI logo" width={56} height={56} />
              <span className="text-xl font-bold text-gray-900">LegalEase AI Pro</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <span className="text-blue-600 font-semibold transition-colors cursor-default">Pro</span>
              {user ? (
                <div className="flex items-center space-x-3">
                  <Image src={user.avatar_url || '/placeholder-user.jpg'} alt="avatar" width={32} height={32} style={{ borderRadius: '50%' }} />
                  <span className="text-gray-800 font-medium">{user.user_metadata?.username || 'User'}</span>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
                  Sign In
                </Button>
              )}
            </div>
            {/* Mobile navigation */}
            <div className="md:hidden">
              {user ? (
                <div className="flex items-center space-x-2">
                  <Image src={user.avatar_url || '/placeholder-user.jpg'} alt="avatar" width={28} height={28} style={{ borderRadius: '50%' }} />
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Pro</h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl text-center">
          Unlock unlimited document checks, advanced AI analysis, downloadable reports, and priority support with LegalEase AI Pro.
        </p>
        <div className="flex justify-center mb-6">
          <ToggleGroup 
            type="single" 
            value={billing} 
            onValueChange={val => setBilling(val as 'month' | 'year')}
          >
            <ToggleGroupItem 
              value="month" 
              aria-label="Monthly" 
              className={billing === 'month' ? 'bg-blue-600 text-white' : ''}
              disabled={proPlanType === 'pro_yearly'}
            >
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="year" 
              aria-label="Yearly" 
              className={billing === 'year' ? 'bg-blue-600 text-white' : ''}
              disabled={proPlanType === 'pro_yearly'}
            >
              Yearly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex justify-center">
          <div className="border-2 rounded-lg p-8 flex flex-col items-center bg-white shadow-lg w-full max-w-md">
            {/* Show current subscription status */}
            {user && (
              isLoadingSubscription ? (
                <div className="w-full mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <p className="text-sm text-gray-600">Loading subscription...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Current Plan:</strong> {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
                  </p>
                </div>
              )
            )}

            <h3 className="text-2xl font-bold mb-2 text-blue-600">Pro Plan</h3>
            <div className="mb-2 text-blue-600 font-bold text-4xl">₹{billing === 'month' ? '99' : '999'}</div>
            <div className="text-gray-500 mb-4 text-lg">per {billing}</div>
            <ul className="text-base text-gray-700 mb-6 space-y-2 text-left w-full">
              <li>• {billing === 'month' ? '30 document checks per month' : '4000 document checks per year'}</li>
              <li>• AI summary & risk detection</li>
              <li>• Downloadable reports</li>
              <li>• Priority support</li>
            </ul>
                        {paymentStatus === 'success' ? (
              <div className="w-full text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Payment Successful!</p>
                <p className="text-green-600 text-sm">Redirecting to dashboard...</p>
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="w-full text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-800 font-medium">Payment Failed</p>
                <p className="text-red-600 text-sm mb-3">Please try again</p>
                <Button 
                  className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => {
                    setPaymentStatus('idle');
                    handlePlanClick();
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {/* Show different button states based on subscription */}
                {user && userSubscription && userSubscription.subscription && userSubscription.subscription.plan === 'pro' ? (
                  userSubscription.subscription.pro_plan_type === 'pro_yearly' ? (
                    <div className="w-full text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">You have the best plan!</p>
                      <p className="text-green-600 text-sm">Yearly Pro subscription active</p>
                    </div>
                  ) : userSubscription.subscription.pro_plan_type === 'pro_monthly' && billing === 'month' ? (
                    <div className="w-full text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-yellow-800 font-medium">Already subscribed monthly</p>
                      <p className="text-yellow-600 text-sm">Switch to yearly for better value</p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full text-lg py-3 bg-green-600 hover:bg-green-700" 
                      onClick={() => handlePlanClick()}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Upgrade to Yearly'
                      )}
                    </Button>
                  )
                ) : (
                  <Button 
                    className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700" 
                    onClick={() => handlePlanClick()}
                    disabled={isProcessing || proPlanType === 'pro_yearly'}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                )}
                {proPlanType === 'pro_yearly' && (
                  <div className="w-full text-center p-2 mt-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    You are already a Pro Yearly user.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
} 