import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { RiskAssessment } from '../../types/riskEngine';
import { AIAnalysisResult } from '../../types/aiAnalysis';

interface ExecutiveSummaryCardProps {
  riskAssessment: RiskAssessment | null;
  aiAnalysis: AIAnalysisResult | null;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  riskAssessment,
  aiAnalysis,
}) => {
  if (!riskAssessment || !aiAnalysis) {
    return (
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-slate-300">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Executive Summary</h2>
        </div>
        <div className="p-6 rounded-lg bg-slate-950/60 border border-slate-800 text-center space-y-2">
          <div className="text-sm font-semibold text-slate-300">Analysis Not Available</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No completed Gemini AI evaluation or deterministic risk assessment was found for this session. Complete an analysis on the Candidate page or run an interview to generate verified metrics.
          </p>
        </div>
      </div>
    );
  }

  const { score, level, signals } = riskAssessment;
  const activeSignalCount = signals.length;

  const levelColor =
    level === 'low'
      ? 'text-emerald-400'
      : level === 'medium'
      ? 'text-amber-400'
      : 'text-rose-400';

  const levelBadge =
    level === 'low'
      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
      : level === 'medium'
      ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
      : 'bg-rose-950/70 text-rose-300 border-rose-800/60';

  const recommendationText =
    aiAnalysis.recommendation === 'consistent' ? 'Consistent' : 'Review Required';

  const recommendationBadge =
    aiAnalysis.recommendation === 'consistent'
      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
      : 'bg-amber-950/70 text-amber-300 border-amber-800/60';

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Executive Summary</h2>
            <p className="text-xs text-slate-400">Consolidated risk score, AI metrics, and reviewer guidance</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Automated Synthesis
        </span>
      </div>

      {/* 5-Metric Executive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Metric 1: Risk Score */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Risk Score</div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${levelColor}`}>{score}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-500">Deterministic Engine</div>
        </div>

        {/* Metric 2: Risk Level */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Risk Level</div>
          <div className="pt-0.5">
            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider font-mono border ${levelBadge}`}>
              {level === 'low' ? 'Low Risk' : level === 'medium' ? 'Medium Risk' : 'High Risk'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">0–30 | 31–60 | 61–100</div>
        </div>

        {/* Metric 3: AI Confidence */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">AI Confidence</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-purple-300">{aiAnalysis.aiConfidence}</span>
            <span className="text-xs text-slate-500 font-mono">%</span>
          </div>
          <div className="text-[10px] text-slate-500">Gemini LLM Certainty</div>
        </div>

        {/* Metric 4: Recommendation */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Recommendation</div>
          <div className="pt-0.5">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold font-mono border ${recommendationBadge}`}>
              {recommendationText}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">Evaluator Decision Support</div>
        </div>

        {/* Metric 5: Active Signals */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Signals</div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${activeSignalCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activeSignalCount}
            </span>
            <span className="text-xs text-slate-500">contributing</span>
          </div>
          <div className="text-[10px] text-slate-500">Observable triggers</div>
        </div>
      </div>
    </div>
  );
};
