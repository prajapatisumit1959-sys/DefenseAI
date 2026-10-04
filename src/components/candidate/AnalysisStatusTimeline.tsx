import React from 'react';
import { CheckCircle2, Circle, Clock, Sparkles, Loader2 } from 'lucide-react';

interface AnalysisStatusTimelineProps {
  currentStatus?: string;
  hasResume: boolean;
  responsesCount: number;
  isAiLoading?: boolean;
  isAiCompleted?: boolean;
}

export const AnalysisStatusTimeline: React.FC<AnalysisStatusTimelineProps> = ({
  currentStatus,
  hasResume,
  responsesCount,
  isAiLoading = false,
  isAiCompleted = false,
}) => {
  const displayStatus = currentStatus || (
    isAiLoading
      ? 'Gemini Analysis In Progress...'
      : isAiCompleted
      ? 'Analysis Completed'
      : 'Ready for Analysis'
  );

  const steps = [
    {
      id: 'step-1-candidate',
      label: '1. Candidate & Credentials',
      completed: true,
      inProgress: false,
      description: hasResume ? 'Profile & resume skills verified' : 'Candidate credentials loaded',
    },
    {
      id: 'step-2-interview',
      label: '2. Interview Telemetry',
      completed: responsesCount > 0,
      inProgress: false,
      description: `${responsesCount} questions transcribed & timed`,
    },
    {
      id: 'step-3-ai',
      label: '3. Gemini AI Analysis',
      completed: isAiCompleted,
      inProgress: isAiLoading,
      description: isAiCompleted
        ? 'Semantic & technical depth evaluated'
        : isAiLoading
        ? 'Cross-checking answers against resume'
        : 'Ready for Gemini semantic reasoning',
    },
    {
      id: 'step-4-risk',
      label: '4. Risk Assessment',
      completed: isAiCompleted,
      inProgress: false,
      description: isAiCompleted
        ? 'Multi-factor risk score computed'
        : 'Synthesizes consistency & latency flags',
    },
    {
      id: 'step-5-report',
      label: '5. Final Report Dossier',
      completed: isAiCompleted,
      inProgress: false,
      description: isAiCompleted ? 'Audited dossier ready for sign-off' : 'Pending evaluation completion',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4 hover:border-slate-700/80 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Analysis Pipeline Status
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">Current Status:</span>
            <span
              className={`text-xs font-semibold font-mono ${
                isAiCompleted
                  ? 'text-emerald-300'
                  : isAiLoading
                  ? 'text-cyan-300 animate-pulse'
                  : 'text-cyan-300'
              }`}
            >
              {displayStatus}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
          Step {completedCount} of {steps.length}
        </span>
      </div>

      {/* Steps List */}
      <div className="relative pl-1 space-y-3">
        {/* Subtle connecting vertical line */}
        <div className="absolute left-[13px] top-2 bottom-3 w-[1px] bg-slate-800/80 pointer-events-none" />

        {steps.map((s) => (
          <div key={s.id} className="relative flex items-start gap-3">
            {/* Status Icon */}
            <div className="z-10 mt-0.5">
              {s.completed ? (
                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700/80 flex items-center justify-center text-emerald-400 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : s.inProgress ? (
                <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shadow-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-500">
                  <Circle className="w-2.5 h-2.5" />
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-xs font-medium ${
                    s.completed
                      ? 'text-slate-200'
                      : s.inProgress
                      ? 'text-cyan-300 font-mono font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    s.completed
                      ? 'text-emerald-400'
                      : s.inProgress
                      ? 'text-cyan-400 animate-pulse'
                      : 'text-slate-600'
                  }`}
                >
                  {s.completed ? 'Done' : s.inProgress ? 'In Progress' : 'Pending'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
