import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  VideoOff,
  MicOff,
  UserCheck,
  FileText,
  Sliders,
  Sparkles,
  HelpCircle,
  Activity,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  RiskAssessment,
  RiskLevel,
  RiskSignal,
  HumanReviewState,
  DeterministicTestScenario,
} from '../../types/riskEngine';
import {
  IMPORTANT_LIMITATION_STATEMENT,
  DETERMINISTIC_TEST_SCENARIOS,
  evaluateRiskAssessment,
} from '../../services/riskEngine';
import { AIAnalysisResult } from '../../types/aiAnalysis';

interface RiskAssessmentSectionProps {
  assessment: RiskAssessment;
  liveGeminiResult: AIAnalysisResult;
  candidateName: string;
  onUpdateHumanReview: (reviewState: HumanReviewState) => void;
  onSelectTestScenario?: (scenario: DeterministicTestScenario | null) => void;
  activeScenarioId?: string | null;
}

export const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({
  assessment,
  liveGeminiResult,
  candidateName,
  onUpdateHumanReview,
  onSelectTestScenario,
  activeScenarioId,
}) => {
  const [reviewerNotes, setReviewerNotes] = useState(assessment.humanReview.reviewerNotes || '');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Score styling logic
  const getLevelConfig = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return {
          label: 'High Risk',
          colorText: 'text-rose-400',
          colorBg: 'bg-rose-950/40',
          colorBorder: 'border-rose-800/60',
          badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800',
          meterFill: '#f43f5e',
          meterTrack: '#4c0519',
          icon: ShieldAlert,
          reviewHeadline: 'Additional Human Verification Recommended',
        };
      case 'medium':
        return {
          label: 'Medium Risk',
          colorText: 'text-amber-400',
          colorBg: 'bg-amber-950/40',
          colorBorder: 'border-amber-800/60',
          badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800',
          meterFill: '#f59e0b',
          meterTrack: '#451a03',
          icon: AlertTriangle,
          reviewHeadline: 'Manual Review Recommended',
        };
      case 'low':
      default:
        return {
          label: 'Low Risk',
          colorText: 'text-emerald-400',
          colorBg: 'bg-emerald-950/40',
          colorBorder: 'border-emerald-800/60',
          badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
          meterFill: '#10b981',
          meterTrack: '#022c22',
          icon: ShieldCheck,
          reviewHeadline: 'Standard Review Protocol',
        };
    }
  };

  const config = getLevelConfig(assessment.level);
  const LevelIcon = config.icon;

  // Horizontal bar chart data for signals that contributed to the score
  const contributingChartData = assessment.signals
    .filter((s) => s.scoreContribution > 0)
    .map((s) => ({
      name: s.name.length > 24 ? s.name.slice(0, 22) + '...' : s.name,
      fullName: s.name,
      contribution: s.scoreContribution,
      severity: s.severity,
    }));

  const handleMarkReviewed = () => {
    const updated: HumanReviewState = {
      status: 'reviewed',
      reviewerNotes: reviewerNotes.trim() || 'Reviewed and validated by recruiter.',
      reviewedBy: 'Primary Recruiter',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdateHumanReview(updated);
    setActionFeedback('Candidate profile marked as Reviewed.');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleRequestVerification = () => {
    const updated: HumanReviewState = {
      status: 'additional_verification_requested',
      reviewerNotes: reviewerNotes.trim() || 'Requested targeted technical follow-up session.',
      reviewedBy: 'Primary Recruiter',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdateHumanReview(updated);
    setActionFeedback('Follow-up technical verification flagged for recruiter action.');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Circular gauge SVG calculations
  const radius = 58;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (assessment.score / 100) * circumference;

  return (
    <div className="space-y-6 pt-2">
      {/* 0. Section Header & Test / Demo Scenarios Switcher */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Explainable Risk Analysis Engine</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/40">
              Deterministic Rules
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Transparently scores interview transcripts across weighted risk indicators for human reviewer consideration.
          </p>
        </div>

        {/* Demo / Test Scenarios Switcher (Section 15 requirement) */}
        {onSelectTestScenario && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Engine Scenarios:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => onSelectTestScenario(null)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                  !activeScenarioId
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Live evaluation based on current candidate answers"
              >
                Live Analysis
              </button>
              {DETERMINISTIC_TEST_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onSelectTestScenario(sc)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                    activeScenarioId === sc.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={sc.description}
                >
                  {sc.targetLevel.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeScenarioId && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Previewing <strong>Test / Demo Scenario</strong> ({activeScenarioId}). This fixture demonstrates deterministic engine scoring without modifying real candidate records.
            </span>
          </div>
          {onSelectTestScenario && (
            <button
              onClick={() => onSelectTestScenario(null)}
              className="text-xs underline hover:text-white shrink-0 ml-3"
            >
              Return to Live
            </button>
          )}
        </div>
      )}

      {/* 1. Primary Risk Summary Banner (Score & Circular Gauge) */}
      <div
        className={`rounded-xl border p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 ${config.colorBg} ${config.colorBorder}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${config.badgeClass}`}
          >
            <LevelIcon className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Risk Engine Evaluation
              </span>
              <span className="text-slate-600">·</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wide border ${config.badgeClass}`}
              >
                {config.label}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-slate-300">
                Score: <strong className="text-white">{assessment.score}</strong> / 100
              </span>
            </div>

            <h4 className="text-lg font-bold text-white tracking-tight">
              {config.reviewHeadline}
            </h4>

            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              {assessment.recommendation}
            </p>

            <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>{assessment.summary}</span>
            </div>
          </div>
        </div>

        {/* Circular Gauge / Progress Visualization */}
        <div className="flex items-center justify-center shrink-0 self-center">
          <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="currentColor"
                className="text-slate-800"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={config.meterFill}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono text-white leading-none">
                {assessment.score}
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                / 100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Score Breakdown Chart & Telemetry Status (Grid: 7 cols chart / 5 cols telemetry) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recharts Horizontal Bar Chart (Score Breakdown) */}
        <div className="lg:col-span-7 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Score Breakdown by Contributing Signal</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                {contributingChartData.length} Active Indicator{contributingChartData.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visualizes the exact mathematical point additions that contributed to the final risk score.
            </p>
          </div>

          {contributingChartData.length > 0 ? (
            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={contributingChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 25]}
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `+${v}`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={130}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`+${val} Points`, 'Score Addition']}
                    labelFormatter={(label) => `Signal: ${label}`}
                  />
                  <Bar
                    dataKey="contribution"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  >
                    {contributingChartData.map((entry, index) => {
                      const fill =
                        entry.severity === 'high'
                          ? '#f43f5e'
                          : entry.severity === 'medium'
                          ? '#f59e0b'
                          : '#10b981';
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400 my-auto">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <p className="font-medium text-slate-300">0 Score Contributions</p>
              <p className="text-[11px] text-slate-500">
                All transcript indicators remained within baseline expectations. No points were added.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Score formula: Sum(active weights) clamped to 100</span>
            <span className="text-white font-semibold">Total: {assessment.score} pts</span>
          </div>
        </div>

        {/* Right: Data Source Telemetry Integrity Status */}
        <div className="lg:col-span-5 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Sensor Telemetry Status</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                Zero Mock Data
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Signals only activate with authentic sensor feeds. Inactive streams never add artificial risk points.
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Gemini Transcript Analysis */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Transcript Evaluation</div>
                  <div className="text-[10px] text-slate-400 font-mono">Gemini 3.8 Flash Engine</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                Connected
              </span>
            </div>

            {/* Camera / OpenCV Feed */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <VideoOff className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-300">Camera / Vision Telemetry</div>
                  <div className="text-[10px] text-slate-500 font-mono">OpenCV Pipeline</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                Not Connected
              </span>
            </div>

            {/* Behavioral Audio Latency */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <MicOff className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-300">Behavioral Audio Latency</div>
                  <div className="text-[10px] text-slate-500 font-mono">Speech Timestamp Stream</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                Not Connected
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-snug">
            Unconnected video and audio signals contribute <strong className="text-slate-300">+0 points</strong> to protect candidates against synthetic false positives.
          </div>
        </div>
      </div>

      {/* 3. Section: "Explainable Risk Signals" (Detailed Cards) */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Explainable Risk Signals</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic evaluation of weighted indicators with mathematical score contributions and evidence
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded">
            {assessment.signals.length} of {assessment.allSignals.length} Active
          </span>
        </div>

        <div className="space-y-3.5">
          {assessment.allSignals.map((signal) => {
            const isContributing = signal.active && signal.scoreContribution > 0;
            const isUnconnected = signal.status === 'not_connected';

            return (
              <div
                key={signal.id}
                className={`p-4 rounded-xl border transition-colors ${
                  isContributing
                    ? signal.severity === 'high'
                      ? 'bg-rose-950/20 border-rose-900/50'
                      : 'bg-amber-950/20 border-amber-900/50'
                    : isUnconnected
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                {/* Top Bar: Name, Severity, Weight, Contribution */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm text-white">
                      {signal.name}
                    </span>
                    {isContributing ? (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          signal.severity === 'high'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {signal.severity} severity
                      </span>
                    ) : isUnconnected ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                        Sensor Not Connected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/40">
                        Baseline Normal
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                    <span className="text-slate-400">
                      Weight: <strong className="text-slate-200">{signal.weight}</strong>
                    </span>
                    <span className="text-slate-600">·</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        isContributing
                          ? signal.severity === 'high'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Contribution: {isContributing ? `+${signal.scoreContribution}` : '+0'}
                    </span>
                  </div>
                </div>

                {/* Description & Explanation */}
                <div className="space-y-1.5 text-xs text-slate-300 mt-1">
                  <p className="leading-relaxed">
                    <span className="font-semibold text-slate-200">Explanation: </span>
                    {signal.explanation}
                  </p>
                </div>

                {/* Evidence Quote */}
                <div className="mt-2.5 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">
                    Evidentiary Transcript Reference:
                  </span>
                  <span className="text-slate-200 italic leading-relaxed block">
                    "{signal.evidence}"
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Section 11: "Human Review" Panel */}
      <div className="rounded-xl bg-slate-900/80 border border-cyan-900/40 p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Human Review Panel
              </h4>
              <p className="text-xs text-slate-400">
                Recruiter validation, manual review notes, and verification protocol
              </p>
            </div>
          </div>

          {/* Current Review Status Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono text-slate-400">Status:</span>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
                assessment.humanReview.status === 'reviewed'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : assessment.humanReview.status === 'additional_verification_requested'
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {assessment.humanReview.status === 'reviewed'
                ? '✓ Reviewed & Cleared'
                : assessment.humanReview.status === 'additional_verification_requested'
                ? '⚠ Additional Verification'
                : 'Pending Review'}
            </span>
          </div>
        </div>

        {actionFeedback && (
          <div className="p-3 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono animate-in fade-in duration-200">
            {actionFeedback}
          </div>
        )}

        {/* Protocol Recommendation Prompt */}
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-200">
              Suggested Review Directive:
            </div>
            <p className="text-slate-400 leading-relaxed">
              {assessment.level === 'low'
                ? 'Current evidence shows no major review signals. Continue normal human evaluation protocol.'
                : assessment.level === 'medium'
                ? 'Manual review is recommended. Review the highlighted question transcript citations above before proceeding.'
                : 'Multiple review signals identified. Conduct additional human technical verification with the candidate before making any hiring decisions.'}
            </p>
          </div>
        </div>

        {/* Reviewer Notes Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Reviewer Notes & Justification</span>
            <span className="text-[11px] font-normal text-slate-500">
              Internal audit trail
            </span>
          </label>
          <textarea
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            placeholder="Add recruiter observations, transcript verification details, or scheduled follow-up notes..."
            rows={3}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 p-3 text-xs text-slate-200 placeholder-slate-600 outline-hidden font-normal"
          />
        </div>

        {/* Review Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-500 font-mono">
            {assessment.humanReview.updatedAt
              ? `Last updated: ${assessment.humanReview.updatedAt} by ${assessment.humanReview.reviewedBy || 'Recruiter'}`
              : 'Audit status: Unsaved draft in local session'}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRequestVerification}
              className="px-3.5 py-2 text-xs font-semibold bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-800/80 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Request Additional Verification</span>
            </button>

            <button
              type="button"
              onClick={handleMarkReviewed}
              className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Reviewed</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Mandatory Limitation Banner (Section 13) */}
      <div className="rounded-lg bg-slate-900/90 border border-cyan-900/40 p-4 text-xs text-slate-300 flex items-start gap-3 shadow-xs">
        <div className="p-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-cyan-200 text-xs">
            Regulatory & Ethical Notice
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {IMPORTANT_LIMITATION_STATEMENT}
          </p>
        </div>
      </div>
    </div>
  );
};
