'use client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Download, Shield, CheckCircle, Star, Users, CreditCard, Smartphone } from "lucide-react"
import Auth from '../components/Auth'
import { useUser } from '../components/UserProvider'
import AuthModal from '../components/AuthModal'
import { useState } from 'react'
import Image from 'next/image'
import Footer from "../components/Footer";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Head from 'next/head';
import Link from 'next/link';

export default function LandingPage() {
  const { user, signOut } = useUser();
  const [authOpen, setAuthOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [billing, setBilling] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise' | null>(null);

  // Function to handle successful sign in
  const handleAuthSuccess = () => setAuthOpen(false);

  function handleFreeTrialClick() {
    if (!user) {
      setAuthOpen(true);
    } else {
      const section = document.getElementById('free-trial');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  return (
    <>
      <Head>
        <title>LegalEase AI – AI Legal Document Summarizer India</title>
        <meta name="description" content="Upload contracts, NDAs, rental agreements and get instant AI summaries. Designed for Indian users. Free trial available." />
        <meta name="keywords" content="AI legal assistant, contract review tool India, free NDA template India, AI document summary, rental agreement India" />
        <meta property="og:title" content="LegalEase AI – AI Legal Document Summarizer India" />
        <meta property="og:description" content="Upload contracts, NDAs, rental agreements and get instant AI summaries. Designed for Indian users. Free trial available." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://www.ease-ai.in" />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Image src="/logo.svg" alt="LegalEase AI logo" width={56} height={56} />
                <span className="text-xl font-bold text-gray-900">LegalEase AI</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Pricing
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                  How It Works
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

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    LegalEase AI – AI Legal Document Summarizer India
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Upload contracts, NDAs, rental agreements and get instant AI summaries. Designed for Indian users. Free trial available.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" onClick={handleFreeTrialClick}>
                    Try Free Trial
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 bg-transparent"
                    asChild
                  >
                    <Link href="/pro">View Pricing</Link>
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>1 Free Trial</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>No Credit Card Required</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-lg shadow-2xl p-6 border">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Document Analysis</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Contract_NDA.pdf uploaded</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">High Risk: Termination clause needs review</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Medium Risk: Payment terms unclear</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Low Risk: Standard confidentiality clause</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free Trial Limitations */}
        <section id="free-trial" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Get in Free Trial</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the power of AI legal analysis with our generous free trial
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">1 free document check</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">AI summary (read-only)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      <span className="text-gray-400">No document download</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      <span className="text-gray-400">No legal consultation access</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Trial Progress</span>
                      <span className="text-sm text-gray-500">0 of 1 used</span>
                    </div>
                    <Progress value={0} className="h-3" />
                    <p className="text-sm text-gray-500">1 document check remaining</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section id="pricing" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose the plan that works best for your legal document needs
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">Monthly Plan</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-blue-600">₹99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Unlimited document analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Full document downloads</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced clause analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Legal template access</span>
                  </div>
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/pro">Subscribe Now</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="relative border-2 border-blue-500 hover:border-blue-600 transition-colors">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">Save 50%</Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">Annual Plan</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-blue-600">₹999</span>
                    <span className="text-gray-500">/year</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">₹83/month when billed annually</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Everything in Monthly Plan</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced legal insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Bulk document processing</span>
                  </div>
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/pro">Subscribe Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">Secure payments via Razorpay • Cancel anytime</p>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Get legal insights in three simple steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Step 1: Upload Document</h3>
                <p className="text-gray-600">
                  Simply drag and drop your legal document or browse to upload contracts, NDAs, or agreements.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Step 2: AI Summarizes Key Clauses</h3>
                <p className="text-gray-600">
                  Our AI analyzes your document and highlights important clauses, risks, and key terms in plain English.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Step 3: Download or Consult</h3>
                <p className="text-gray-600">
                  Download your analysis report or connect with legal experts for professional consultation.
                  <span className="text-blue-600 font-medium"> (Paid Feature)</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to understand and manage your legal documents
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Clause Risk Detector</h3>
                <p className="text-sm text-gray-600">
                  Automatically identify and flag potentially risky clauses in your contracts.
                </p>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Free Legal Templates</h3>
                <p className="text-sm text-gray-600">
                  Access professionally drafted legal templates for common business needs.
                  <span className="text-blue-600"> (Paid)</span>
                </p>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Lawyer Review Access</h3>
                <p className="text-sm text-gray-600">
                  Connect with qualified lawyers for professional document review and consultation.
                </p>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Full Document Downloads</h3>
                <p className="text-sm text-gray-600">
                  Download detailed analysis reports and annotated documents.
                  <span className="text-blue-600"> (Paid Only)</span>
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Free Legal Templates</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Access professionally drafted legal templates for common business needs
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">NDA Template</h3>
                </div>
                <p className="text-sm text-gray-600">
                  A comprehensive Non-Disclosure Agreement template for protecting confidential information.
                </p>
                <Button variant="outline" size="sm" className="mt-4 text-blue-600 hover:bg-blue-100">
                  Download
                </Button>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Contract Template</h3>
                </div>
                <p className="text-sm text-gray-600">
                  A customizable template for drafting standard business contracts.
                </p>
                <Button variant="outline" size="sm" className="mt-4 text-blue-600 hover:bg-blue-100">
                  Download
                </Button>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Partnership Agreement</h3>
                </div>
                <p className="text-sm text-gray-600">
                  A detailed template for establishing a partnership between two parties.
                </p>
                <Button variant="outline" size="sm" className="mt-4 text-blue-600 hover:bg-blue-100">
                  Download
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of professionals who trust LegalEase AI</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "As a freelance consultant, I deal with multiple contracts every month. LegalEase AI has saved me hours
                  of legal review time and helped me catch several risky clauses I would have missed."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">RK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Rajesh Kumar</p>
                    <p className="text-sm text-gray-500">Freelance Business Consultant</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Running a small business means dealing with vendor contracts, NDAs, and partnership agreements.
                  LegalEase AI gives me the confidence that I'm not missing anything important."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-semibold">PS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Priya Sharma</p>
                    <p className="text-sm text-gray-500">Small Business Owner</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Start Your Free Trial Now</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust LegalEase AI to simplify their legal document review process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
                onClick={handleFreeTrialClick}
              >
                Try for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                asChild
              >
                <Link href="/pro">Go Pro</Link>
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-4">
              No credit card required • 1 free document check • Upgrade anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer current="home" />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />
        <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Pricing Plans</DialogTitle>
              <DialogDescription className="mb-4">
                Choose the plan that fits your needs. All plans include secure document analysis and AI-powered insights.
              </DialogDescription>
            </DialogHeader>
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
            <div className="grid md:grid-cols-3 gap-6">
              {/* Basic Plan */}
              <div
                className={`border rounded-lg p-6 flex flex-col items-center bg-gray-50 cursor-pointer transition-all ${selectedPlan === 'basic' ? 'border-blue-600 ring-2 ring-blue-400 bg-blue-50' : ''}`}
                onClick={() => setSelectedPlan('basic')}
              >
                <h3 className="text-lg font-semibold mb-2">Basic</h3>
                <div className="mb-2 text-blue-600 font-bold text-2xl">₹{billing === 'month' ? '99' : '999'}</div>
                <div className="text-gray-500 mb-4">per {billing}</div>
                <ul className="text-sm text-gray-700 mb-4 space-y-1">
                  <li>1 document check/month</li>
                  <li>AI summary</li>
                  <li>Email support</li>
                </ul>
                <Button className="w-full" variant={selectedPlan === 'basic' ? 'default' : 'secondary'}>Choose Basic</Button>
              </div>
              {/* Pro Plan */}
              <div
                className={`border-2 rounded-lg p-6 flex flex-col items-center bg-white shadow-lg cursor-pointer transition-all ${selectedPlan === 'pro' ? 'border-blue-600 ring-2 ring-blue-400 bg-blue-50' : 'border-blue-600'}`}
                onClick={() => setSelectedPlan('pro')}
              >
                <h3 className="text-lg font-semibold mb-2 text-blue-600">Pro</h3>
                <div className="mb-2 text-blue-600 font-bold text-2xl">₹{billing === 'month' ? '199' : '1999'}</div>
                <div className="text-gray-500 mb-4">per {billing}</div>
                <ul className="text-sm text-gray-700 mb-4 space-y-1">
                  <li>10 document checks/month</li>
                  <li>AI summary & risk detection</li>
                  <li>Priority email support</li>
                  <li>Downloadable reports</li>
                </ul>
                <Button className="w-full" variant={selectedPlan === 'pro' ? 'default' : 'secondary'}>Choose Pro</Button>
              </div>
              {/* Enterprise Plan */}
              <div
                className={`border rounded-lg p-6 flex flex-col items-center bg-gray-50 cursor-pointer transition-all ${selectedPlan === 'enterprise' ? 'border-blue-600 ring-2 ring-blue-400 bg-blue-50' : ''}`}
                onClick={() => setSelectedPlan('enterprise')}
              >
                <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                <div className="mb-2 text-blue-600 font-bold text-2xl">₹{billing === 'month' ? '499' : '4999'}</div>
                <div className="text-gray-500 mb-4">per {billing}</div>
                <ul className="text-sm text-gray-700 mb-4 space-y-1">
                  <li>Unlimited document checks</li>
                  <li>All Pro features</li>
                  <li>Dedicated account manager</li>
                  <li>Custom integrations</li>
                </ul>
                <Button className="w-full" variant={selectedPlan === 'enterprise' ? 'default' : 'secondary'}>Contact Sales</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
