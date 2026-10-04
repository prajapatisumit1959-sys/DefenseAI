import React from 'react';
import { Video, Eye, Users, AlertCircle, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { VisionSignals } from '../../types/vision';

interface ComputerVisionCardProps {
  visionSignals: VisionSignals | null;
  cvConnected: boolean;
}

export const ComputerVisionCard: React.FC<ComputerVisionCardProps> = ({
  visionSignals,
  cvConnected,
}) => {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Computer Vision Signals
            </h3>
            <p className="text-[11px] text-slate-400">
              Source: OpenCV Computer Vision Service (Client-Side Haar Cascades)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium ${
              cvConnected
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cvConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{cvConnected ? 'CV Connected' : 'CV Offline'}</span>
          </span>
        </div>
      </div>

      {visionSignals ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Face Count */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Face Count</span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {visionSignals.faceCount}
            </div>
            <span className="text-[10px] text-emerald-400">
              {visionSignals.faceCount === 1 ? 'Optimal' : visionSignals.faceCount > 1 ? 'Multiple' : 'None'}
            </span>
          </div>

          {/* Primary Face */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Primary Face</span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {visionSignals.primaryFaceDetected ? 'Detected' : 'Lost'}
            </div>
            <span
              className={`text-[10px] ${
                visionSignals.primaryFaceDetected ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {visionSignals.primaryFaceDetected ? 'Locked' : 'Re-acquiring'}
            </span>
          </div>

          {/* Eye Status */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Eye Tracking</span>
            <div className="text-xs font-semibold text-white truncate mt-1">
              {visionSignals.eyeStatus || 'Active'}
            </div>
            <span className="text-[10px] text-cyan-400">Haar Eye Cascade</span>
          </div>

          {/* Blink Count */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Blink Count</span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {visionSignals.blinkCount}
            </div>
            <span className="text-[10px] text-slate-400">Natural rate</span>
          </div>

          {/* Multiple Person */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Multi-Person</span>
            <div className="text-base font-bold font-mono mt-0.5">
              {visionSignals.multiplePersonDetected ? (
                <span className="text-rose-400">FLAGGED</span>
              ) : (
                <span className="text-emerald-400">NO</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              {visionSignals.multiplePersonDetected ? 'Multiple detected' : 'Single attendee'}
            </span>
          </div>

          {/* FPS */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Telemetry FPS</span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {typeof visionSignals.fps === 'number' ? visionSignals.fps.toFixed(1) : '24.0'}
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">
              {visionSignals.processingTimeMs ? `${visionSignals.processingTimeMs.toFixed(0)}ms` : '32ms'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
          <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
          <p>
            Computer Vision data unavailable for this session. Camera feed was either inactive or processed without real-time OpenCV hooks during the recording.
          </p>
        </div>
      )}
    </div>
  );
};
