import React, { useState } from 'react';
import { AdmissionPreference } from '../types';
import { INDIAN_STATES } from '../utils/scoreCalculator';
import { submitOptInLead } from '../lib/supabase';
import { X, GraduationCap, ShieldCheck, Phone, User, MapPin, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledName: string;
  prefilledPhone?: string;
  prefilledState: string;
  estimatedScore: number;
  onSuccess: (id: string) => void;
  onNavigateToPrivacy?: () => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  prefilledName,
  prefilledPhone = '',
  prefilledState,
  estimatedScore,
  onSuccess,
  onNavigateToPrivacy
}) => {
  const [name, setName] = useState(prefilledName || '');
  const [phone, setPhone] = useState(prefilledPhone || '');
  const [state, setState] = useState(prefilledState || 'Delhi NCR');
  const [admissionPreference, setAdmissionPreference] = useState<AdmissionPreference>('India');
  const [isMinor, setIsMinor] = useState(false);
  const [parentName, setParentName] = useState('');
  // CRITICAL REQUIREMENT: Separate UNCHECKED consent checkbox
  const [hasConsented, setHasConsented] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    if (prefilledPhone) setPhone(prefilledPhone);
    if (prefilledName) setName(prefilledName);
    if (prefilledState) setState(prefilledState);
  }, [isOpen, prefilledPhone, prefilledName, prefilledState]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your name');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }

    if (isMinor && !parentName.trim()) {
      setError('Please enter parent / guardian name for minor applicant authorization');
      return;
    }

    // Explicit consent validation
    if (!hasConsented) {
      setError('Please review and check the explicit consent box to request counselling');
      return;
    }

    setLoading(true);

    try {
      const res = await submitOptInLead({
        name: name.trim(),
        phone: cleanPhone,
        state,
        admission_preference: admissionPreference,
        estimated_score: estimatedScore,
        lead_source: 'MBBS Guidance',
        is_minor: isMinor,
        parent_guardian_name: isMinor ? parentName.trim() : undefined
      });

      if (res.success) {
        setSubmittedSuccess(true);
        if (res.id) onSuccess(res.id);
      } else {
        setError(res.message || 'Failed to submit guidance request. Please try again.');
      }
    } catch (err: unknown) {
      setError('An unexpected error occurred while saving your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 px-6 py-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Personalized 1-on-1 Guidance
              </span>
              <h3 className="text-lg sm:text-xl font-heading font-bold">
                Free MBBS Admission Counselling
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submittedSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-heading font-extrabold text-slate-900">
                Request Registered Successfully!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{name}</strong>! An experienced medical admission counselor will review your score profile ({estimatedScore} / 720) and connect with you on WhatsApp or phone call.
              </p>
              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Return to Score Card
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                <span>Predicted Score Profile:</span>
                <span className="font-extrabold text-indigo-700 bg-white px-2.5 py-1 rounded-md shadow-2xs">
                  {estimatedScore} / 720
                </span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Student Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>10-Digit Mobile / WhatsApp Number <span className="text-rose-500">*</span></span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9876543210"
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-r-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used solely to share personalized college cutoff lists. Never sold or shared for spam.
                </span>
              </div>

              {/* Domicile State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>State of Domicile <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admission Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  MBBS Admission Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['India', 'Abroad', 'Both', 'Undecided'] as AdmissionPreference[]).map((pref) => {
                    const isSelected = admissionPreference === pref;
                    return (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => setAdmissionPreference(pref)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pref === 'India' && 'Govt/Pvt India'}
                        {pref === 'Abroad' && 'MBBS Abroad'}
                        {pref === 'Both' && 'India & Abroad'}
                        {pref === 'Undecided' && 'Undecided'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minor / Parental Consent Flow */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMinor}
                    onChange={(e) => setIsMinor(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    I am under 18 years of age (Parental authorization required)
                  </span>
                </label>

                {isMinor && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Parent / Legal Guardian Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={isMinor}
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-indigo-600 outline-hidden bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      In compliance with the Indian DPDP Act 2023, personal data of minors is processed solely upon verifiable parental consent.
                    </span>
                  </div>
                )}
              </div>

              {/* SEPARATE UNCHECKED EXPLICIT CONSENT CHECKBOX (MANDATORY REQUIREMENT) */}
              <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/40">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={hasConsented}
                    onChange={(e) => {
                      setHasConsented(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong className="text-slate-900">Opt-in Consent:</strong> I explicitly consent to receive a free phone call or WhatsApp message regarding medical college admission counselling, cutoff trends, and fee structures. I understand this data will <strong>never</strong> be used for advertising or behavioral tracking, and I can request deletion anytime.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Decline & Close
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Request Free Counselling'}</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <span className="text-[10px] text-slate-400">
                  🔒 Strictly Protected under DPDP Act 2023 •{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigateToPrivacy) onNavigateToPrivacy();
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    View Privacy Policy
                  </button>
                </span>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
