import { Shield, Smartphone, CreditCard } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  current?: "contact" | "home" | "privacy" | "terms" | "about";
}

export default function Footer({ current }: FooterProps) {
  return (
    <>
      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.svg" alt="LegalEase AI logo" className="h-6 w-6" />
                <span className="text-lg font-bold">LegalEase AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Simplifying legal document analysis with AI-powered insights for Indian professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#free-trial" className="hover:text-white transition-colors">
                    Free Trial
                  </Link>
                </li>
                <li>
                  <Link href="/#templates" className="hover:text-white transition-colors">
                    Templates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  {current === "about" ? (
                    <span className="hover:text-white transition-colors font-semibold text-white cursor-default">About</span>
                  ) : (
                    <Link href="/about" className="hover:text-white transition-colors font-semibold">
                      About
                    </Link>
                  )}
                </li>
                <li>
                  {current === "terms" ? (
                    <span className="hover:text-white transition-colors font-semibold text-white cursor-default">Terms of Service</span>
                  ) : (
                    <Link href="/terms-of-service" className="hover:text-white transition-colors font-semibold">
                      Terms of Service
                    </Link>
                  )}
                </li>
                <li>
                  {current === "privacy" ? (
                    <span className="hover:text-white transition-colors font-semibold text-white cursor-default">Privacy Policy</span>
                  ) : (
                    <Link href="/privacy-policy" className="hover:text-white transition-colors font-semibold">
                      Privacy Policy
                    </Link>
                  )}
                </li>
                <li>
                  {current === "contact" ? (
                    <span className="hover:text-white transition-colors font-semibold text-white cursor-default">Contact</span>
                  ) : (
                    <Link href="/contact" className="hover:text-white transition-colors font-semibold">
                      Contact
                    </Link>
                  )}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Payment Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Smartphone className="h-4 w-4" />
                  <span>UPI Payments</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <CreditCard className="h-4 w-4" />
                  <span>Credit/Debit Cards</span>
                </div>
                <div className="text-sm text-gray-400">Powered by Razorpay</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 LegalEase AI. All rights reserved. Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </>
  );
} 