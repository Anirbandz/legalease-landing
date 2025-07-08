"use client";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Image from "next/image";
import { useUser } from "../../components/UserProvider";
import { useState } from "react";
import AuthModal from "../../components/AuthModal";
import Footer from "../../components/Footer";

export default function PrivacyPolicyPage() {
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
              <span className="text-xl font-bold text-gray-900">LegalEase AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="/privacy-policy" className="text-blue-600 font-semibold transition-colors">
                Privacy Policy
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

      {/* Privacy Policy Content */}
      <main className="flex-1 flex items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-lg p-8 border">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-6">Last Updated: 2025</p>
          <p className="text-gray-700 mb-6">
            At LegalEase AI, we are committed to protecting your privacy and handling your data responsibly. This Privacy Policy explains how we collect, use, and safeguard your personal and document-related information.
          </p>
          <div className="border-t border-gray-200 my-6" />
          <ol className="list-decimal pl-4 space-y-6 text-gray-800">
            <li>
              <strong>Information We Collect</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Your email address (used for authentication and communication)</li>
                <li>Uploaded documents (PDF, DOCX) – processed temporarily</li>
                <li>Usage data (number of uploads, trial counts, page visits)</li>
                <li>Payment information via Razorpay (we do not store payment details)</li>
              </ul>
            </li>
            <li>
              <strong>How We Use Your Information</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Provide document analysis and AI summaries</li>
                <li>Track your trial usage and subscription status</li>
                <li>Improve our platform and user experience</li>
                <li>Send essential service-related updates</li>
              </ul>
              <p className="mt-2 text-gray-700">We do not sell your personal data or uploaded documents to any third party.</p>
            </li>
            <li>
              <strong>Document Privacy</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Temporarily stored for processing</li>
                <li>Not retained beyond the processing session</li>
                <li>Not accessible by human reviewers</li>
                <li>Not used to train AI models</li>
              </ul>
              <p className="mt-2 text-gray-700">Your content is kept confidential and is not shared with any third party unless explicitly authorized by you.</p>
            </li>
            <li>
              <strong>Cookies & Analytics</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Understand user behavior</li>
                <li>Improve site performance</li>
                <li>Track conversion funnels</li>
              </ul>
              <p className="mt-2 text-gray-700">You can disable cookies via your browser settings.</p>
            </li>
            <li>
              <strong>Payment Information</strong>
              <p className="mt-2 text-gray-700">
                All payments are handled by Razorpay, a secure third-party payment gateway. We do not store your credit/debit card information or CVV codes.
              </p>
              <p className="mt-2 text-gray-700">
                For Razorpay’s privacy practices, visit <a href="https://razorpay.com/privacy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://razorpay.com/privacy/</a>
              </p>
            </li>
            <li>
              <strong>Third-Party Links</strong>
              <p className="mt-2 text-gray-700">
                Our website may contain links to third-party legal advisors or resources. We are not responsible for the privacy practices or content of external sites.
              </p>
            </li>
            <li>
              <strong>Data Security</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>HTTPS encryption</li>
                <li>Role-based access</li>
                <li>Time-limited file processing</li>
              </ul>
              <p className="mt-2 text-gray-700">We implement strong security measures to prevent unauthorized access, modification, or disclosure of your data.</p>
            </li>
            <li>
              <strong>Your Rights</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Request access to your personal data</li>
                <li>Delete your account</li>
                <li>Revoke data processing consent at any time</li>
              </ul>
              <p className="mt-2 text-gray-700">To exercise these rights, contact <a href="mailto:privacy@[yourdomain].com" className="text-blue-600 hover:underline">privacy@[yourdomain].com</a>.</p>
            </li>
            <li>
              <strong>Changes to this Policy</strong>
              <p className="mt-2 text-gray-700">
                We may update this policy to reflect new practices or regulations. We encourage you to review it periodically. Continued use of the platform implies acceptance of any changes.
              </p>
            </li>
          </ol>
          <div className="border-t border-gray-200 my-6" />
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <span role="img" aria-label="mail">📩</span> Contact Us
          </h2>
          <p className="text-gray-700 mb-2">If you have any questions or concerns regarding this Privacy Policy, please contact us at <a href="mailto:anirbanganguly647@gmail.com" className="text-blue-600 hover:underline">anirbanganguly647@gmail.com</a>.</p>
        </div>
      </main>

      {/* Footer */}
      <Footer current="privacy" />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
} 