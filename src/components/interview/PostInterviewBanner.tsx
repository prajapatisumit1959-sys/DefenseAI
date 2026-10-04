import React from 'react';
import { CheckCircle2, User, FileBarChart, LayoutDashboard, ArrowRight, RotateCcw } from 'lucide-react';
import { RoutePath } from '../../types';

interface PostInterviewBannerProps {
  sessionDuration: string;
  onNavigate: (path: RoutePath) => void;
  onRestart: () => void;
}

export const PostInterviewBanner: React.FC<PostInterviewBannerProps> = ({
  sessionDuration,
  onNavigate,
  onRestart,
}) => {
  return (
    <div className="rounded-2xl bg-linear-to-r from-emerald-950/40 via-cyan-950/40 to-slate-900/80 border border-emerald-700/60 p-6 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Interview Session Completed</h2>
            <p className="text-xs text-slate-300">
              Session duration: <span className="font-mono font-semibold text-emerald-300">{sessionDuration}</span>. Telemetry and timeline events preserved.
            </p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-colors self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Step 3: Candidate & AI Analysis */}
        <button
          onClick={() => onNavigate('/candidate')}
          className="group p-4 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-cyan-800/50 hover:border-cyan-500/80 transition-all text-left flex flex-col justify-between gap-3 shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
              Step 3 & 4
            </span>
          </div>
          <div>
            <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
              <span>Run Gemini AI Analysis</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Cross-check candidate responses and compute multi-factor risk
            </div>
          </div>
        </button>

        {/* Step 5: Final Report */}
        <button
          onClick={() => onNavigate('/report')}
          className="group p-4 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-indigo-800/50 hover:border-indigo-500/80 transition-all text-left flex flex-col justify-between gap-3 shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <FileBarChart className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
              Step 5
            </span>
          </div>
          <div>
            <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
              <span>Generate Final Report</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              View explainable dossier, complete review checklist & export
            </div>
          </div>
        </button>

        {/* Return to Dashboard */}
        <button
          onClick={() => onNavigate('/dashboard')}
          className="group p-4 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left flex flex-col justify-between gap-3 shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-semibold">
              Overview
            </span>
          </div>
          <div>
            <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Return to recruiter metrics & candidate evaluation queue
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
