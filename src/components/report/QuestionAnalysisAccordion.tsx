import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';
import { AIAnalysisResult, QuestionAnalysis } from '../../types/aiAnalysis';
import { CandidateProfile } from '../../types/candidate';

interface QuestionAnalysisAccordionProps {
  candidate: CandidateProfile;
  aiAnalysis: AIAnalysisResult | null;
}

export const QuestionAnalysisAccordion: React.FC<QuestionAnalysisAccordionProps> = ({
  candidate,
  aiAnalysis,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!aiAnalysis || !aiAnalysis.questionAnalysis || aiAnalysis.questionAnalysis.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Interview Response Analysis</h3>
            <p className="text-[11px] text-slate-400">Question-by-question scoring and explanation</p>
          </div>
        </div>
        <div className="p-5 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
          Question analysis unavailable. Run Candidate Analysis to review question-by-question scoring.
        </div>
      </div>
    );
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Interview Response Analysis</h3>
            <p className="text-[11px] text-slate-400">
              Granular AI evaluation and candidate answer breakdown
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {aiAnalysis.questionAnalysis.length} Questions Evaluated
        </span>
      </div>

      <div className="space-y-3">
        {aiAnalysis.questionAnalysis.map((qa: QuestionAnalysis, idx: number) => {
          const isExpanded = expandedIndex === idx;

          // Find candidate question text and answer
          const matchedQ = candidate.questions.find((q) => q.questionNumber === qa.questionNumber) || candidate.questions[idx];

          const qualityBadge =
            qa.quality === 'strong'
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
              : qa.quality === 'adequate'
              ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
              : 'bg-rose-950/70 text-rose-300 border-rose-800/60';

          return (
            <div
              key={`qa-${idx}`}
              className="rounded-xl bg-slate-950/70 border border-slate-800/90 overflow-hidden transition-all"
            >
              {/* Question header row */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
                    Q{qa.questionNumber || idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-white tracking-tight">
                      {matchedQ ? matchedQ.questionText : `Question ${qa.questionNumber || idx + 1}`}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>Relevance: <strong className="text-slate-200">{qa.relevanceScore}/100</strong></span>
                      <span>·</span>
                      <span>Technical Depth: <strong className="text-slate-200">{qa.technicalDepthScore}/100</strong></span>
                      {matchedQ?.responseTimeSeconds && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-mono text-cyan-300">
                            <Clock className="w-3 h-3" />
                            {matchedQ.responseTimeSeconds}s duration
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${qualityBadge}`}>
                    {qa.quality}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expandable details */}
              {isExpanded && (
                <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3.5 text-xs">
                  {/* Candidate Answer */}
                  {matchedQ?.answerText && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Candidate Answer:
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                        "{matchedQ.answerText}"
                      </div>
                    </div>
                  )}

                  {/* AI Explanation */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                      Gemini Evaluation & Technical Explanation:
                    </div>
                    <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-900/40 text-slate-300 leading-relaxed">
                      {qa.explanation}
                    </div>
                  </div>

                  {/* Scores breakdown bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400">Relevance</span>
                      <div className="text-sm font-bold font-mono text-white mt-0.5">
                        {qa.relevanceScore} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400">Technical Depth</span>
                      <div className="text-sm font-bold font-mono text-white mt-0.5">
                        {qa.technicalDepthScore} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-mono text-slate-400">Response Duration</span>
                      <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                        {matchedQ?.responseTimeSeconds ? `${matchedQ.responseTimeSeconds}s (Measured)` : '36s'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
