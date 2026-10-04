import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { AIAnalysisResult } from '../../types/aiAnalysis';
import { CandidateProfile } from '../../types/candidate';
import { HumanReviewState, DeterministicTestScenario } from '../../types/riskEngine';
import { evaluateRiskAssessment } from '../../services/riskEngine';
import { RiskAssessmentSection } from './RiskAssessmentSection';

interface AIAnalysisResultViewProps {
  result: AIAnalysisResult;
  candidate: CandidateProfile;
  onRerun: () => void;
  onEditInputs: () => void;
  humanReviewState?: HumanReviewState;
  onUpdateHumanReview?: (reviewState: HumanReviewState) => void;
}

export const AIAnalysisResultView: React.FC<AIAnalysisResultViewProps> = ({
  result,
  candidate,
  onRerun,
  onEditInputs,
  humanReviewState,
  onUpdateHumanReview,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showLimitations, setShowLimitations] = useState(false);
  const [activeScenario, setActiveScenario] = useState<DeterministicTestScenario | null>(null);

  // Local human review state fallback if not managed by parent
  const [localReview, setLocalReview] = useState<HumanReviewState>(
    humanReviewState || {
      status: 'pending',
      reviewerNotes: '',
    }
  );

  const handleReviewChange = (updated: HumanReviewState) => {
    setLocalReview(updated);
    if (onUpdateHumanReview) {
      onUpdateHumanReview(updated);
    }
  };

  // If a test/demo scenario is selected, use its mockGeminiResult; otherwise use real live result
  const effectiveResult = activeScenario ? activeScenario.mockGeminiResult : result;

  // Calculate Explainable Risk Assessment deterministically
  const riskAssessment = useMemo(() => {
    return evaluateRiskAssessment({
      geminiAnalysis: effectiveResult,
      interviewMetadata: {
        candidateId: candidate.id,
        candidateName: candidate.name,
        role: candidate.role,
      },
      humanReview: localReview,
    });
  }, [effectiveResult, candidate, localReview]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-800/50 bg-emerald-950/40';
    if (score >= 70) return 'text-cyan-400 border-cyan-800/50 bg-cyan-950/40';
    if (score >= 50) return 'text-amber-400 border-amber-800/50 bg-amber-950/40';
    return 'text-rose-400 border-rose-800/50 bg-rose-950/40';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/60">
            High Severity
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60">
            Medium Severity
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
            Low Severity
          </span>
        );
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'strong':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
            Strong Quality
          </span>
        );
      case 'adequate':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
            Adequate
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/40">
            Needs Clarification
          </span>
        );
    }
  };

  const isReviewRequired = effectiveResult.recommendation === 'review_required';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Step 3 Header Indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold uppercase">
            Step 3 of 5
          </span>
          <span className="text-xs font-semibold text-white">Gemini AI Semantic Consistency Evaluation</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Automated interview vs resume cross-check
        </span>
      </div>

      {/* 1. Header Banner & Final Recommendation */}
      <div
        className={`rounded-xl border p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isReviewRequired
            ? 'bg-amber-950/20 border-amber-800/50'
            : 'bg-emerald-950/20 border-emerald-800/50'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isReviewRequired
                ? 'bg-amber-950 border-amber-700/60 text-amber-400'
                : 'bg-emerald-950 border-emerald-700/60 text-emerald-400'
            }`}
          >
            {isReviewRequired ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                AI Evaluation Result
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] font-mono text-cyan-400">
                Model: {effectiveResult.modelUsed || 'gemini-3.8-flash'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Recommendation:</span>
              <span
                className={`font-mono uppercase tracking-wide ${
                  isReviewRequired ? 'text-amber-300' : 'text-emerald-300'
                }`}
              >
                {isReviewRequired ? 'Review Required' : 'Consistent Baseline'}
              </span>
            </h3>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isReviewRequired
                ? 'Inconsistencies or response depth variances were surfaced that warrant targeted recruiter follow-up inquiry.'
                : 'Candidate demonstrated coherent answers aligned with stated resume qualifications across all evaluated questions.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={onRerun}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Re-evaluate</span>
          </button>
          <button
            type="button"
            onClick={onEditInputs}
            className="px-3 py-1.5 text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            Edit Inputs
          </button>
        </div>
      </div>

      {/* 2. Executive Assessment Summary Card */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Overall Assessment</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Synthesized Evaluation
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
          {effectiveResult.overallAssessment}
        </p>
      </div>

      {/* 3. 5 Key Metric Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
            Answer Quality
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {effectiveResult.answerQualityScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border text-center ${getScoreColor(
              effectiveResult.answerQualityScore
            )}`}
          >
            Correctness & Scope
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
            Resume Consistency
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {effectiveResult.resumeConsistencyScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border text-center ${getScoreColor(
              effectiveResult.resumeConsistencyScore
            )}`}
          >
            Stated Skills Fit
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
            Relevance
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {effectiveResult.relevanceScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border text-center ${getScoreColor(
              effectiveResult.relevanceScore
            )}`}
          >
            Prompt Alignment
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
            Technical Depth
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {effectiveResult.technicalDepthScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border text-center ${getScoreColor(
              effectiveResult.technicalDepthScore
            )}`}
          >
            Engineering Detail
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
            AI Confidence
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tabular-nums">
              {effectiveResult.aiConfidence}%
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-cyan-800/50 bg-cyan-950/40 text-cyan-300 text-center">
            Evidence Weight
          </span>
        </div>
      </div>

      {/* 4. EXPLAINABLE RISK ANALYSIS ENGINE (Step 4 of 5) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold uppercase">
              Step 4 of 5
            </span>
            <span className="text-xs font-semibold text-white">Multi-Vector Risk Assessment Engine</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Synthesizes behavioral, latency & technical consistency flags
          </span>
        </div>
        <RiskAssessmentSection
          assessment={riskAssessment}
          liveGeminiResult={effectiveResult}
          candidateName={candidate.name}
          onUpdateHumanReview={handleReviewChange}
          onSelectTestScenario={(scenario) => setActiveScenario(scenario)}
          activeScenarioId={activeScenario?.id}
        />
      </div>

      {/* 5. Potential Signals Section (Gemini Transcript Citations) */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              <span>Potential Signals Requiring Human Review</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified response patterns, nuance discrepancies, or areas for recruiter follow-up
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
            {effectiveResult.potentialSignals.length} Signal{effectiveResult.potentialSignals.length === 1 ? '' : 's'}
          </span>
        </div>

        {effectiveResult.potentialSignals.length > 0 ? (
          <div className="space-y-3">
            {effectiveResult.potentialSignals.map((signal, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">
                      {signal.type}
                    </span>
                  </div>
                  {getSeverityBadge(signal.severity)}
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {signal.description}
                </p>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
                  <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">
                    Transcript Reference & Evidence:
                  </span>
                  <span className="text-slate-300 italic">
                    "{signal.evidence}"
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
            <p className="font-medium text-slate-300">No anomalous signals surfaced.</p>
            <p className="text-[11px] text-slate-500">
              The candidate's responses demonstrated expected depth without noticeable inconsistencies.
            </p>
          </div>
        )}
      </div>

      {/* 6. Question-by-Question Analysis */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Question-by-Question Analysis</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed technical and relevance breakdown for each question prompt
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {effectiveResult.questionAnalysis.length} Evaluated
          </span>
        </div>

        <div className="space-y-3">
          {effectiveResult.questionAnalysis.map((qa) => {
            const isExpanded = expandedQuestion === qa.questionNumber;
            const originalQ = candidate.questions.find(
              (q) => q.questionNumber === qa.questionNumber
            );

            return (
              <div
                key={qa.questionNumber}
                className="rounded-lg bg-slate-950/70 border border-slate-800 overflow-hidden text-xs transition-colors"
              >
                {/* Accordion Bar */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedQuestion(isExpanded ? null : qa.questionNumber)
                  }
                  className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded shrink-0">
                      Q{qa.questionNumber}
                    </span>
                    <span className="font-semibold text-white truncate text-xs sm:text-sm">
                      {originalQ?.questionText || `Interview Question ${qa.questionNumber}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    {getQualityBadge(qa.quality)}
                    <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                      Rel: <strong className="text-white">{qa.relevanceScore}%</strong> · Depth: <strong className="text-white">{qa.technicalDepthScore}%</strong>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3 bg-[#0B111E]/40">
                    {originalQ && (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                        <span className="text-slate-400 font-mono font-semibold block uppercase tracking-wider text-[10px]">
                          Candidate Transcript:
                        </span>
                        <p className="text-slate-200 leading-relaxed italic">
                          "{originalQ.answerText}"
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] font-mono">
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Relevance Score:</span>
                        <span className="font-bold text-cyan-400">{qa.relevanceScore}/100</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Technical Depth:</span>
                        <span className="font-bold text-cyan-400">{qa.technicalDepthScore}/100</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/30 text-xs text-slate-200 space-y-1">
                      <span className="text-[11px] font-mono text-cyan-300 font-semibold block">
                        AI Evaluator Commentary:
                      </span>
                      <p className="leading-relaxed text-slate-300">
                        {qa.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Expandable Limitations Section */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowLimitations(!showLimitations)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
        >
          <span className="font-semibold text-slate-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>AI Analysis Limitations & Methodology</span>
          </span>
          {showLimitations ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showLimitations && (
          <div className="p-4 pt-0 border-t border-slate-800/60 space-y-2 text-[11px] text-slate-400 font-mono leading-relaxed">
            {effectiveResult.limitations.map((lim, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">•</span>
                <span>{lim}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
