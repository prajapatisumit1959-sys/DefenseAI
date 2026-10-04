import React from 'react';
import { Clock } from 'lucide-react';
import { SessionTimelineEvent } from '../../types/interview';

interface SessionTimelineCardProps {
  timeline: SessionTimelineEvent[];
}

export const SessionTimelineCard: React.FC<SessionTimelineCardProps> = ({ timeline }) => {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Session Timeline Events</h3>
            <p className="text-[11px] text-slate-400">Chronological telemetry log captured during the interview</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {timeline.length} {timeline.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>

      {timeline.length > 0 ? (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {timeline.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs"
            >
              <div className="font-mono text-cyan-400 text-[11px] shrink-0 pt-0.5">
                {evt.timestamp}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200">{evt.title}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{evt.description}</div>
              </div>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border shrink-0 ${
                  evt.status === 'attention'
                    ? 'text-rose-300 bg-rose-950/40 border-rose-800/50'
                    : 'text-emerald-300 bg-emerald-950/40 border-emerald-800/50'
                }`}
              >
                {evt.type}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
          No timeline events recorded for this session.
        </div>
      )}
    </div>
  );
};
