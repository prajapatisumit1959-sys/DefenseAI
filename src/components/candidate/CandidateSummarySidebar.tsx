import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  User,
  CheckCircle2,
  FileText,
  Clock,
  Briefcase,
  Play,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { CandidateProfile } from '../../types/candidate';
import { AIAnalysisResult } from '../../types/aiAnalysis';
import { RiskAssessment } from '../../types/riskEngine';

interface CandidateSummarySidebarProps {
  candidate: CandidateProfile;
  responsesCount: number;
  hasResume: boolean;
  isLoading?: boolean;
  analysisResult?: AIAnalysisResult | null;
  riskAssessment?: RiskAssessment | null;
  onRunAnalysis: () => void;
}

export const CandidateSummarySidebar: React.FC<CandidateSummarySidebarProps> = ({
  candidate,
  responsesCount,
  hasResume,
  isLoading = false,
  analysisResult,
  riskAssessment,
  onRunAnalysis,
}) => {
  const getAnalysisStatusBadge = () => {
    if (isLoading) {
      return {
        text: 'Analyzing...',
        color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40 animate-pulse',
      };
    }
    if (analysisResult) {
      return {
        text: 'Generated',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
      };
    }
    return {
      text: 'Not Started',
      color: 'text-slate-400 bg-slate-800 border-slate-700',
    };
  };

  const getRiskStatusBadge = () => {
    if (riskAssessment) {
      if (riskAssessment.level === 'high') {
        return {
          text: `High Risk (${riskAssessment.score})`,
          color: 'text-rose-300 bg-rose-950/70 border-rose-800/60',
        };
      }
      if (riskAssessment.level === 'medium') {
        return {
          text: `Medium Risk (${riskAssessment.score})`,
          color: 'text-amber-300 bg-amber-950/70 border-amber-800/60',
        };
      }
      return {
        text: `Low Risk (${riskAssessment.score})`,
        color: 'text-emerald-300 bg-emerald-950/70 border-emerald-800/60',
      };
    }
    if (analysisResult) {
      if (analysisResult.recommendation === 'review_required') {
        return {
          text: 'Review Required',
          color: 'text-amber-300 bg-amber-950/70 border-amber-800/60',
        };
      }
      return {
        text: 'Consistent',
        color: 'text-emerald-300 bg-emerald-950/70 border-emerald-800/60',
      };
    }
    return {
      text: 'Not Available',
      color: 'text-slate-500 bg-slate-900 border-slate-800',
    };
  };

  const analysisBadge = getAnalysisStatusBadge();
  const riskBadge = getRiskStatusBadge();

  const summaryItems = [
    { label: 'Candidate', value: candidate.name },
    { label: 'Role', value: candidate.role },
    {
      label: 'Interview',
      value: candidate.interviewStatus,
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
    },
    {
      label: 'Responses',
      value: `${responsesCount}`,
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40',
    },
    {
      label: 'Step 1: Resume',
      value: hasResume ? 'Available' : 'Missing',
      badgeColor: hasResume
        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
        : 'text-rose-400 bg-rose-950/60 border-rose-800/40',
    },
    {
      label: 'Step 2: Answers',
      value: `${responsesCount} Logged`,
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40',
    },
    {
      label: 'Step 3: AI Analysis',
      value: analysisBadge.text,
      badgeColor: analysisBadge.color,
    },
    {
      label: 'Step 4: Risk Engine',
      value: riskBadge.text,
      badgeColor: riskBadge.color,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-5 hover:border-slate-700/80 transition-all shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Analysis Overview
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
            Dossier Snapshot
          </span>
        </div>

        {/* Key-Value Breakdown List */}
        <div className="space-y-2.5 text-xs">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-900"
            >
              <span className="text-slate-400 font-mono text-[11px]">{item.label}</span>
              {item.badgeColor ? (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${item.badgeColor}`}
                >
                  {item.value}
                </span>
              ) : (
                <span className="font-semibold text-white truncate max-w-36 text-right">
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Large Primary Action Button */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onRunAnalysis}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 ${
              isLoading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 group cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Running Gemini AI...</span>
              </>
            ) : analysisResult ? (
              <>
                <RotateCcw className="w-4 h-4 text-slate-950 group-hover:-rotate-45 transition-transform" />
                <span>Step 3: Re-run AI Analysis</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>Step 3: Run AI Analysis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <div className="text-[10px] text-center text-slate-400 font-mono">
            {analysisResult
              ? `Step 3 & 4 Ready · Evaluated: ${new Date(analysisResult.evaluatedAt || Date.now()).toLocaleTimeString()}`
              : `Step 1 & 2 Inputs: ${responsesCount} Answers · ${hasResume ? '1 Resume' : '0 Resumes'}`}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug text-center px-1">
            {analysisResult
              ? 'AI analysis and multi-factor risk scoring generated. Ready for Step 5: Final Report.'
              : 'Evaluates transcript consistency against resume claims to compute Step 4: Risk Assessment.'}
          </p>
        </div>

        {/* Ethical Disclaimer Box */}
        <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-900/40 text-[11px] text-slate-400 flex items-start gap-2.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            DefenseAI provides decision-support signals and does not make automated hiring or misconduct decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
