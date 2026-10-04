import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Sliders,
  KeyRound,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

interface AnalysisErrorViewProps {
  errorMessage: string;
  onRetry: () => void;
  onEditInputs: () => void;
}

export const AnalysisErrorView: React.FC<AnalysisErrorViewProps> = ({
  errorMessage,
  onRetry,
  onEditInputs,
}) => {
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  return (
    <div className="rounded-xl bg-slate-900/80 border border-amber-900/40 p-6 sm:p-8 space-y-6 shadow-xl text-left animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              AI Analysis Unavailable
            </h3>
            <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
              {errorMessage}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded shrink-0 self-start">
          Service Offline
        </span>
      </div>

      {/* Explanation & Action Row */}
      <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
        <p className="text-slate-300 leading-relaxed">
          The Gemini analysis engine could not complete the evaluation for this session. In adherence to DefenseAI’s ethical design standards, no synthetic or fabricated scores will be generated.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfigHelp(!showConfigHelp)}
            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Check Configuration</span>
            {showConfigHelp ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onEditInputs}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Edit Staged Inputs
          </button>
        </div>
      </div>

      {/* Expandable Configuration Guidance */}
      {showConfigHelp && (
        <div className="p-4 rounded-xl bg-[#0B111E] border border-cyan-800/50 space-y-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-slate-200 font-semibold font-mono text-xs">
            <span>Gemini API Key Configuration</span>
            <span className="text-[10px] text-cyan-400">Server Environment</span>
          </div>

          <div className="space-y-2 text-slate-400 text-xs leading-relaxed">
            <p>
              1. The server reads <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[11px]">GEMINI_API_KEY</code> from environment variables.
            </p>
            <p>
              2. In Google AI Studio Build, the key is automatically injected from user secrets or workspace configuration.
            </p>
            <p>
              3. For local or self-hosted deployment, place your key in <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code>:
            </p>
            <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[11px] overflow-x-auto">
              GEMINI_API_KEY="your-google-gemini-api-key"
              <br />
              GEMINI_MODEL="gemini-3.8-flash"
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
