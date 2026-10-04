import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Bell,
  Lock,
  Users,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Save,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/layout/DisclaimerBanner';
import { RoutePath } from '../types';

interface SettingsPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [sensitivity, setSensitivity] = useState<'standard' | 'strict' | 'relaxed'>('standard');
  const [dualReviewRequired, setDualReviewRequired] = useState(true);
  const [candidateTransparency, setCandidateTransparency] = useState(true);
  const [audioLatencyMonitor, setAudioLatencyMonitor] = useState(true);
  const [gazeTrackingMonitor, setGazeTrackingMonitor] = useState(true);
  const [speechCadenceMonitor, setSpeechCadenceMonitor] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setSaveStatus('Platform configuration saved successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Application & Governance Settings
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
              Config
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure signal sensitivity thresholds, ethical safeguards, and team review governance.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-lg transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-md shadow-cyan-950/40"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveStatus && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
          {saveStatus}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ethical Guardrails & Thresholds (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Ethical Guardrails (Enforced) */}
          <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-6 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold tracking-tight">
                Mandatory Ethical Guardrails
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Core system invariants ensuring compliance with employment law and ethical hiring frameworks.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Zero Autonomous Disqualification
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    DefenseAI is strictly forbidden from triggering automatic candidate rejection.
                  </div>
                </div>
                <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
                  Enforced Lock
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Dual Reviewer Consensus
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Require two independent recruiter sign-offs before finalizing any elevated anomaly report.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dualReviewRequired}
                  onChange={(e) => setDualReviewRequired(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Candidate Explainability Right
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Allow candidates to request transparent sensor timestamp breakdown if flagged.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={candidateTransparency}
                  onChange={(e) => setCandidateTransparency(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sensor Sensitivity */}
          <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-6 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold tracking-tight">
                Signal Trigger Sensitivity
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Select threshold sensitivity for when potential inconsistencies are brought to human reviewer attention.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSensitivity('relaxed')}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  sensitivity === 'relaxed'
                    ? 'bg-cyan-950/40 border-cyan-700 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold">Relaxed</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Alerts on sustained multi-signal clusters only (&gt;8.0s delays).
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSensitivity('standard')}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  sensitivity === 'standard'
                    ? 'bg-cyan-950/40 border-cyan-700 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold">Standard (Balanced)</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Balanced sensitivity (5.0s latency thresholds, gaze tracking).
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSensitivity('strict')}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  sensitivity === 'strict'
                    ? 'bg-cyan-950/40 border-cyan-700 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold">High Sensitivity</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Surfaces all brief latency and micro-speech cadence shifts.
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Telemetry Channels */}
          <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Active Telemetry Channels
            </h3>
            <p className="text-xs text-slate-400">
              Toggle specific sensor streams evaluated during virtual interview sessions.
            </p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                <span>Audio Latency & Onset Gaps</span>
                <input
                  type="checkbox"
                  checked={audioLatencyMonitor}
                  onChange={(e) => setAudioLatencyMonitor(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                <span>Off-Axis Gaze & Dual Monitor Tracking</span>
                <input
                  type="checkbox"
                  checked={gazeTrackingMonitor}
                  onChange={(e) => setGazeTrackingMonitor(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                <span>Syntactic Speech Cadence Variance</span>
                <input
                  type="checkbox"
                  checked={speechCadenceMonitor}
                  onChange={(e) => setSpeechCadenceMonitor(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Team Workspace Roles (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold tracking-tight">Team Workspace</h3>
            </div>
            <p className="text-xs text-slate-400">
              Authorized reviewers in this talent evaluation workspace.
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">Sarah Jenkins</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Lead Reviewer</span>
                </div>
                <div className="text-[11px] text-slate-400">s.jenkins@enterprise-sec.io</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">David Miller</span>
                  <span className="text-[10px] text-slate-400 font-mono">Technical Reviewer</span>
                </div>
                <div className="text-[11px] text-slate-400">d.miller@enterprise-sec.io</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">Alex Chen</span>
                  <span className="text-[10px] text-slate-400 font-mono">Hiring Manager</span>
                </div>
                <div className="text-[11px] text-slate-400">a.chen@enterprise-sec.io</div>
              </div>
            </div>

            <button
              onClick={() => {
                setSaveStatus('Invitation link generated and ready for reviewer dispatch.');
                setTimeout(() => setSaveStatus(null), 3500);
              }}
              className="w-full py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
            >
              + Invite Reviewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
