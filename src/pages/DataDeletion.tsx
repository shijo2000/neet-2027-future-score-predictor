import React, { useState } from 'react';
import { submitDataDeletionRequest } from '../lib/supabase';
import { Trash2, ShieldCheck, CheckCircle2, Phone, AlertCircle, ArrowLeft } from 'lucide-react';

interface DataDeletionProps {
  onBackToHome: () => void;
}

export const DataDeletion: React.FC<DataDeletionProps> = ({ onBackToHome }) => {
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('Withdrawing admission counselling consent');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultMessage(null);

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length !== 10) {
      setError('Please provide the 10-digit Indian mobile number used during registration.');
      return;
    }

    setLoading(true);

    try {
      const res = await submitDataDeletionRequest(clean, reason);
      if (res.success) {
        setIsSuccess(true);
        setResultMessage(res.message);
      } else {
        setError(res.message || 'Unable to log deletion request. Please contact support.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
              Request Data Deletion
            </h1>
            <p className="text-xs text-slate-500">
              Indian DPDP Act 2023 • Right to Erasure / Unsubscribe
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-heading font-bold text-slate-900">
              Deletion Request Received
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {resultMessage}
            </p>
            <div className="pt-2">
              <button
                onClick={onBackToHome}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Back to Score Predictor
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">
              If you or your child previously opted in for free MBBS admission guidance and would like all associated contact records completely wiped from our database, please enter the registered phone number below.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>Registered 10-Digit Mobile Number <span className="text-rose-500">*</span></span>
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
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-r-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Deletion (Optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-rose-600 outline-hidden bg-white"
              >
                <option value="Withdrawing admission counselling consent">Withdrawing admission counselling consent</option>
                <option value="Minor privacy protection requested by parent">Minor privacy protection requested by parent</option>
                <option value="Already admitted in medical college">Already admitted in medical college</option>
                <option value="General data deletion">General data deletion</option>
              </select>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToHome}
                className="px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-600/20 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Processing Deletion Request...' : 'Permanently Delete My Data'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-2">
              🔒 In compliance with the Digital Personal Data Protection Act 2023, all records matching this number are purged without retention.
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
