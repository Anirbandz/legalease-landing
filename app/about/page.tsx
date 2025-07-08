"use client";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Image from "next/image";
import { useUser } from "../../components/UserProvider";
import { useState } from "react";
import AuthModal from "../../components/AuthModal";
import Footer from "../../components/Footer";

export default function AboutPage() {
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
              <span className="text-xl font-bold text-gray-900">About LegalEase AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="/about" className="text-blue-600 font-semibold transition-colors">
                About
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

      {/* About Content */}
      <main className="flex-1 flex items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-lg p-8 border space-y-8">
          <section>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span role="img" aria-label="check">✅</span> What is LegalEase AI?
            </h1>
            <p className="text-gray-700 mb-4">
              LegalEase AI is an advanced AI-powered legal assistant that helps users in India understand, review, and summarize legal documents in seconds. From rental agreements and NDAs to freelance contracts and employment letters — we simplify complex legal language into clear, actionable insights.
            </p>
            <p className="text-gray-700">
              Whether you’re a freelancer, tenant, landlord, small business owner, or working professional, LegalEase AI empowers you to read between the lines of any contract before you sign.
            </p>
          </section>
          <div className="border-t border-gray-200" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <span role="img" aria-label="briefcase">💼</span> Why LegalEase AI? – Affordable Legal Document Review in India
            </h2>
            <p className="text-gray-700 mb-4">
              Legal documents are often filled with jargon and hard-to-understand terms. Hiring a lawyer for every small contract is not always feasible, especially for individuals or startups.
            </p>
            <p className="text-gray-700 mb-4">
              LegalEase AI solves this problem by offering:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>🧠 <strong>AI-Powered Legal Analysis</strong><br />Upload a PDF or Word file, and get an instant summary of key clauses, obligations, and terms.</li>
              <li>⚠️ <strong>Risk Clause Detection</strong><br />Automatically flag potentially risky, one-sided, or confusing clauses.</li>
              <li>📁 <strong>Ready-to-Use Legal Templates</strong><br />Access a curated library of downloadable legal documents for Indian users, including freelance contracts, rental agreements, NDAs, and more.</li>
              <li>🔒 <strong>Secure & Confidential</strong><br />Your documents are processed securely. We don’t store files, ensuring privacy and compliance.</li>
            </ul>
          </section>
          <div className="border-t border-gray-200" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <span role="img" aria-label="globe">🌍</span> Who is LegalEase AI For?
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Freelancers and independent professionals</li>
              <li>Startups, entrepreneurs, and small businesses</li>
              <li>Tenants and landlords</li>
              <li>Working professionals and job seekers</li>
              <li>Students and first-time contract signers</li>
            </ul>
            <p className="text-gray-700 mt-4">
              If you’re searching for a free contract summarizer, AI contract reviewer, or legal template downloads in India, LegalEase AI is built for you.
            </p>
          </section>
          <div className="border-t border-gray-200" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <span role="img" aria-label="rocket">🚀</span> How LegalEase AI Works
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Upload your legal document (PDF or DOCX)</li>
              <li>Our AI reviews and highlights key terms, obligations, and red flags</li>
              <li>Get a plain-language summary in seconds</li>
              <li>Upgrade to unlock full downloads, template access, and more</li>
            </ol>
          </section>
          <div className="border-t border-gray-200" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <span role="img" aria-label="chart">📈</span> Our Mission
            </h2>
            <p className="text-gray-700">
              To make legal clarity accessible and affordable to every individual and business in India. We combine cutting-edge AI technology with user-friendly design to simplify how India engages with legal content.
            </p>
          </section>
          <div className="border-t border-gray-200" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <span role="img" aria-label="pin">📍</span> Built in India, for India
            </h2>
            <p className="text-gray-700">
              LegalEase AI is proudly built in India to serve the unique legal needs of Indian users. Our tools are tailored to local document formats, use-cases, and payment systems (like UPI and Razorpay).
            </p>
          </section>
          <div className="border-t border-gray-200" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <span role="img" aria-label="link">🔗</span> Related Searches We Help With:
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>AI contract review tool India</li>
              <li>Free NDA templates for freelancers</li>
              <li>Rental agreement generator online</li>
              <li>Indian legal assistant app</li>
              <li>Upload contract for AI analysis</li>
              <li>Understand legal clauses online</li>
            </ul>
          </section>
          <div className="border-t border-gray-200" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <span role="img" aria-label="shield">🛡️</span> Start Smarter, Stay Protected
            </h2>
            <p className="text-gray-700 mb-4">
              Don’t sign a document you don’t fully understand. Use LegalEase AI to ensure your rights are protected — without the legal jargon or expensive fees.
            </p>
            <p className="text-gray-700 font-semibold">
              👉 Start Your Free Trial today and upload your first document.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer current="about" />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
} 