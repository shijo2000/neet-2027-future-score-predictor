import React, { useState } from 'react';
import { GraduationCap, Landmark, Globe, CheckCircle2, ChevronDown, ChevronUp, Sparkles, ShieldCheck } from 'lucide-react';

interface MbbsGuidanceProps {
  onOpenGuidanceModal: () => void;
  onStartChallenge: () => void;
}

export const MbbsGuidance: React.FC<MbbsGuidanceProps> = ({
  onOpenGuidanceModal,
  onStartChallenge
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the safe target score for a Government Medical College (GMC) in NEET 2027?',
      a: 'Under 15% All India Quota (AIQ), general category cutoffs typically range between 610 and 650+ depending on annual paper difficulty. Under 85% State Quota, cutoffs vary significantly by state (e.g., Delhi, Rajasthan, and UP have higher cutoffs of 620+, while Karnataka, Maharashtra, and North-Eastern states range between 570 and 610).'
    },
    {
      q: 'Does NEET qualifying score guarantee an MBBS seat?',
      a: 'No. Qualifying NEET (scoring around 130–160 marks for General) only makes you eligible to participate in MCC and State counselling. Securing a seat depends on merit rank, category quota, and choice filling.'
    },
    {
      q: 'What are the NMC rules for pursuing MBBS Abroad?',
      a: 'According to the National Medical Commission (NMC) Foreign Medical Graduate Licentiate (FMGL) Regulations: The MBBS course must be at least 54 months of English medium study, plus a 12-month clinical internship in the same foreign institution, and the student must obtain a license to practice in that country before appearing for the Indian NExT licensing exam.'
    },
    {
      q: 'Is there any fee or payment required for this admission guidance?',
      a: 'None! Our initial admission guidance, college cutoff analysis, and quota eligibility consultation are 100% free of charge.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-4">
          <GraduationCap className="w-4 h-4" />
          <span>Strategic Admission Advisory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
          Complete MBBS College & Admission Guidance
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
          Navigate 15% All India Quota, 85% State Quotas, Semi-Govt seats, and WHO/NMC recognized international universities with complete transparency.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenGuidanceModal}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Request Free 1-on-1 Consultation</span>
          </button>
          
          <button
            onClick={onStartChallenge}
            className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
          >
            Predict My Score First
          </button>
        </div>
      </div>

      {/* 3 Pathway Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* Pillar 1: AIQ & State GMCs */}
        <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-lg text-slate-900 mb-2">
            Government Medical Colleges (GMC)
          </h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            AIIMS, central universities (JIPMER, BHU, AMU), and 15% AIQ seats managed by the Medical Counselling Committee (MCC).
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Nominal subsidized annual fees (₹5k - ₹50k)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>High clinical patient flow & surgical exposure</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Requires 600+ target score for general category</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2: Private & Semi-Govt */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-lg text-slate-900 mb-2">
            Private & Deemed Universities
          </h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Reputed private institutions (CMC Vellore, KMC Manipal, Sri Ramachandra, DY Patil) with state and management quotas.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Modern infrastructure & advanced simulation labs</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Government quota seats available in select states</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Annual budget ranges between ₹8L and ₹25L+</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: NMC Recognized MBBS Abroad */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-lg text-slate-900 mb-2">
            MBBS Abroad (NMC Compliant)
          </h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Government universities in Georgia, Uzbekistan, Russia, and Kazakhstan strictly compliant with NMC FMGL gazette norms.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Total 5-year budget: ₹18L – ₹30L complete</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span>English medium teaching & WHO recognized</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Qualifies Indian aspirants to sit for NExT / USMLE</span>
            </li>
          </ul>
        </div>

      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200">
        <h2 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>Frequently Asked Questions by Aspirants & Parents</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-indigo-600 cursor-pointer bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-indigo-600" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="mt-12 text-center p-8 rounded-3xl bg-indigo-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl font-heading font-bold">
            Still Confused About Your Options?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Speak with an authorized counsellor to compare college fee structures, bond requirements, and state quota cutoff trends.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenGuidanceModal}
              className="px-6 py-3.5 bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Get Free Admission Guidance
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
