import React, { useState, useEffect, useRef } from 'react';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { ScoreForm } from './components/ScoreForm';
import { ScoreResult } from './components/ScoreResult';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { AboutMethodology } from './pages/AboutMethodology';
import { DataDeletion } from './pages/DataDeletion';
import { MbbsGuidance } from './pages/MbbsGuidance';
import { PredictionInputs, PredictionResult } from './types';
import { calculateNeetScore } from './utils/scoreCalculator';
import { recordAnonymousPrediction, submitOptInLead, fetchPublicPredictionCount } from './lib/supabase';
import { ArrowLeft, Stethoscope } from 'lucide-react';

export default function App() {
  // Navigation: 'home' | 'methodology' | 'guidance' | 'privacy' | 'terms' | 'deletion' | 'admin'
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [leadSuccessId, setLeadSuccessId] = useState<string | null>(null);
  const [predictionCount, setPredictionCount] = useState(0);

  // Form reference for smooth scrolling
  const formRef = useRef<HTMLDivElement>(null);

  // Handle URL route /admin or hash on initial load
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path === '/admin' || hash === '#admin') {
        setCurrentTab('admin');
      } else if (hash === '#privacy') {
        setCurrentTab('privacy');
      } else if (hash === '#terms') {
        setCurrentTab('terms');
      } else if (hash === '#methodology' || hash === '#how-it-works') {
        setCurrentTab('methodology');
      } else if (hash === '#guidance') {
        setCurrentTab('guidance');
      } else if (hash === '#deletion') {
        setCurrentTab('deletion');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    fetchPublicPredictionCount().then(setPredictionCount);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'admin') {
      window.history.pushState(null, '', '#admin');
    } else if (tab === 'home') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.history.pushState(null, '', `#${tab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChallenge = () => {
    setCurrentTab('home');
    if (predictionResult) {
      setPredictionResult(null);
    }
    setTimeout(() => {
      const formEl = document.getElementById('predictor-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleFormSubmit = async (inputs: PredictionInputs) => {
    setIsCalculating(true);
    
    // Simulate natural calculated processing
    setTimeout(async () => {
      const result = calculateNeetScore(inputs);
      setPredictionResult(result);
      setIsCalculating(false);

      // Record anonymous aggregate event (no PII)
      recordAnonymousPrediction({
        state: inputs.state,
        scoreBracket: `${result.scoreBandMin}-${result.scoreBandMax}`,
        mockRange: inputs.mockScoreRange
      });
      setPredictionCount((count) => count + 1);

      // Automatically register the score predictor lead separately
      if (inputs.phone) {
        submitOptInLead({
          name: inputs.name,
          phone: inputs.phone,
          state: inputs.state,
          admission_preference: 'Undecided',
          estimated_score: result.estimatedScore,
          lead_source: 'Score Predictor'
        });
      }

      // Scroll smoothly to results view
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }, 450);
  };

  const handleResetChallenge = () => {
    setPredictionResult(null);
    handleStartChallenge();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Top menu removed. When viewing a subpage, provide a clean return link */}
      {currentTab !== 'home' && (
        <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              onClick={() => handleNavigate('home')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to NEET 2027 Score Challenge</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                <Stethoscope className="w-3 h-3" />
              </div>
              <span className="hidden sm:inline">NEET 2027 Predictor</span>
            </div>
          </div>
        </div>
      )}
      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'admin' ? (
          <AdminDashboard />
        ) : currentTab === 'methodology' ? (
          <AboutMethodology onStartChallenge={handleStartChallenge} />
        ) : currentTab === 'guidance' ? (
          <MbbsGuidance 
            onOpenGuidanceModal={() => setIsLeadModalOpen(true)} 
            onStartChallenge={handleStartChallenge}
          />
        ) : currentTab === 'privacy' ? (
          <PrivacyPolicy onNavigateToDeletion={() => handleNavigate('deletion')} />
        ) : currentTab === 'terms' ? (
          <TermsOfService />
        ) : currentTab === 'deletion' ? (
          <DataDeletion onBackToHome={() => handleNavigate('home')} />
        ) : (
          /* HOME TAB: HERO + FORM / RESULT */
          <div className="space-y-12 pb-16">
            {!predictionResult ? (
              <>
                <Hero onStartChallenge={handleStartChallenge} predictionCount={predictionCount} />
                
                <div ref={formRef} className="pt-2">
                  <ScoreForm onSubmit={handleFormSubmit} isLoading={isCalculating} />
                </div>

                {/* Below form teaser explaining transparent formula */}
                <div id="how-it-works" className="max-w-3xl mx-auto px-4 text-center pt-8">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-600 shadow-xs">
                    <p className="font-heading font-bold text-slate-900 text-base mb-1">
                      🔬 Open & Auditable Preparation Benchmark
                    </p>
                    <p className="max-w-xl mx-auto text-slate-500 leading-relaxed">
                      We never use generative AI or unverified claims. Our algorithm models your mock test baseline, compounds your daily focus hours, and checks syllabus coverage against past NEET exam trends.
                    </p>
                    <button
                      onClick={() => handleNavigate('methodology')}
                      className="mt-3 text-indigo-600 font-bold hover:underline inline-block cursor-pointer"
                    >
                      Read the full scoring equation & rules →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-8">
                <ScoreResult
                  result={predictionResult}
                  onReset={handleResetChallenge}
                  onRequestGuidance={() => setIsLeadModalOpen(true)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Optional Lead Capture Modal (Triggered after score or from guidance) */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        prefilledName={predictionResult?.studentName || ''}
        prefilledPhone={predictionResult?.studentPhone || ''}
        prefilledState={predictionResult?.state || 'Delhi NCR'}
        estimatedScore={predictionResult?.estimatedScore || 580}
        onSuccess={(id) => {
          setLeadSuccessId(id);
        }}
        onNavigateToPrivacy={() => {
          setIsLeadModalOpen(false);
          handleNavigate('privacy');
        }}
      />

      {/* Global Comprehensive Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}
