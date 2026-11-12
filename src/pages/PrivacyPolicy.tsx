import React from 'react';
import { ShieldCheck, Lock, Baby, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigateToDeletion: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigateToDeletion }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-700">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>DPDP Act 2023 Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Minor Protection Charter
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Effective Date: January 1, 2025 • Last Updated for NEET 2027 Session
        </p>
      </div>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        
        {/* Core Principles */}
        <section className="bg-indigo-50/60 p-6 rounded-2xl border border-indigo-100">
          <h2 className="text-lg font-heading font-bold text-indigo-950 mb-2">
            Our Core Privacy Commitment
          </h2>
          <p className="text-indigo-900 text-sm">
            At <strong>NEET 2027 Future Score Predictor</strong>, we believe educational tools should never compromise student trust. You can calculate your projected score <strong>without providing a phone number or email</strong>. Personal information is only collected if you voluntarily opt in for personalized MBBS admission guidance.
          </p>
        </section>

        {/* Section 1: Minors Data Protection */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <Baby className="w-5 h-5" />
            <h2 className="font-heading text-slate-900">1. Special Protections for Minors (Under 18 Years)</h2>
          </div>
          <p>
            Many NEET 2027 aspirants are in Class 11 or Class 12 and may be under 18 years of age. In strict adherence to Section 9 of the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
            <li>We require verifiable parental or legal guardian consent prior to collecting any contact details of individuals under 18 years.</li>
            <li>We <strong>do not undertake any behavioral monitoring or targeted advertising</strong> directed at children or students.</li>
            <li>We do not process minors’ personal data in any manner that causes detrimental effects on child well-being.</li>
          </ul>
        </section>

        {/* Section 2: What We Collect */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <Lock className="w-5 h-5" />
            <h2 className="font-heading text-slate-900">2. Data We Collect and Why</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="p-3 border border-slate-200">Data Category</th>
                  <th className="p-3 border border-slate-200">Required For Scorecard?</th>
                  <th className="p-3 border border-slate-200">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-900">First Name / Nickname</td>
                  <td className="p-3 text-emerald-600 font-bold">Yes (for personalization)</td>
                  <td className="p-3">Printed on your downloadable score graphic.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">State of Domicile</td>
                  <td className="p-3 text-emerald-600 font-bold">Yes</td>
                  <td className="p-3">Determining state quota cutoff benchmarking.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Mocks & Study Hours</td>
                  <td className="p-3 text-emerald-600 font-bold">Yes</td>
                  <td className="p-3">Executing transparent mathematical estimation formula.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Phone Number</td>
                  <td className="p-3 text-rose-600 font-bold">NO (100% Optional)</td>
                  <td className="p-3">Collected solely if you request free admission counselling.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Legal Basis & Consent */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-slate-900">
            3. Explicit Consent & Zero Spam Policy
          </h2>
          <p>
            When submitting an admission guidance request, our consent box is <strong>unchecked by default</strong>. You may withdraw your consent at any time. We do not sell your contact details to third-party marketing brokers or send automated promotional SMS blasts.
          </p>
        </section>

        {/* Section 4: Data Deletion */}
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-heading text-slate-900">4. Right to Erasure & Data Deletion</h2>
          </div>
          <p className="text-sm text-slate-600">
            Under Indian DPDP Act guidelines, you have an unconditional right to have your data permanently deleted from our records within 48 hours of your request.
          </p>
          <div>
            <button
              onClick={onNavigateToDeletion}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span>Submit Instant Deletion Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Section 5: Grievance Officer */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-slate-900">
            5. Grievance Redressal & Contact
          </h2>
          <p className="text-sm">
            In accordance with the Information Technology Act 2000 and DPDP Act 2023, the details of our Data Protection & Grievance Officer are:
          </p>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1">
            <p><strong>Designation:</strong> Data Protection & Compliance Officer</p>
            <p><strong>Desk:</strong> NEET 2027 Student Welfare & Privacy Cell</p>
            <p><strong>Email:</strong> <span className="text-indigo-600">privacy@neet2027score.in</span></p>
            <p><strong>Jurisdiction:</strong> New Delhi, India</p>
          </div>
        </section>

      </div>
    </div>
  );
};
