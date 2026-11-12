import React from 'react';
import { BookOpen, Calculator, Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface AboutMethodologyProps {
  onStartChallenge: () => void;
}

export const AboutMethodology: React.FC<AboutMethodologyProps> = ({ onStartChallenge }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-700">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-3">
          <Calculator className="w-4 h-4" />
          <span>Open Mathematical Model</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
          How The NEET 2027 Score Formula Works
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-2">
          100% Deterministic • Openly Audited • No Black-Box AI • Capped at 720 Marks
        </p>
      </div>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        
        {/* Why No AI */}
        <section className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 p-6 sm:p-8 rounded-3xl border border-indigo-100">
          <div className="flex items-center gap-2.5 text-indigo-900 font-heading font-bold text-lg mb-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2>Why We Refuse to Use &quot;AI&quot; for Score Prediction</h2>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">
            Many websites market exaggerated &quot;AI Predictions&quot; that produce erratic, unexplainable numbers designed to panic students. We believe competitive exam preparation requires <strong>clear, inspectable mathematics</strong>. Our formula models realistic growth curves observed across thousands of historical NEET test series.
          </p>
        </section>

        {/* The Exact Mathematical Formula */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-xl text-slate-900">
            The Deterministic Calculation Model
          </h2>
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto shadow-inner leading-relaxed">
            <div className="text-sky-300 font-bold mb-2">// Core NEET 2027 Prediction Equation:</div>
            <p>Score = BaseMidpoint + (StudyHoursDelta * TimeWeight + SyllabusDelta + StageBonus) * TimelineFactor</p>
            <p className="text-emerald-400 mt-2">// Clamped between 210 and 720</p>
            <p className="text-purple-300">FinalScore = Math.min(720, Math.max(210, Math.round(Score)));</p>
          </div>
        </section>

        {/* Parameter Deep Dive */}
        <section className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Parameters Explained:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">1</span>
                <span>Base Mock Midpoint (260 to 650)</span>
              </h4>
              <p className="text-xs text-slate-600 mt-2">
                Your current test score represents your active baseline retention and test-taking speed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">2</span>
                <span>Daily Study Hours Boost</span>
              </h4>
              <p className="text-xs text-slate-600 mt-2">
                Every hour above 3 hours of self-study compounds over remaining months into higher accuracy in numericals and NCERT line recall.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">3</span>
                <span>Syllabus Coverage Factor</span>
              </h4>
              <p className="text-xs text-slate-600 mt-2">
                Full 100% syllabus coverage unlocks optional Section B questions and interlinked questions across Botany, Zoology, Physics, and Chemistry.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">4</span>
                <span>Exam Timeline Multiplier</span>
              </h4>
              <p className="text-xs text-slate-600 mt-2">
                NEET 2027 provides a healthy 12-24 month runway, allowing systematic concept revision and error analysis.
              </p>
            </div>

          </div>
        </section>

        {/* Subject Breakdown Standard */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-slate-900">
            NEET Exam Structure & Scoring Rules
          </h2>
          <p className="text-sm text-slate-600">
            NEET (UG) is conducted for a total of <strong>720 marks</strong> across 4 subjects:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs text-amber-800 font-bold block">Physics</span>
              <span className="text-lg font-black text-amber-900">180 Marks</span>
              <span className="text-[10px] text-amber-700 block">45 questions</span>
            </div>
            <div className="p-3 bg-pink-50 rounded-xl border border-pink-200">
              <span className="text-xs text-pink-800 font-bold block">Chemistry</span>
              <span className="text-lg font-black text-pink-900">180 Marks</span>
              <span className="text-[10px] text-pink-700 block">45 questions</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-bold block">Botany</span>
              <span className="text-lg font-black text-emerald-900">180 Marks</span>
              <span className="text-[10px] text-emerald-700 block">45 questions</span>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
              <span className="text-xs text-teal-800 font-bold block">Zoology</span>
              <span className="text-lg font-black text-teal-900">180 Marks</span>
              <span className="text-[10px] text-teal-700 block">45 questions</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="pt-6 text-center">
          <button
            onClick={onStartChallenge}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
          >
            Take the Challenge Now
          </button>
        </div>

      </div>
    </div>
  );
};
