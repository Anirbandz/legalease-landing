"use client";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Image from "next/image";
import { useUser } from "../../components/UserProvider";
import { useState } from "react";
import AuthModal from "../../components/AuthModal";
import Footer from "../../components/Footer";

export default function TermsOfServicePage() {
  const { user, signOut } = useUser();
  const [authOpen, setAuthOpen] = useState(false);
  const handleAuthSuccess = () => setAuthOpen(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="LegalEase AI logo" width={56} height={56} />
              <span className="text-xl font-bold text-gray-900">LegalEase AI Terms</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="/terms-of-service" className="text-blue-600 font-semibold transition-colors">
                Terms of Service
              </a>
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

      {/* Terms of Service Content */}
      <main className="flex-1 flex items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-lg p-8 border">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-6">Last Updated: 2025</p>
          <p className="text-gray-700 mb-6">
            Welcome to LegalEase AI. These Terms of Service govern your use of our website and services available at ease-ai.in. By accessing or using our services, you agree to be bound by these Terms.
          </p>
          <div className="border-t border-gray-200 my-6" />
          <ol className="list-decimal pl-4 space-y-6 text-gray-800">
            <li>
              <strong>Eligibility</strong>
              <p className="mt-2 text-gray-700">
                You must be at least 18 years old and capable of entering a legally binding agreement under Indian law to use this platform. If you are using the service on behalf of a company or organization, you represent that you have the authority to bind that entity.
              </p>
            </li>
            <li>
              <strong>Services Offered</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Legal document summarization</li>
                <li>Risk clause identification</li>
                <li>Legal template access</li>
                <li>Optional legal consultation through third-party referrals</li>
              </ul>
              <p className="mt-2 text-gray-700">The summaries and insights provided are for informational purposes only and do not constitute legal advice.</p>
            </li>
            <li>
              <strong>Free Trial and Paid Plans</strong>
              <p className="mt-2 text-gray-700">Each user is eligible for 1 free document summaries during the trial period. After the trial, a paid subscription is required to access premium features, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Full clause analysis</li>
                <li>Downloadable legal summaries and templates</li>
                <li>Legal template library</li>
                <li>Priority support</li>
              </ul>
              <p className="mt-2 text-gray-700">Subscription fees are billed via Razorpay in Indian Rupees (INR). All payments are non-refundable once processed.</p>
            </li>
            <li>
              <strong>User Responsibilities</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Provide accurate information during registration.</li>
                <li>Not upload content that is illegal, harmful, or violates third-party rights.</li>
                <li>Use the service only for lawful purposes.</li>
              </ul>
              <p className="mt-2 text-gray-700">We reserve the right to suspend or terminate your account for violation of these terms.</p>
            </li>
            <li>
              <strong>Data Usage and Confidentiality</strong>
              <p className="mt-2 text-gray-700">We take your privacy seriously. Documents uploaded are processed securely and not stored permanently. Please refer to our Privacy Policy for full details on data handling.</p>
            </li>
            <li>
              <strong>Intellectual Property</strong>
              <p className="mt-2 text-gray-700">All content, trademarks, code, and features on this website belong to LegalEase AI. You may not reproduce or distribute any part of the platform without written consent.</p>
            </li>
            <li>
              <strong>Third-Party Services</strong>
              <p className="mt-2 text-gray-700">We may link to third-party legal professionals or services. We are not responsible for any advice, actions, or outcomes resulting from third-party consultations.</p>
            </li>
            <li>
              <strong>Disclaimers</strong>
              <p className="mt-2 text-gray-700">LegalEase AI is not a law firm, and no attorney-client relationship is created by using this platform. All outputs are AI-generated and meant for educational or general informational purposes only.</p>
            </li>
            <li>
              <strong>Limitation of Liability</strong>
              <p className="mt-2 text-gray-700">LegalEase AI is not liable for any damages arising from the use or inability to use the platform, including errors in legal interpretation, missed clauses, or contractual disputes.</p>
            </li>
            <li>
              <strong>Changes to Terms</strong>
              <p className="mt-2 text-gray-700">We reserve the right to modify these Terms at any time. Continued use of the platform after updates implies your acceptance of the revised Terms.</p>
            </li>
          </ol>
          <div className="border-t border-gray-200 my-6" />
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <span role="img" aria-label="mail">📩</span> Contact Us
          </h2>
          <p className="text-gray-700 mb-2">For any questions regarding these Terms, please email us at <a href="mailto:anirbanganguly647@gmail.com" className="text-blue-600 hover:underline">anirbanganguly647@gmail.com</a></p>
        </div>
      </main>

      {/* Footer */}
      <Footer current="terms" />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
} 