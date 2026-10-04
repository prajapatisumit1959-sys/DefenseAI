import React, { useState } from 'react';
import {
  UserCheck,
  Radio,
  Cpu,
  ShieldAlert,
  FileCheck,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RoutePath } from '../../types';

export type WorkflowStepId = 1 | 2 | 3 | 4 | 5;

export interface WorkflowStepConfig {
  step: WorkflowStepId;
  name: string;
  shortLabel: string;
  headline: string;
  description: string;
  helperText: string;
  path: RoutePath;
  icon: React.ElementType;
  badge: string;
}

export const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    step: 1,
    name: 'Candidate',
    shortLabel: '1. Candidate',
    headline: 'Candidate Profile & Credentials',
    description: 'Verify identity, claimed skills, work history, and baseline questions.',
    helperText: 'Recruiter validates resume claims and baseline interview questions prior to live evaluation.',
    path: '/candidate',
    icon: UserCheck,
    badge: 'Baseline',
  },
  {
    step: 2,
    name: 'Interview',
    shortLabel: '2. Interview',
    headline: 'Live Interview Monitoring',
    description: 'Capture live video, Haar cascade face/eye telemetry, and question response durations.',
    helperText: 'Run live webcam session with OpenCV telemetry sentinel tracking visual consistency.',
    path: '/interview',
    icon: Radio,
    badge: 'Live Telemetry',
  },
  {
    step: 3,
    name: 'AI Analysis',
    shortLabel: '3. AI Analysis',
    headline: 'Gemini Semantic Evaluation',
    description: 'Gemini evaluates transcript technical depth and cross-checks answers against resume.',
    helperText: 'Automated semantic reasoning compares candidate verbal responses with documented experience.',
    path: '/candidate',
    icon: Cpu,
    badge: 'Gemini 3.8',
  },
  {
    step: 4,
    name: 'Risk Assessment',
    shortLabel: '4. Risk Assessment',
    headline: 'Multi-Vector Risk Engine',
    description: 'Deterministic calculation synthesizing behavioral, latency, and consistency flags.',
    helperText: 'Synthesizes all telemetry into low, moderate, or elevated risk indicators with transparent weights.',
    path: '/candidate',
    icon: ShieldAlert,
    badge: 'Decision Engine',
  },
  {
    step: 5,
    name: 'Final Report',
    shortLabel: '5. Final Report',
    headline: 'Audit Dossier & Sign-Off',
    description: 'Compile explainable evidence dossier for reviewer notes, checklist, and audit export.',
    helperText: 'Human evaluator performs final verification sign-off and exports tamper-evident JSON audit dossier.',
    path: '/report',
    icon: FileCheck,
    badge: 'Audit Ready',
  },
];

interface WorkflowStepperProps {
  currentStep?: WorkflowStepId;
  onNavigate: (path: RoutePath) => void;
  variant?: 'banner' | 'compact';
  title?: string;
  allowDismiss?: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  onNavigate,
  variant = 'banner',
  title = '5-Step Recruiter Evaluation Workflow',
  allowDismiss = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<WorkflowStepId | null>(null);

  // Compact breadcrumb bar for page headers
  if (variant === 'compact') {
    return (
      <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-2.5 sm:p-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-tight uppercase font-mono">
              Recruiter Workflow
            </span>
            <span className="text-slate-600 text-xs">|</span>
            <span className="text-xs text-slate-400">
              {currentStep ? (
                <>
                  Active: <strong className="text-cyan-300 font-semibold">{WORKFLOW_STEPS[currentStep - 1].headline}</strong>
                </>
              ) : (
                'Select a phase to navigate'
              )}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden md:block">
            Step {currentStep || 1} of 5 · Decision-Support Pipeline
          </div>
        </div>

        {/* Compact Horizontal Step Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {WORKFLOW_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = currentStep === s.step;
            const isCompleted = currentStep ? currentStep > s.step : false;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onNavigate(s.path)}
                onMouseEnter={() => setHoveredStep(s.step)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`group relative p-2 rounded-lg text-left transition-all border flex items-center justify-between gap-1.5 ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-200 shadow-xs shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                    : isCompleted
                    ? 'bg-slate-900/80 border-emerald-800/40 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold font-mono transition-colors ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                        : 'bg-slate-800 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-semibold tracking-tight truncate flex items-center gap-1">
                      <span>{s.name}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono truncate">
                      {s.badge}
                    </div>
                  </div>
                </div>

                {idx < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block shrink-0 group-hover:text-slate-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Hovered or Active Step Concise Helper Tip */}
        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5 truncate">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              {hoveredStep
                ? `${WORKFLOW_STEPS[hoveredStep - 1].shortLabel}: ${WORKFLOW_STEPS[hoveredStep - 1].helperText}`
                : currentStep
                ? `${WORKFLOW_STEPS[currentStep - 1].shortLabel}: ${WORKFLOW_STEPS[currentStep - 1].helperText}`
                : 'Follow the 5-step sequence: Candidate → Interview → AI Analysis → Risk Assessment → Final Report.'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden lg:inline shrink-0">
            Click step to open
          </span>
        </div>
      </div>
    );
  }

  // Full Onboarding Banner Mode (For Dashboard & First-Time Recruiters)
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#0B111E] to-slate-900 border border-cyan-900/40 p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background visual accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title, Onboarding Badge & Collapse Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {title}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-medium">
                Recruiter Onboarding
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard operating procedure: follow the 5-step pipeline from candidate credentials to final audited sign-off.
            </p>
          </div>
        </div>

        {allowDismiss && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono transition-colors self-start sm:self-center"
          >
            <span>{isCollapsed ? 'Expand Guide' : 'Collapse'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="mt-4 space-y-4">
          {/* 5-Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {WORKFLOW_STEPS.map((stepConfig, index) => {
              const Icon = stepConfig.icon;
              const isCurrent = currentStep === stepConfig.step;

              return (
                <div
                  key={stepConfig.step}
                  className={`group relative rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200 border ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Step Number & Connector indicator */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-cyan-950 group-hover:text-cyan-300'
                      }`}
                    >
                      {stepConfig.step}
                    </span>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-400">
                      {stepConfig.badge}
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <div className="space-y-1 my-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{stepConfig.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {stepConfig.description}
                    </p>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onNavigate(stepConfig.path)}
                      className={`w-full py-1.5 px-2 rounded-md text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                          : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>Go to {stepConfig.name}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Connecting arrow indicator for desktop (shown between cards) */}
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 shadow-xs pointer-events-none">
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Helper Summary Banner */}
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-cyan-300">Recruiter Quick-Start:</span>
              <span className="text-slate-400 text-[11px]">
                Start with <strong className="text-slate-200">1. Candidate</strong> to review background claims, launch <strong className="text-slate-200">2. Interview</strong> for live telemetry, then run <strong className="text-slate-200">3. AI Analysis</strong> to compute <strong className="text-slate-200">4. Risk Assessment</strong> and export the <strong className="text-slate-200">5. Final Report</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/candidate')}
              className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer self-start sm:self-center"
            >
              <span>Begin at Step 1</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
