import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AIAnalysisResult } from '../../types/aiAnalysis';
import { RoutePath } from '../../types';

interface GeminiAnalysisCardProps {
  aiAnalysis: AIAnalysisResult | null;
  onNavigate?: (path: RoutePath) => void;
}

export const GeminiAnalysisCard: React.FC<GeminiAnalysisCardProps> = ({
  aiAnalysis,
  onNavigate,
}) => {
  if (!aiAnalysis) {
    return (
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Gemini AI Analysis</h3>
            <p className="text-[11px] text-slate-400">Semantic reasoning and response evaluation</p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-slate-950/60 border border-slate-800 text-center space-y-3">
          <div className="text-sm font-semibold text-slate-300">AI Analysis Not Available</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Transcript evaluation has not been executed for this candidate.
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/candidate')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-950/40"
            >
              <span>Run Candidate Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const {
    answerQualityScore,
    resumeConsistencyScore,
    relevanceScore,
    technicalDepthScore,
    aiConfidence,
    overallAssessment,
  } = aiAnalysis;

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Gemini AI Analysis</h3>
            <p className="text-[11px] text-slate-400">
              Evaluated via @google/genai TypeScript SDK
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
          Model: gemini-3.8-flash
        </span>
      </div>

      {/* 5 AI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Answer Quality */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Answer Quality</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">{answerQualityScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${answerQualityScore}%` }} />
          </div>
        </div>

        {/* Resume Consistency */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Resume Consistency</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">{resumeConsistencyScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${resumeConsistencyScore}%` }} />
          </div>
        </div>

        {/* Relevance */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Relevance</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">{relevanceScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${relevanceScore}%` }} />
          </div>
        </div>

        {/* Technical Depth */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Technical Depth</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">{technicalDepthScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${technicalDepthScore}%` }} />
          </div>
        </div>

        {/* AI Confidence */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">AI Confidence</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-purple-300">{aiConfidence}</span>
            <span className="text-xs text-slate-500 font-mono">%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: `${aiConfidence}%` }} />
          </div>
        </div>
      </div>

      {/* Overall Assessment Box */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
          Overall Assessment
        </h4>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          {overallAssessment}
        </div>
      </div>
    </div>
  );
};
