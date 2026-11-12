import React, { useEffect, useState } from 'react';
import { PredictionResult } from '../types';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Share2, 
  Download, 
  MessageCircle, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  RotateCcw,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { downloadScoreCardImage, getWhatsAppShareUrl } from '../utils/shareCardGenerator';

interface ScoreResultProps {
  result: PredictionResult;
  onReset: () => void;
  onRequestGuidance: () => void;
}

export const ScoreResult: React.FC<ScoreResultProps> = ({
  result,
  onReset,
  onRequestGuidance
}) => {
  const [showFormula, setShowFormula] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Trigger celebratory confetti on initial score display
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#9333ea', '#38bdf8', '#fbbf24', '#10b981']
      });
    } catch {
      // Ignore if confetti fails
    }
  }, []);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadScoreCardImage(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = getWhatsAppShareUrl(result);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: 'NEET 2027 Score Challenge',
      text: `My projected score for NEET 2027 is ${result.estimatedScore}/720 (${result.collegeTier.tierName})! Take the challenge to see where you stand:`,
      url: window.location.origin
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const shareText = `Can you beat my predicted score of ${result.estimatedScore}/720 in NEET 2027? Take the free challenge here: ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-in zoom-in-95 duration-300">
      
      {/* Top Banner Notice */}
      <div className="mb-4 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scorecard generated successfully!</span>
        </span>
      </div>

      {/* MAIN SCORE CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-indigo-950/20 border border-indigo-800/40 relative overflow-hidden">
        
        {/* Decorative background ambient glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[11px] font-bold uppercase tracking-wider">
                NEET 2027 Benchmark
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                📍 {result.state}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">
              Future Dr. {result.studentName}
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Target Exam</span>
            <span className="text-sm font-bold text-amber-300">May 2027 Session</span>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="py-8 sm:py-10 text-center relative">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-300 block mb-2">
            Projected Target Score
          </span>
          
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl sm:text-8xl font-heading font-black tracking-tight bg-gradient-to-r from-sky-400 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              {result.estimatedScore}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-500">
              / 720
            </span>
          </div>

          {/* Target Score Range & Percentile Pill */}
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-sky-200">
            <span>Realistic Exam Range: <strong>{result.scoreBandMin} – {result.scoreBandMax}</strong></span>
            <span className="text-indigo-400">•</span>
            <span>Est. Top <strong>{(100 - result.estimatedPercentile).toFixed(1)}%</strong> in India</span>
          </div>

          {/* Motivational Quote */}
          <p className="mt-6 text-xs sm:text-sm text-indigo-200/90 italic max-w-xl mx-auto leading-relaxed bg-white/5 py-3 px-4 rounded-xl border border-white/10">
            {result.motivatingQuote}
          </p>
        </div>

        {/* College Probability Tier */}
        <div className="mt-2 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  College Admission Outlook
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${result.collegeTier.badgeColor}`}>
                  {result.collegeTier.isGmcLikely ? 'Government Seat Likely' : 'Private / Semi-Govt / Abroad'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {result.collegeTier.tierName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {result.collegeTier.description}
              </p>
              
              {/* Examples */}
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Benchmark Colleges:</span>
                {result.collegeTier.exampleColleges.map((col, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-white/10 text-indigo-200 font-medium">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subject-Wise Sub-Score Breakdown */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              Estimated Subject Split
            </h4>
            <span className="text-xs text-indigo-300">Total Marks: 720</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Physics */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center text-xs font-semibold text-amber-300">
                <span>Physics</span>
                <span>Max 180</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1.5">
                {result.breakdown.physics} <span className="text-xs text-slate-400 font-normal">/ 180</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-amber-400 h-1.5 rounded-full" 
                  style={{ width: `${(result.breakdown.physics / 180) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 block">
                ~{Math.round(result.breakdown.physics / 4)} correct questions
              </span>
            </div>

            {/* Chemistry */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center text-xs font-semibold text-pink-300">
                <span>Chemistry</span>
                <span>Max 180</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1.5">
                {result.breakdown.chemistry} <span className="text-xs text-slate-400 font-normal">/ 180</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-pink-400 h-1.5 rounded-full" 
                  style={{ width: `${(result.breakdown.chemistry / 180) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 block">
                ~{Math.round(result.breakdown.chemistry / 4)} correct questions
              </span>
            </div>

            {/* Biology */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-300">
                <span>Biology (Botany + Zoo)</span>
                <span>Max 360</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1.5">
                {result.breakdown.biologyTotal} <span className="text-xs text-slate-400 font-normal">/ 360</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-1.5 rounded-full" 
                  style={{ width: `${(result.breakdown.biologyTotal / 360) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 block">
                Botany: {result.breakdown.botany} | Zoology: {result.breakdown.zoology}
              </span>
            </div>
          </div>
        </div>

        {/* VIRAL SHARING ACTION BAR */}
        <div className="mt-8 pt-6 border-t border-indigo-800/60">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Challenge Friends & Save Scorecard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* Download Graphic Card */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-3 bg-white/15 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-white/20"
            >
              <Download className="w-4 h-4 text-sky-300" />
              <span>{isDownloading ? 'Rendering Card...' : 'Download Card PNG'}</span>
            </button>

            {/* Share to WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/40 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </button>

            {/* Native Mobile Share */}
            <button
              onClick={handleNativeShare}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-950/40 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Score</span>
            </button>

            {/* Copy Invite Link */}
            <button
              onClick={handleCopyLink}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-indigo-200 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-white/15"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center sm:text-left">
            🔒 Privacy guarantee: Generated share images never display your phone number or private details.
          </p>
        </div>

      </div>

      {/* STRATEGIC HIGH-CONVERSION LEAD CAPTURE CALL TO ACTION */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-lg shadow-indigo-950/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>100% Free Service</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
              Get Free MBBS College & Admission Guidance
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Wondering which Government Medical Colleges, State Quotas, or top recognized medical universities match your target score band? Speak with an expert NEET admission counselor for free.
            </p>
            <p className="text-[11px] text-slate-500">
              Completely optional • No spam guarantee • Compliant with Indian DPDP Act 2023
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={onRequestGuidance}
              className="w-full sm:w-auto px-7 py-4 text-base font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Free Guidance</span>
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </button>
          </div>
        </div>
      </div>

      {/* STUDY TIPS ACCORDION */}
      <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">
            Personalized Study Roadmap for {result.studentName}
          </h3>
        </div>

        <div className="space-y-3">
          {result.studyTips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                {idx + 1}
              </div>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TRANSPARENT DETERMINISTIC FORMULA TOGGLE */}
      <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>How Was This Score Calculated? (View Transparent Formula)</span>
          </div>
          {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormula && (
          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-3 animate-in fade-in duration-200">
            <p>
              This benchmark is computed using an <strong>open, deterministic rule-based formula</strong> without any black-box AI or hidden weights:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block">Base Mock:</span>
                <span className="font-bold text-slate-800">{result.formulaBreakdown.baseMockMidpoint} pts</span>
              </div>
              <div>
                <span className="text-slate-400 block">Study Hours Boost:</span>
                <span className="font-bold text-emerald-600">+{result.formulaBreakdown.studyHourBoost} pts</span>
              </div>
              <div>
                <span className="text-slate-400 block">Syllabus Factor:</span>
                <span className="font-bold text-indigo-600">+{result.formulaBreakdown.syllabusFactor} pts</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timeline Multiplier:</span>
                <span className="font-bold text-purple-600">x{result.formulaBreakdown.timelineMultiplier}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-amber-800 border border-amber-200 text-[11px]">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Educational & Planning Disclaimer:</strong> This estimation is intended solely for personal milestone setting and study routine discipline. Actual NEET results depend entirely on exam day execution, negative marking control, and paper difficulty set by the National Testing Agency (NTA).
              </span>
            </div>
          </div>
        )}
      </div>

      {/* RE-CALCULATE CTA */}
      <div className="mt-8 text-center pb-6">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Challenge with Different Inputs</span>
        </button>
      </div>

    </div>
  );
};
