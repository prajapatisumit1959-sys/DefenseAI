import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Loader2,
  Cpu,
  Shield,
  Layers,
} from 'lucide-react';

interface AnalysisLoadingStateProps {
  candidateName: string;
}

export const AnalysisLoadingState: React.FC<AnalysisLoadingStateProps> = ({
  candidateName,
}) => {
  const [currentStage, setCurrentStage] = useState(2); // 0-based: 2 is Gemini analysis

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStage(2), 500);
    const timer2 = setTimeout(() => setCurrentStage(3), 2800);
    const timer3 = setTimeout(() => setCurrentStage(4), 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const progressSteps = [
    {
      id: 0,
      label: 'Candidate data prepared',
      description: 'Profile credentials, skills, and projects staged',
    },
    {
      id: 1,
      label: 'Interview responses prepared',
      description: 'Question transcripts and response time metadata indexed',
    },
    {
      id: 2,
      label: 'Gemini analysis in progress',
      description: 'Evaluating technical depth, relevance & semantic coherence',
    },
    {
      id: 3,
      label: 'Risk interpretation',
      description: 'Synthesizing explainable decision-support indicators',
    },
    {
      id: 4,
      label: 'Report generation',
      description: 'Compiling structured evidentiary dossier',
    },
  ];

  return (
    <div className="rounded-xl bg-slate-900/80 border border-cyan-800/60 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
      {/* Top subtle animated accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-pulse" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Analyzing Candidate...</span>
              <span className="text-xs font-mono text-cyan-400 font-normal">
                ({candidateName})
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure server-side Gemini evaluation with neutral decision-support rubric
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded self-start sm:self-auto flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>Real-time Inference</span>
        </span>
      </div>

      {/* Progress Checklist */}
      <div className="space-y-3 max-w-xl mx-auto py-2">
        {progressSteps.map((step) => {
          const isDone = currentStage > step.id;
          const isCurrent = currentStage === step.id;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 text-xs ${
                isDone
                  ? 'bg-slate-950/70 border-emerald-900/40 text-slate-200'
                  : isCurrent
                  ? 'bg-cyan-950/30 border-cyan-700/60 text-white shadow-xs'
                  : 'bg-slate-950/30 border-slate-900 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-semibold block truncate ${
                      isCurrent
                        ? 'text-cyan-200 font-mono'
                        : isDone
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block truncate">
                    {step.description}
                  </span>
                </div>
              </div>

              <div className="shrink-0 font-mono text-[10px]">
                {isDone ? (
                  <span className="text-emerald-400">Complete</span>
                ) : isCurrent ? (
                  <span className="text-cyan-400 animate-pulse">Processing...</span>
                ) : (
                  <span className="text-slate-600">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer reassurance note */}
      <div className="pt-2 text-center text-[11px] text-slate-500 font-mono">
        DefenseAI Evaluation Engine · Adhering to zero-bias decision support guidelines
      </div>
    </div>
  );
};
