"use client";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Image from "next/image";
import { useUser } from "../../components/UserProvider";
import { useState } from "react";
import AuthModal from "../../components/AuthModal";
import Footer from "../../components/Footer";

export default function ContactPage() {
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
              <a href="/contact" className="text-blue-600 font-semibold transition-colors">
                Contact
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

      {/* Contact Content */}
      <main className="flex-1 flex items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-xl w-full mx-auto bg-white rounded-lg shadow-lg p-8 border">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span role="img" aria-label="phone">📞</span> Contact Us – LegalEase AI
          </h1>
          <p className="text-lg text-gray-700 mb-6">Have Questions? Need Help? We’re Here for You.</p>
          <p className="text-gray-600 mb-6">
            At LegalEase AI, we’re committed to delivering fast, secure, and user-friendly support. Whether you have a question about your document, need help with your subscription, or want to report a technical issue — we’re just a message away.
          </p>
          <div className="border-t border-gray-200 my-6" />
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <span role="img" aria-label="mail">📨</span> General Inquiries
          </h2>
          <p className="text-gray-700 mb-2">If you have general questions about our services, AI features, or document usage:</p>
          <div className="mb-2">
            <span className="font-semibold">Email:</span> <a href="mailto:anirbanganguly647@gmail.com" className="text-blue-600 hover:underline">anirbanganguly647@gmail.com</a>
          </div>
          <div>
            <span className="font-semibold">Support Hours:</span> Monday to Saturday, 10:00 AM – 6:00 PM (IST)
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer current="contact" />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
} 