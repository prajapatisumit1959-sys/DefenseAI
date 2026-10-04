import React, { useState, useEffect } from 'react';
import { HelpCircle, Play, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { QuestionTimingRecord } from '../../types/interview';

interface InterviewQuestionCardProps {
  timingRecord: QuestionTimingRecord;
  onStartResponse: () => void;
  onCompleteResponse: () => void;
  onResetResponse?: () => void;
}

export const InterviewQuestionCard: React.FC<InterviewQuestionCardProps> = ({
  timingRecord,
  onStartResponse,
  onCompleteResponse,
  onResetResponse,
}) => {
  const [seconds, setSeconds] = useState<number>(timingRecord.responseDurationSeconds);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timingRecord.status === 'Recording Response') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timingRecord.status]);

  // Sync if timing record changes externally
  useEffect(() => {
    if (timingRecord.status !== 'Recording Response') {
      setSeconds(timingRecord.responseDurationSeconds);
    }
  }, [timingRecord.responseDurationSeconds, timingRecord.status]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-950/50 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Current Interview Question</h3>
            <p className="text-[11px] text-slate-400">Question pacing & response duration tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-mono px-2.5 py-0.5 rounded border ${
              timingRecord.status === 'Recording Response'
                ? 'bg-amber-950/70 text-amber-300 border-amber-700/60 animate-pulse'
                : timingRecord.status === 'Response Completed'
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {timingRecord.status}
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
        <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block mb-1">
          Technical Question
        </span>
        <p className="text-sm font-medium text-slate-100 leading-snug">
          "{timingRecord.questionText}"
        </p>
      </div>

      {/* Pacing & Timer row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 flex items-center justify-between">
          <span className="text-xs text-slate-400">Response Status:</span>
          <span className="text-xs font-semibold text-slate-200">{timingRecord.status}</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 flex items-center justify-between">
          <span className="text-xs text-slate-400">Response Timer:</span>
          <div className="flex items-center gap-1.5 font-mono text-cyan-300 font-bold text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatSeconds(seconds)}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 flex items-center justify-between">
          <span className="text-xs text-slate-400">Recorded Duration:</span>
          <span className="text-xs font-mono text-slate-300 font-semibold">
            {timingRecord.responseDurationSeconds > 0
              ? `${timingRecord.responseDurationSeconds} seconds`
              : 'Waiting for completion'}
          </span>
        </div>
      </div>

      {/* Timing Details when complete */}
      {timingRecord.startTime && (
        <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-4 px-1">
          <span>Started: {timingRecord.startTime}</span>
          {timingRecord.endTime && <span>Finished: {timingRecord.endTime}</span>}
          <span>Duration: {timingRecord.responseDurationSeconds}s</span>
          <span className="text-slate-500">(Stored for AI analysis)</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center gap-3 pt-1">
        {timingRecord.status !== 'Recording Response' ? (
          <button
            onClick={onStartResponse}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Response</span>
          </button>
        ) : (
          <button
            onClick={onCompleteResponse}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Response Complete</span>
          </button>
        )}

        {timingRecord.status === 'Response Completed' && onResetResponse && (
          <button
            onClick={onResetResponse}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Response</span>
          </button>
        )}
      </div>
    </div>
  );
};
