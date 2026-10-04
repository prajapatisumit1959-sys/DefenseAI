import React from 'react';
import { Activity, User, Eye, Sparkles, Clock, Mic, Smile } from 'lucide-react';
import { VisionSignals } from '../../types/vision';
import { QuestionTimingRecord } from '../../types/interview';

interface SessionSignalSummaryProps {
  visionSignals: VisionSignals | null;
  cameraActive: boolean;
  cvConnected: boolean;
  questionRecord: QuestionTimingRecord;
  hasAiAnalysis: boolean;
}

export const SessionSignalSummary: React.FC<SessionSignalSummaryProps> = ({
  visionSignals,
  cameraActive,
  cvConnected,
  questionRecord,
  hasAiAnalysis,
}) => {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/50 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Signal Summary</h3>
            <p className="text-[11px] text-slate-400">Consolidated overview of active vs unavailable signals</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Session Digest
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Face Detection */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Face Detection</div>
              <div className="text-[10px] text-slate-400">Primary Candidate</div>
            </div>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
              cameraActive && visionSignals
                ? visionSignals.faceCount === 1
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  : visionSignals.faceCount > 1
                  ? 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                  : 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {cameraActive && visionSignals
              ? visionSignals.primaryFaceDetected
                ? 'Detected'
                : 'Not Detected'
              : 'Standby'}
          </span>
        </div>

        {/* Eye Detection */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Eye Detection</div>
              <div className="text-[10px] text-slate-400">Haar Cascade Eyes</div>
            </div>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
              cameraActive && visionSignals && cvConnected
                ? visionSignals.eyeStatus === 'Both Eyes Detected'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  : visionSignals.eyeStatus === 'One Eye Detected'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {cameraActive && visionSignals && cvConnected
              ? visionSignals.eyeStatus
              : 'Not Available'}
          </span>
        </div>

        {/* Blink Detection */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Blink Detection</div>
              <div className="text-[10px] text-slate-400">Consecutive Frame Logic</div>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            {cameraActive && visionSignals
              ? `${visionSignals.blinkCount} Blinks`
              : '0 Blinks'}
          </span>
        </div>

        {/* Response Timing */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Response Timing</div>
              <div className="text-[10px] text-slate-400">Current Question</div>
            </div>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
              questionRecord.status === 'Response Completed'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : questionRecord.status === 'Recording Response'
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {questionRecord.status === 'Response Completed'
              ? `${questionRecord.responseDurationSeconds}s (Measured)`
              : questionRecord.status === 'Recording Response'
              ? 'Recording...'
              : 'Waiting for response'}
          </span>
        </div>

        {/* AI Answer Analysis */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">AI Answer Analysis</div>
              <div className="text-[10px] text-slate-400">Gemini LLM Engine</div>
            </div>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
              hasAiAnalysis
                ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {hasAiAnalysis ? 'Analyzed' : 'Waiting for response'}
          </span>
        </div>

        {/* Unimplemented / Unavailable Signals (Strict honesty) */}
        <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between opacity-75">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-400">Mouth / Lip Sync</div>
              <div className="text-[10px] text-slate-500">Unimplemented sensor</div>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            Unavailable
          </span>
        </div>
      </div>
    </div>
  );
};
