import React from 'react';
import { AlertTriangle, Square, X } from 'lucide-react';

interface EndSessionModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  sessionDuration: string;
}

export const EndSessionModal: React.FC<EndSessionModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  sessionDuration,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">End Interview Session?</h3>
            <p className="text-xs text-slate-400">Active video capture and telemetry will stop.</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          Total session duration recorded is <strong className="text-cyan-300 font-mono">{sessionDuration}</strong>. Ending the session will freeze telemetry counters, stop webcam streaming, and finalize the timeline.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors border border-slate-700"
          >
            Cancel & Keep Monitoring
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-950/40"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>End Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
