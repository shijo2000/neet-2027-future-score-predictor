import React from 'react';
import { Stethoscope, ShieldCheck, HeartHandshake, AlertTriangle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      {/* Disclaimer Banner */}
      <div className="bg-amber-950/40 border-b border-amber-500/20 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-300">Mandatory Transparency Notice:</span>{' '}
            NEET 2027 Future Score Predictor provides an <strong>illustrative, non-scientific benchmark estimate</strong> intended exclusively for motivation, self-assessment, and study habit planning. This tool is <strong>not</strong> an official or psychometrically validated National Testing Agency (NTA) exam prediction. <strong>No artificial intelligence or machine learning APIs are used</strong>—all estimations follow an openly published, deterministic mathematical formula based on user-entered mock scores and study hours. NEET is a registered trademark of the National Testing Agency.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-heading font-extrabold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span>NEET 2027 Score</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering Indian medical aspirants with transparent benchmark challenges, realistic milestones, and ethical, opt-in MBBS admission counselling guidance.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Explore & Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer text-left"
                >
                  Take Score Challenge
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('methodology')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer text-left"
                >
                  Formula & Scoring Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('guidance')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer text-left"
                >
                  Free MBBS Admission Guidance
                </button>
              </li>
              <li>
                <a
                  href="https://neet.nta.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-indigo-400 transition-colors text-slate-500"
                >
                  Official NTA NEET Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Privacy & Safeguards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer text-left"
                >
                  Privacy Policy (Minor Protection)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer text-left"
                >
                  Terms of Service & Usage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('deletion')}
                  className="hover:text-rose-400 text-rose-300/80 transition-colors cursor-pointer text-left"
                >
                  Request Data Deletion (DPDP)
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Admin Portal Login</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Admissions Desk & Support
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have questions regarding MBBS cutoffs, state quota eligibility, or data privacy?
            </p>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 text-xs space-y-1">
              <p className="text-slate-300 font-medium">Admission Support Desk</p>
              <p className="text-slate-400">Email: <span className="text-indigo-300">support@neet2027score.in</span></p>
              <p className="text-slate-400">Grievance Officer: New Delhi, India</p>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} NEET 2027 Future Score Predictor. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Crafted with</span>
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
            <span>for Future Doctors of India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
