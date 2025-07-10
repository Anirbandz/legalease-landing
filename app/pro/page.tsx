"use client";
import { Shield } from "lucide-react";
import Footer from "../../components/Footer";
import { useUser } from "../../components/UserProvider";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Link from 'next/link';
import AuthModal from "../../components/AuthModal";

export default function ProPage() {
  const [billing, setBilling] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise' | null>(null);
  const { user, signOut } = useUser();
  const [authOpen, setAuthOpen] = useState(false);

  function handlePlanClick(plan: 'basic' | 'pro' | 'enterprise') {
    if (!user) {
      setAuthOpen(true);
    } else {
      alert('Razorpay payment flow will be implemented here.');
    }
  }

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
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Pro</h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl text-center">
          Unlock unlimited document checks, advanced AI analysis, downloadable reports, and priority support with LegalEase AI Pro.
        </p>
        <div className="flex justify-center mb-6">
          <ToggleGroup type="single" value={billing} onValueChange={val => setBilling(val as 'month' | 'year')}>
            <ToggleGroupItem value="month" aria-label="Monthly" className={billing === 'month' ? 'bg-blue-600 text-white' : ''}>
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="year" aria-label="Yearly" className={billing === 'year' ? 'bg-blue-600 text-white' : ''}>
              Yearly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex justify-center">
          <div className="border-2 rounded-lg p-8 flex flex-col items-center bg-white shadow-lg w-full max-w-md">
            <h3 className="text-2xl font-bold mb-2 text-blue-600">Pro Plan</h3>
            <div className="mb-2 text-blue-600 font-bold text-4xl">₹{billing === 'month' ? '99' : '999'}</div>
            <div className="text-gray-500 mb-4 text-lg">per {billing}</div>
            <ul className="text-base text-gray-700 mb-6 space-y-2 text-left w-full">
              <li>• Unlimited document checks</li>
              <li>• AI summary & risk detection</li>
              <li>• Downloadable reports</li>
              <li>• Priority support</li>
            </ul>
            <Button className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700" onClick={() => handlePlanClick('pro')}>
              Subscribe Now
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
} 