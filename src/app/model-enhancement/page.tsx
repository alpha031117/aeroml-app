'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navbar/navbar";
import Loader from '@/components/loader/loader';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle, AlertCircle, Code, BookOpen, Settings, TrendingUp, Download, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl } from '@/lib/api';

// Interface for the API response
interface MLRecommendationResponse {
  session_id: string;
  status: string;
  source: string;
  ml_recommendations: string;
  recommendations_length: number;
  created_at: string;
  data_path: string;
  target_variable: string;
  model_name: string;
}

// Interface for parsed recommendation steps
interface RecommendationStep {
  id: number;
  title: string;
  description: string;
  codeExample?: string;
  isCompleted?: boolean;
}

export default function ModelEnhancement() {
  const searchParams = useSearchParams();
  const { userId, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<MLRecommendationResponse | null>(null);
  const [parsedSteps, setParsedSteps] = useState<RecommendationStep[]>([]);
  const [introText, setIntroText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams?.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      if (!authLoading && userId) {
        fetchRecommendations(sessionIdParam);
      }
    } else {
      setError('No session ID provided. Please complete model training first.');
      setIsLoading(false);
    }
  }, [searchParams, userId, authLoading]);

  const fetchRecommendations = async (sessionId: string) => {
    if (authLoading) {
      return; // Wait for auth to finish loading
    }
    
    if (!userId) {
      setError('User authentication required. Please sign in again.');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(
        buildApiUrl(`/api/model-training/h2o-ml-recommendations/${sessionId}?user_id=${userId}`)
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data: MLRecommendationResponse = await response.json();
      setRecommendations(data);
      
      // Parse the markdown recommendations into intro text and structured steps
      const { intro, steps } = parseRecommendations(data.ml_recommendations);
      setIntroText(intro);
      setParsedSteps(steps);
      
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const parseRecommendations = (markdown: string): { intro: string; steps: RecommendationStep[] } => {
    const steps: RecommendationStep[] = [];

    // Separate intro text (everything before the first numbered step)
    const firstStepMatch = markdown.match(/^\d+\.\s\*\*/m);
    let intro = '';
    let stepsMarkdown = markdown;

    if (firstStepMatch && firstStepMatch.index !== undefined) {
      intro = markdown.slice(0, firstStepMatch.index).trim();
      stepsMarkdown = markdown.slice(firstStepMatch.index);
    }

    // Clean intro by stripping leading markdown headings like "# Recommended ML Steps:"
    let cleanedIntro = intro
      .replace(/^#+\s*/gm, '') // remove leading "#" from headings
      .trim();

    // Drop the first line if it is the label "Recommended ML Steps:"
    if (cleanedIntro) {
      const introLines = cleanedIntro.split('\n').map(line => line.trim());
      if (introLines[0].toLowerCase().startsWith('recommended ml steps')) {
        cleanedIntro = introLines.slice(1).join('\n').trim();
      }
    }

    // Split by numbered sections (1. 2. 3. etc.), respecting line starts
    const sections = stepsMarkdown.split(/(?=^\d+\.\s\*\*)/m);
    
    sections.forEach((section, index) => {
      const trimmed = section.trim();
      if (!trimmed) return;

      // Extract title (e.g. "1. **Identify the Target Variable:**")
      const titleMatch = trimmed.match(/\d+\.\s\*\*(.*?)\*\*/);
      const rawTitle = titleMatch ? titleMatch[1] : `Step ${index + 1}`;

      // Remove the leading "1. **Title**" part to get the body
      const body = titleMatch
        ? trimmed.slice(titleMatch.index! + titleMatch[0].length).trim()
        : trimmed;

      // Extract code example (between ``` ```), if present
      const codeMatch = body.match(/```(?:python)?\s*([\s\S]*?)```/);
      const codeExample = codeMatch ? codeMatch[1].trim() : undefined;

      // Description is everything before the code block (or entire body if none)
      const description = codeMatch
        ? body.slice(0, codeMatch.index).trim()
        : body.trim();

      if (rawTitle && description) {
        steps.push({
          id: index + 1,
          title: rawTitle.replace(/^\d+\.\s*/, ''), // Just in case number leaked in
          description,
          codeExample,
          isCompleted: false,
        });
      }
    });
    
    return { intro: cleanedIntro, steps };
  };

  const toggleStepCompletion = (stepId: number) => {
    setParsedSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, isCompleted: !step.isCompleted }
          : step
      )
    );
  };

  const getStepIcon = (step: RecommendationStep) => {
    if (step.isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    
    // Different icons based on step content
    if (step.title.toLowerCase().includes('parameter')) {
      return <Settings className="w-5 h-5 text-blue-400" />;
    }
    if (step.title.toLowerCase().includes('performance') || step.title.toLowerCase().includes('monitor')) {
      return <TrendingUp className="w-5 h-5 text-purple-400" />;
    }
    if (step.codeExample) {
      return <Code className="w-5 h-5 text-cyan-400" />;
    }
    return <BookOpen className="w-5 h-5 text-gray-400" />;
  };

  // Format description:
  // - remove leading "-" from the first sentence
  // - for subsequent " - " in the same step, break into new lines
  // - render **text** segments as bold
  const renderDescription = (description: string) => {
    if (!description) return null;

    // Remove first leading "-" (and any following spaces)
    let cleaned = description.replace(/^-+\s*/, '');

    // For subsequent "- " within the same string, break into new lines
    cleaned = cleaned.replace(/\s+-\s+/g, '\n');

    const lines = cleaned.split('\n').filter(line => line.trim().length > 0);

    const renderWithBold = (text: string) => {
      const parts = text.split(/\*\*/);
      return parts.map((part, idx) =>
        idx % 2 === 1 ? (
          <span key={idx} className="font-semibold">
            {part}
          </span>
        ) : (
          part
        )
      );
    };

    return lines.map((line, idx) => (
      <p key={idx} className="text-gray-300 leading-relaxed mb-1">
        {renderWithBold(line.trim())}
      </p>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <Loader />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Recommendations</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <NavBar />
      
      <main className="flex-grow">
        <section className="w-full max-w-5xl mx-auto px-4 py-16 text-white">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold">AERO AI Model Enhancement</h1>
            </div>
            <p className="text-gray-400 text-lg">
              AI-powered recommendations to improve your H2O AutoML model performance
            </p>
          </div>

          {/* Session Info */}
          {recommendations && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Session Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">Session ID</p>
                  <p className="text-white font-mono text-sm truncate">{recommendations.session_id}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">Target Variable</p>
                  <Badge className="mt-1 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                    {recommendations.target_variable}
                  </Badge>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">Model Engine</p>
                  <p className="text-white font-medium">{recommendations.model_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Enhancement Progress</h3>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                {parsedSteps.filter(step => step.isCompleted).length} / {parsedSteps.length} Completed
              </Badge>
            </div>
            
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${parsedSteps.length > 0 ? (parsedSteps.filter(step => step.isCompleted).length / parsedSteps.length) * 100 : 0}%` 
                }}
              />
            </div>
          </div>

          {/* Recommendation Steps */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-2">Recommended Enhancement Steps</h2>
            {introText && (
              <p className="text-sm text-gray-400 mb-6 whitespace-pre-line">
                {introText}
              </p>
            )}
            
            {parsedSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`bg-zinc-900 rounded-xl border transition-all duration-200 ${
                  step.isCompleted 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step)}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {step.id}. {step.title}
                        </h3>
                        <Button
                          variant={step.isCompleted ? "primary" : "outline"}
                          onClick={() => toggleStepCompletion(step.id)}
                          className="text-sm"
                        >
                          {step.isCompleted ? "Completed" : "Mark Complete"}
                        </Button>
                      </div>
                      
                      <div className="mb-4">
                        {renderDescription(step.description)}
                      </div>
                      
                      {step.codeExample && (
                        <div className="bg-zinc-950 rounded-lg border border-zinc-700 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Code className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-cyan-400 font-medium">Python Code Example</span>
                          </div>
                          <pre className="text-sm text-gray-300 overflow-x-auto">
                            <code>{step.codeExample}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-8 border-t border-zinc-800">
            <Button 
              variant="outline" 
              className="h-10 cursor-pointer"
              onClick={() => window.history.back()}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Training
            </Button>
            <Button 
              variant="primary" 
              className="h-10 cursor-pointer"
              onClick={() => window.print()}
              icon={<Download className="w-4 h-4" />}
            >
              Export Recommendations
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
