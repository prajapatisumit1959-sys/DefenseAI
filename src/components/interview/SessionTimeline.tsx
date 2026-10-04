import React from 'react';
import { History, CheckCircle, AlertTriangle, Video, User, Pause, Play, HelpCircle, ShieldCheck } from 'lucide-react';
import { SessionTimelineEvent } from '../../types/interview';

interface SessionTimelineProps {
  events: SessionTimelineEvent[];
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({ events }) => {
  const getEventIcon = (type: SessionTimelineEvent['type'], status: SessionTimelineEvent['status']) => {
    if (status === 'attention') {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    }
    switch (type) {
      case 'session':
        return <History className="w-3.5 h-3.5 text-cyan-400" />;
      case 'camera':
        return <Video className="w-3.5 h-3.5 text-emerald-400" />;
      case 'face':
        return <User className="w-3.5 h-3.5 text-cyan-300" />;
      case 'multi_person':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'pause':
        return <Pause className="w-3.5 h-3.5 text-amber-300" />;
      case 'resume':
        return <Play className="w-3.5 h-3.5 text-emerald-400" />;
      case 'question':
        return <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />;
      case 'verification':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <CheckCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div id="session-timeline" className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Session Timeline</h3>
            <p className="text-[11px] text-slate-400">Deterministic log of verified session events & stream signals</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {events.length} Event{events.length === 1 ? '' : 's'} Logged
        </span>
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs font-mono">
          No session events recorded yet. Start monitoring to log stream events.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {events.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  evt.status === 'attention'
                    ? 'bg-amber-950 border-amber-600/80 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {getEventIcon(evt.type, evt.status)}
              </div>

              {/* Event Content */}
              <div
                className={`p-3 rounded-lg border text-xs transition-colors ${
                  evt.status === 'attention'
                    ? 'bg-amber-950/20 border-amber-800/50 text-slate-200'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-white">{evt.title}</span>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">{evt.timestamp}</span>
                </div>
                {evt.description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">{evt.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
