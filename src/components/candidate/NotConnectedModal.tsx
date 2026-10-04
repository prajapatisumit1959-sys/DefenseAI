import React from 'react';
import {
  Cpu,
  X,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface NotConnectedModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  responsesCount: number;
}

export const NotConnectedModal: React.FC<NotConnectedModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  responsesCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0D1424] border border-cyan-800/80 shadow-2xl p-6 space-y-5 text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Cpu className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-semibold text-cyan-400 tracking-wider">
              Integration Architecture Notice
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              AI Analysis Engine is not connected yet.
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Connect Gemini in the next development stage.
            </p>
          </div>
        </div>

        {/* Informative Staging Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-200 font-medium">
            <span>Staged Candidate Payload Status:</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Gemini
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center justify-between">
              <span>Candidate Record:</span>
              <span className="text-slate-200">{candidateName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Prepared Transcripts:</span>
              <span className="text-slate-200">{responsesCount} Question Responses</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Resume Metadata:</span>
              <span className="text-slate-200">Parsed Skills & Experience</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Output Contract:</span>
              <span className="text-cyan-400">Explainable Decision-Support Scoring</span>
            </div>
          </div>
        </div>

        {/* Ethical boundary reminder */}
        <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-900/40 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Strict Zero-Fake-Data Discipline:</strong> No random risk scores or synthetic cheating verdicts have been generated. Real AI inference will execute once the Gemini SDK proxy is configured.
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
