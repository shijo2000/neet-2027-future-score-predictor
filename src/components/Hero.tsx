import React from 'react';
import { Sparkles, Trophy, ShieldCheck, Flame, ArrowRight, BookOpen, Clock, HeartPulse } from 'lucide-react';

interface HeroProps {
  onStartChallenge: () => void;
  predictionCount?: number;
}

export const Hero: React.FC<HeroProps> = ({ onStartChallenge, predictionCount = 0 }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 gradient-mesh">
      {/* Subtle top floating particles */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-blue-500/15 blur-3xl rounded-full -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Viral Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-bold shadow-xs mb-6 animate-pulse">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>
            {predictionCount > 0
              ? `${predictionCount.toLocaleString('en-IN')} Aspirants Challenged`
              : 'NEET 2027 Score Challenge'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-purple-700">Live Batch</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          What’s Your <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">NEET 2027</span> Future Score?
        </h1>

        {/* Subheading */}
        <p className="mt-4 sm:mt-5 text-lg sm:text-2xl text-slate-600 font-semibold max-w-2xl mx-auto">
          Take the free NEET score challenge!
        </p>

        <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          See where your current mocks, daily study discipline, and syllabus coverage can take you by May 2027. Instant downloadable scorecard & college target bracket.
        </p>

        {/* Call To Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onStartChallenge}
            className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-xl shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 group-hover:rotate-12 transition-transform" />
            <span>Predict My Score</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-4 text-sm sm:text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>How We Calculate</span>
          </a>
        </div>

        {/* Explicit Honesty & Disclaimer Badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-[11px] sm:text-xs text-slate-600 max-w-2xl">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>100% Free & Transparent:</strong> Illustrative, non-scientific estimate based on study progress. Not an official NTA prediction. No AI gimmicks or mandatory phone numbers required to see your score.
          </span>
        </div>

        {/* Key Feature Badges Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
          
          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-indigo-100 shadow-xs hover:border-indigo-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="font-heading font-bold text-slate-900 text-sm sm:text-base">Target College Tiers</div>
            <p className="text-xs text-slate-500 mt-1">AIIMS, Top State GMCs, or Semi-Govt eligibility outlook.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-purple-100 shadow-xs hover:border-purple-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="font-heading font-bold text-slate-900 text-sm sm:text-base">Subject Sub-scores</div>
            <p className="text-xs text-slate-500 mt-1">Bio (360), Physics (180), and Chemistry (180) split.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-blue-100 shadow-xs hover:border-blue-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="font-heading font-bold text-slate-900 text-sm sm:text-base">Study Hours Impact</div>
            <p className="text-xs text-slate-500 mt-1">Realistic formula based on daily consistency.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="font-heading font-bold text-slate-900 text-sm sm:text-base">Instant WhatsApp Card</div>
            <p className="text-xs text-slate-500 mt-1">Download custom graphic scorecard to challenge friends.</p>
          </div>

        </div>

      </div>
    </section>
  );
};
