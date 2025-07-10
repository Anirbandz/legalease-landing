'use client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Download, Shield, CheckCircle, Star, Users, CreditCard, Smartphone, Loader2, AlertCircle, X, Lock } from "lucide-react"
import Auth from '../components/Auth'
import { useUser } from '../components/UserProvider'
import AuthModal from '../components/AuthModal'
import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Footer from "../components/Footer";
import { useDropzone } from 'react-dropzone';
import { useToast } from "@/hooks/use-toast";
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
import { supabase } from '../lib/supabaseClient';

export default function LandingPage() {
  const { user, signOut } = useUser();
  const { toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [billing, setBilling] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise' | null>(null);
  
  // Upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<'trial' | 'basic' | 'pro' | 'enterprise'>('trial');
  const [analysisCount, setAnalysisCount] = useState(0);
  const [trialCompleted, setTrialCompleted] = useState(false);

  // Function to handle successful sign in
  const handleAuthSuccess = () => setAuthOpen(false);

  useEffect(() => {
    const fetchUserTrialState = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('user_analyses')
          .select('analysis_count, plan_type')
          .eq('user_id', user.id)
          .single();
        if (!error && data) {
          setAnalysisCount(data.analysis_count || 0);
          setUserPlan(data.plan_type || 'trial');
          setTrialCompleted((data.plan_type === 'trial' && (data.analysis_count || 0) >= 1));
        }
      } catch (err) {
        // fallback: do nothing
      }
    };
    fetchUserTrialState();
  }, [user]);

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

  // Upload functionality
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    // if (trialCompleted && userPlan === 'trial') {
    //   toast({
    //     title: "Trial completed",
    //     description: "Please upgrade to Pro to continue analyzing documents.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setDocumentText(data.documentText);
      toast({
        title: "Upload successful",
        description: "Document uploaded successfully. You can now analyze it.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [user, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (!documentText) {
      toast({
        title: "No document",
        description: "Please upload a document first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          documentText,
          userId: user.id,
          userPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresUpgrade) {
          setTrialCompleted(true);
          setAnalysisCount(1);
          toast({
            title: "Trial completed",
            description: "You've used your free analysis. Please upgrade to continue.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      setAnalysisCount(prev => prev + 1);
      
      // Check if this was the first analysis (trial completion)
      if (userPlan === 'trial' && analysisCount === 0) {
        setTrialCompleted(true);
        toast({
          title: "Trial completed",
          description: "You've used your free analysis. Upgrade to Pro for unlimited analyses!",
        });
      } else {
        toast({
          title: "Analysis complete",
          description: "Your document has been analyzed successfully.",
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearDocument = () => {
    setUploadedFile(null);
    setDocumentText('');
    setAnalysis(null);
  };

  const handleDownloadReport = async () => {
    if (!analysis || !user) return;

    setIsDownloading(true);

    try {
      // Create detailed report content
      const reportContent = `LEGAL DOCUMENT ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}
Document: ${uploadedFile?.name || 'Unknown Document'}

================================================================================
DOCUMENT SUMMARY
================================================================================

${analysis.summary}

================================================================================
RISK ASSESSMENT
================================================================================

${analysis.risks}

================================================================================
DETAILED RECOMMENDATIONS
================================================================================

${analysis.recommendations}

================================================================================
WHAT THIS MEANS FOR YOU
================================================================================

This analysis helps you understand:
• What type of document you're dealing with
• Who the main parties are and their responsibilities
• Key terms and conditions you should pay attention to
• Potential risks that could affect you
• Specific improvements you should consider

================================================================================
NEXT STEPS
================================================================================

1. Review the risk assessment carefully
2. Consider implementing the recommendations
3. Consult with a legal professional if you have concerns
4. Keep this report for future reference

================================================================================
IMPORTANT DISCLAIMER
================================================================================

This analysis is provided for informational purposes only and should not be considered as legal advice. For professional legal guidance, please consult with a qualified attorney who can review your specific situation and provide tailored advice.

Generated by LegalEase AI
For professional legal advice, please consult with a qualified attorney.`;

      // Create and download the file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal-analysis-${uploadedFile?.name?.replace('.pdf', '') || 'document'}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report downloaded",
        description: "Detailed analysis report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the analysis report.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

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
                <span className="text-xl font-bold text-gray-900">
                  LegalEase AI
                  {userPlan === 'pro' && <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-white text-xs rounded">Pro</span>}
                </span>
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
                  {userPlan !== 'pro' && (
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" onClick={handleFreeTrialClick}>
                      Try Free Trial
                    </Button>
                  )}
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
                      {uploadedFile && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Uploaded
                        </Badge>
                      )}
                    </div>
                    
                    {/* Upload Area */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : trialCompleted && userPlan === 'trial'
                          ? 'border-red-300 bg-red-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {isUploading ? (
                        <div className="space-y-4">
                          <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
                          <p className="text-gray-600">Uploading document...</p>
                          <Progress value={50} className="w-full max-w-xs mx-auto" />
                        </div>
                      ) : uploadedFile ? (
                        <div className="space-y-4">
                          <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                          <p className="text-gray-900 font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-600">Document uploaded successfully</p>
                          <Button variant="outline" size="sm" onClick={clearDocument}>
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : trialCompleted && userPlan === 'trial' ? (
                        <div className="space-y-4">
                          <Lock className="h-12 w-12 text-red-400 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-red-800">
                              Trial completed - Upgrade required
                            </p>
                            <p className="text-sm text-red-600 mt-1">
                              Click "Upgrade Now" to continue analyzing documents
                            </p>
                          </div>
                          <Button
                            onClick={() => window.location.href = '/pro'}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Upgrade to Pro
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              {isDragActive ? 'Drop the PDF here' : 'Upload your legal document'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Drag and drop a PDF file, or click to browse
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Maximum file size: 10MB • PDF files only
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Analyze Button */}
                    {documentText && !analysis && !trialCompleted && (
                      <div className="flex justify-center">
                        <Button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          size="lg"
                          className="px-8"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Analyze Document
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Trial Completed Message */}
                    {documentText && !analysis && trialCompleted && userPlan === 'trial' && (
                      <div className="flex justify-center">
                        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                          <Lock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-red-800 font-medium">Trial completed</p>
                          <p className="text-red-600 text-sm mb-3">Upgrade to Pro for unlimited analyses</p>
                          <Button
                            onClick={() => window.location.href = '/pro'}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Upgrade to Pro
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Analysis Results */}
                    {analysis && (
                      <div className="space-y-4">
                        {/* Risk Level */}
                        <div className="border rounded-lg p-6 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                              Risk Assessment
                            </h4>
                            <div className="flex items-center space-x-2">
                              {analysis.risks?.includes('HIGH') || analysis.risks?.includes('CRITICAL') ? (
                                <div className="flex items-center space-x-2 bg-red-100 px-3 py-1 rounded-full">
                                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-bold text-red-700">HIGH RISK</span>
                                </div>
                              ) : analysis.risks?.includes('MEDIUM') ? (
                                <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm font-bold text-yellow-700">MEDIUM RISK</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-bold text-green-700">LOW RISK</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {analysis.risks?.split(':')[1] || analysis.risks || 'Risk assessment not available'}
                            </p>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          <div className="flex items-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-blue-500" />
                              Document Summary
                            </h4>
                          </div>
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="text-sm text-gray-700 space-y-2">
                              {analysis.summary?.split('.').filter((line: string) => line.trim()).map((line: string, index: number) => (
                                <p key={index} className="leading-relaxed">
                                  {line.trim()}.
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="border rounded-lg p-6 bg-gradient-to-r from-green-50 to-white shadow-sm">
                          <div className="flex items-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                              Recommendations
                            </h4>
                          </div>
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {analysis.recommendations || 'No specific recommendations available'}
                            </p>
                          </div>
                        </div>

                        {/* Download Report Button */}
                        {userPlan === 'pro' && (
                          <div className="flex justify-center pt-4">
                            <Button
                              onClick={handleDownloadReport}
                              disabled={isDownloading}
                              variant="outline"
                              size="lg"
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              {isDownloading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Detailed Report
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        {/* If not pro, show upgrade prompt below analysis */}
                        {userPlan !== 'pro' && (
                          <div className="flex justify-center pt-4">
                            <Button
                              onClick={() => window.location.href = '/pro'}
                              variant="outline"
                              size="lg"
                              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Upgrade to Pro to Download Report
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
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
              {userPlan === 'pro' ? (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">You are a Pro User!</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Enjoy unlimited document analyses, downloads, and premium features.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Get in Free Trial</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Experience the power of AI legal analysis with our generous free trial
                  </p>
                </>
              )}
            </div>
            <div className="max-w-4xl mx-auto">
              {userPlan === 'pro' ? (
                <Card className="p-8 bg-gradient-to-r from-yellow-50 to-white border-yellow-300">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">Unlimited document checks</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">AI summary & full downloads</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">Priority support</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">Access to legal templates</span>
                      </div>
                    </div>
                    <div className="space-y-4 text-center">
                      <span className="text-2xl font-bold text-yellow-600">Pro Plan Active</span>
                      <p className="text-sm text-gray-500">Thank you for being a Pro user!</p>
                    </div>
                  </div>
                </Card>
              ) : (
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
                        <span className="text-sm text-gray-500">{analysisCount} of 1 used</span>
                      </div>
                      <Progress value={analysisCount * 100} className="h-3" />
                      <p className="text-sm text-gray-500">
                        {trialCompleted ? (
                          <span className="text-red-600 font-semibold">Trial completed! Upgrade to Pro for unlimited analyses.</span>
                        ) : (
                          `${1 - analysisCount} document check remaining`
                        )}
                      </p>
                      {trialCompleted && (
                        <Button className="mt-3 bg-red-600 hover:bg-red-700 text-white" onClick={() => window.location.href = '/pro'}>
                          Upgrade to Pro
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
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
              {userPlan !== 'pro' && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
                  onClick={handleFreeTrialClick}
                >
                  Try for Free
                </Button>
              )}
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
        <Footer userPlan={userPlan} />
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
