import React from 'react';
import {
  FileText,
  MessageSquare,
  Activity,
  Camera,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { AnalysisInputStatus } from '../../types/candidate';

interface AnalysisInputSummaryProps {
  status: AnalysisInputStatus & {
    aiModelName?: string;
  };
}

export const AnalysisInputSummary: React.FC<AnalysisInputSummaryProps> = ({ status }) => {
  const inputs = [
    {
      label: 'Resume Document',
      connected: status.resumeAvailable,
      value: status.resumeAvailable ? '✓ Available' : 'Not Uploaded',
      details: status.resumeDetails,
      icon: FileText,
    },
    {
      label: 'Interview Responses',
      connected: status.responsesCount > 0,
      value: `✓ ${status.responsesCount} Response${status.responsesCount === 1 ? '' : 's'}`,
      details: 'Transcripts & response time metadata ready',
      icon: MessageSquare,
    },
    {
      label: 'AI Evaluation Engine',
      connected: status.aiEngineConnected,
      value: status.aiEngineConnected ? '✓ Operational' : 'Offline / Standby',
      details: status.aiEngineConnected
        ? `${status.aiModelName || 'gemini-3.8-flash'} secure proxy active`
        : 'Server-side Gemini proxy pending connection',
      icon: Cpu,
    },
    {
      label: 'Behavioral Signals',
      connected: false,
      value: 'Not Connected',
      details: 'Audio-visual synchronicity feed pending',
      icon: Activity,
    },
    {
      label: 'Camera Analysis',
      connected: false,
      value: 'Not Connected',
      details: 'WebRTC gaze stream offline in this stage',
      icon: Camera,
    },
  ];

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4 hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Analysis Inputs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Availability matrix of staged candidate data and sensory telemetry
          </p>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
          Input Matrix
        </span>
      </div>

      <div className="space-y-2.5">
        {inputs.map((inp) => {
          const Icon = inp.icon;
          return (
            <div
              key={inp.label}
              className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors ${
                inp.connected
                  ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-md border shrink-0 ${
                    inp.connected
                      ? 'bg-cyan-950/60 border-cyan-800/50 text-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-medium block truncate text-xs ${
                      inp.connected ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {inp.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block truncate">
                    {inp.details}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {inp.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{inp.value}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800">
                    <span>{inp.value}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
