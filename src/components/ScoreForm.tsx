import React, { useState } from 'react';
import { PredictionInputs } from '../types';
import { INDIAN_STATES, MOCK_SCORE_RANGES, PREP_LEVELS } from '../utils/scoreCalculator';
import { User, MapPin, Target, Clock, BookOpen, Calendar, HelpCircle, ArrowRight, Sparkles, CheckCircle2, Phone, ShieldCheck } from 'lucide-react';

interface ScoreFormProps {
  onSubmit: (inputs: PredictionInputs) => void;
  isLoading: boolean;
}

export const ScoreForm: React.FC<ScoreFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PredictionInputs>({
    name: '',
    phone: '',
    state: 'Maharashtra',
    mockScoreRange: '400-479',
    dailyStudyHours: 6,
    prepLevel: 'class12-starter',
    syllabusCompletion: 55,
    monthsRemaining: 15,
    keyWeakSubject: 'physics'
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Please enter your first name or nickname');
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStep(1);
      setValidationError('Please enter your name');
      return;
    }

    const cleanPhone = (formData.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setValidationError('Please enter your valid 10-digit mobile number to calculate your score');
      return;
    }

    setValidationError(null);
    onSubmit(formData);
  };

  return (
    <div id="predictor-form" className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-indigo-950/5 border border-indigo-100 overflow-hidden">
        
        {/* Form Header with Step Indicator */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 px-6 sm:px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                NEET 2027 Challenge
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold mt-0.5">
                Calculate Your Future Score
              </h2>
            </div>
            
            {/* Step Counter Badge */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-100">
              <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>Step {step} of 2</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-indigo-950/50 rounded-full h-1.5 mt-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <p className="text-xs text-indigo-200/80 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Instant deterministic calculation & verified performance roadmap</span>
          </p>
        </div>

        {/* FORM CONTENT */}
        <div className="p-6 sm:p-8">
          {validationError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
              {validationError}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6 animate-in fade-in duration-200">
              {/* Aspirant Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Your Name / Future Doctor Alias <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all bg-slate-50/50 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Used solely to personalize your downloadable scorecard.
                </span>
              </div>

              {/* State of Domicile */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>State of Domicile / Preparation Location <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all bg-white cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  State quotas (85%) have significantly different cutoffs than 15% All India Quota.
                </span>
              </div>

              {/* Preparation Level / Category */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Current Academic Stage for NEET 2027</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PREP_LEVELS.map((prep) => {
                    const isSelected = formData.prepLevel === prep.id;
                    return (
                      <button
                        type="button"
                        key={prep.id}
                        onClick={() => setFormData({ ...formData, prepLevel: prep.id })}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {prep.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Mock Test Score Range */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Current Mock Test Score (or recent test score) <span className="text-rose-500">*</span></span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MOCK_SCORE_RANGES.map((range) => {
                    const isSelected = formData.mockScoreRange === range.id;
                    return (
                      <button
                        type="button"
                        key={range.id}
                        onClick={() => setFormData({ ...formData, mockScoreRange: range.id })}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {range.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Step Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 text-sm sm:text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Prep Habits & Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
              
              {/* Daily Study Hours Slider */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Daily Self-Study Hours (Excluding coaching lectures)</span>
                  </label>
                  <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-sm rounded-lg shadow-xs">
                    {formData.dailyStudyHours} hrs / day
                  </span>
                </div>
                
                <input
                  type="range"
                  min={2}
                  max={13}
                  step={1}
                  value={formData.dailyStudyHours}
                  onChange={(e) => setFormData({ ...formData, dailyStudyHours: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
                  <span>2 hrs (Light)</span>
                  <span>6 hrs (Consistent)</span>
                  <span>9 hrs (Dedicated)</span>
                  <span>12+ hrs (Intense)</span>
                </div>
              </div>

              {/* Syllabus Completion Slider */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>NEET Syllabus Completion Level</span>
                  </label>
                  <span className="px-3 py-1 bg-purple-600 text-white font-extrabold text-sm rounded-lg shadow-xs">
                    {formData.syllabusCompletion}% Completed
                  </span>
                </div>
                
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={formData.syllabusCompletion}
                  onChange={(e) => setFormData({ ...formData, syllabusCompletion: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
                  <span>10% (Just beginning)</span>
                  <span>50% (Halfway)</span>
                  <span>80% (Near finish)</span>
                  <span>100% (Full revision)</span>
                </div>
              </div>

              {/* Months Remaining Slider / Selector */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Months Remaining Before Exam (NEET 2027)</span>
                  </label>
                  <span className="px-3 py-1 bg-blue-600 text-white font-extrabold text-sm rounded-lg shadow-xs">
                    {formData.monthsRemaining} Months
                  </span>
                </div>
                
                <input
                  type="range"
                  min={6}
                  max={24}
                  step={1}
                  value={formData.monthsRemaining}
                  onChange={(e) => setFormData({ ...formData, monthsRemaining: parseInt(e.target.value, 10) })}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
                  <span>6 mos</span>
                  <span>12 mos (1 Year)</span>
                  <span>16 mos (Standard 2027)</span>
                  <span>24 mos (2 Years)</span>
                </div>
              </div>

              {/* Subject Weakness Identification */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Subject That Needs Maximum Improvement</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  {[
                    { id: 'physics', label: 'Physics (Numerical)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                    { id: 'chemistry', label: 'Chemistry (Organic/Inorganic)', color: 'text-pink-700 bg-pink-50 border-pink-200' },
                    { id: 'botany', label: 'Botany (Morphology/Genetics)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                    { id: 'zoology', label: 'Zoology (Human Physiology)', color: 'text-teal-700 bg-teal-50 border-teal-200' },
                    { id: 'none', label: 'Balanced Across All', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                  ].map((sub) => {
                    const isSelected = formData.keyWeakSubject === sub.id;
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => setFormData({ ...formData, keyWeakSubject: sub.id as any })}
                        className={`p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 border-indigo-600 bg-indigo-100/60 text-indigo-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Last Field: Mobile / WhatsApp Phone Number */}
              <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-blue-50/90 p-4 sm:p-5 rounded-2xl border-2 border-indigo-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    <span>WhatsApp / Mobile Number <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                    Scorecard Dispatch
                  </span>
                </div>

                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') });
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 text-sm sm:text-base rounded-r-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Your number is used to deliver your NEET 2027 projected scorecard and college cutoff report.</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 px-6 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-xl shadow-indigo-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Calculating Score Model...</span>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                      <span>Reveal My NEET 2027 Score</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
