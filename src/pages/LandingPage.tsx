import React from 'react';
import {
  Shield,
  Search,
  Activity,
  UserCheck,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Eye,
  Sliders,
  CheckCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { RoutePath } from '../types';

interface LandingPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const featureCards = [
    {
      title: 'AI Answer Analysis',
      icon: Search,
      category: 'Linguistic Evaluation',
      description:
        'Examine candidate answer structure, vocabulary entropy, and response cadence for patterns indicative of pre-generated or recited scripts.',
      benefit: 'Highlights response shifts for follow-up without automated disqualification.',
    },
    {
      title: 'Interview Signal Monitoring',
      icon: Activity,
      category: 'Telemetry & Gaze',
      description:
        'Track audio latency gaps, dual-monitor gaze deviation, and voice-synthesis markers in real time during live virtual interview sessions.',
      benefit: 'Supplies interviewers with passive situational awareness prompts.',
    },
    {
      title: 'Explainable Risk Scoring',
      icon: Sliders,
      category: 'Transparent Audit',
      description:
        'Every flagged anomaly is paired with clear explanatory context, confidence ranges, and verified counter-explanations (e.g. network jitter).',
      benefit: 'Eliminates black-box automated scoring with fully auditable logs.',
    },
    {
      title: 'Human Review Workflow',
      icon: UserCheck,
      category: 'Decision Support',
      description:
        'Structured recruiter sign-off pipelines where human hiring managers validate flagged moments against technical problem-solving rubric.',
      benefit: 'Guarantees fairness by keeping humans strictly authoritative in hiring decisions.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar following Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Zone 1: Single Brand element */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              Defense<span className="text-cyan-400">AI</span>
            </span>
          </button>

          {/* Zone 2: 4-6 text links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="hover:text-cyan-400 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('/candidate')}
              className="hover:text-cyan-400 transition-colors"
            >
              Candidate Analysis
            </button>
            <button
              onClick={() => onNavigate('/interview')}
              className="hover:text-cyan-400 transition-colors"
            >
              Live Monitoring
            </button>
            <button
              onClick={() => onNavigate('/report')}
              className="hover:text-cyan-400 transition-colors"
            >
              Audit Reports
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-4 py-2 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs shadow-cyan-950 font-medium"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 border-b border-slate-800/80 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Unboxed category kicker with typographic separator */}
          <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-mono">
            <span>Enterprise Decision Support</span>
            <span aria-hidden="true">·</span>
            <span>Version 1.0</span>
            <span aria-hidden="true">·</span>
            <span>Zero Autonomous Disqualification</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-tight">
            DefenseAI
            <span className="block mt-2 text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-300">
              AI-Assisted Interview Security
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            Analyze interview responses and behavioral signals to identify potential inconsistencies and support faster human review.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/candidate')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <span>View Demo</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Required Clear Disclaimer */}
          <div className="mt-8 pt-6 max-w-2xl mx-auto">
            <div className="p-4 rounded-lg bg-slate-900/90 border border-cyan-900/40 text-left flex items-start gap-3">
              <div className="p-1 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider font-mono">
                  Ethical Boundary & Regulatory Guardrail
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  DefenseAI provides decision-support signals and does not determine whether a candidate is cheating or using AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
            Architecture & Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Designed for Trust, Explainability, and Precision
          </h2>
          <p className="text-sm text-slate-400">
            A comprehensive suite engineered to assist talent acquisition teams during virtual assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-800/40 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {feat.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{feat.benefit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Workflow Mechanism Walkthrough */}
      <section className="py-16 px-6 bg-[#0B111E] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Recruiter Workflow
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                How DefenseAI Empowers Human Reviewers
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Rather than issuing binary accusations, the system surfaces contextual markers with audio, video, and text telemetry timestamps so hiring teams can ask focused follow-ups.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                  <div className="font-mono text-cyan-400 font-bold">01.</div>
                  <div>
                    <span className="font-medium text-white block">Passive Telemetry Stream</span>
                    Live signals capture response latency, screen transitions, and gaze shifts.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                  <div className="font-mono text-cyan-400 font-bold">02.</div>
                  <div>
                    <span className="font-medium text-white block">Contextual Anomaly Highlighting</span>
                    Potential flags are accompanied by alternative plausible explanations.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                  <div className="font-mono text-cyan-400 font-bold">03.</div>
                  <div>
                    <span className="font-medium text-white block">Human Technical Validation</span>
                    The interviewer validates genuine mastery via targeted counter-questions.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sample Signal Interface Mockup */}
            <div className="lg:col-span-7">
              <div className="rounded-xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
                <div className="px-4 py-3 bg-[#0D1527] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="ml-2 text-xs font-mono text-slate-400">
                      Sample Signal Dossier · INT-8919
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Decision Support Active
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-slate-400">Candidate:</span>{' '}
                      <span className="text-white font-medium">Marcus Vance</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Role:</span>{' '}
                      <span className="text-slate-200">Principal Cloud Architect</span>
                    </div>
                    <div className="font-mono text-amber-400">
                      Flag: Review Advised
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-300">
                        Signal: Latency Gap & Speech Cadence Discontinuity
                      </span>
                      <span className="font-mono text-slate-400">Timestamp 14:22</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Candidate paused for 6.2s before reciting formal documentation definitions with abrupt pitch modulation.
                    </p>
                    <div className="text-[11px] text-slate-400 border-t border-amber-900/30 pt-1.5 flex items-center justify-between">
                      <span>Plausible benign cause: Network packet buffering</span>
                      <span className="text-cyan-400 font-mono">Suggested follow-up ready</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Encrypted telemetry stream · Compliant with privacy standards</span>
                    </div>
                    <button
                      onClick={() => onNavigate('/candidate')}
                      className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                    >
                      Inspect in candidate view <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-800/80 text-xs text-slate-500 font-mono text-center space-y-2">
        <p>DefenseAI · AI-Assisted Interview Security & Decision Support Platform</p>
        <p className="text-slate-600">
          All analysis is assistive. Ultimate candidate evaluation and hiring choices remain solely with the human recruiting team.
        </p>
      </footer>
    </div>
  );
};
