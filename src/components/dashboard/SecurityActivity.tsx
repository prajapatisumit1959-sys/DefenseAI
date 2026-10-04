import React, { useMemo } from 'react';
import {
  CheckCircle2,
  FileCheck,
  Users2,
  Activity,
  ShieldCheck,
  Clock,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { RoutePath } from '../../types';
import { useCompletedSessions } from '../../services/sessionStore';

interface SecurityActivityProps {
  onNavigate: (path: RoutePath) => void;
}

export const SecurityActivity: React.FC<SecurityActivityProps> = ({ onNavigate }) => {
  const { completedSessions, selectSession } = useCompletedSessions();

  const realEvents = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: string;
      type: 'session_complete' | 'analysis_generated' | 'signal_detected' | 'report_generated' | 'manual_review';
      sessionId: string;
    }> = [];

    completedSessions.forEach((s) => {
      const candidateName = s.session.candidateName || 'Candidate';
      const timeStr = s.generatedAt
        ? new Date(s.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      // 1. Session Complete Event
      list.push({
        id: `sess-${s.session.sessionId}`,
        title: `Interview Completed: ${candidateName}`,
        description: `Logged ${s.session.duration} session with camera telemetry and timeline records.`,
        timestamp: timeStr,
        type: 'session_complete',
        sessionId: s.session.sessionId,
      });

      // 2. Risk Assessment Event if available
      if (s.riskAssessment) {
        list.push({
          id: `risk-${s.session.sessionId}`,
          title: `Risk Evaluated: ${s.riskAssessment.level.toUpperCase()} (${s.riskAssessment.score} pts)`,
          description: `${s.riskAssessment.signals.filter((x) => x.active).length} active signals identified by deterministic rule engine.`,
          timestamp: timeStr,
          type: s.riskAssessment.level === 'high' ? 'signal_detected' : 'analysis_generated',
          sessionId: s.session.sessionId,
        });
      }

      // 3. Human Review Event if reviewed
      if (s.review.status !== 'pending') {
        list.push({
          id: `rev-${s.session.sessionId}`,
          title: `Human Review: ${s.review.status === 'reviewed' ? 'Cleared' : 'Flagged for Verification'}`,
          description: s.review.reviewerNotes || 'Evaluator updated human review status.',
          timestamp: timeStr,
          type: 'manual_review',
          sessionId: s.session.sessionId,
        });
      }
    });

    return list.slice(0, 5);
  }, [completedSessions]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'session_complete':
        return <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'analysis_generated':
        return <Activity className="w-3.5 h-3.5 text-blue-400" />;
      case 'signal_detected':
        return <Users2 className="w-3.5 h-3.5 text-rose-400" />;
      case 'manual_review':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getEventBadgeBg = (type: string) => {
    switch (type) {
      case 'session_complete':
        return 'bg-cyan-950/60 border-cyan-800/40';
      case 'analysis_generated':
        return 'bg-blue-950/60 border-blue-800/40';
      case 'signal_detected':
        return 'bg-rose-950/60 border-rose-800/40';
      case 'manual_review':
        return 'bg-purple-950/60 border-purple-800/40';
      default:
        return 'bg-slate-900 border-slate-800';
    }
  };

  const handleEventClick = (sessionId: string) => {
    selectSession(sessionId);
    onNavigate('/report');
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Recent Telemetry Activity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of completed sessions, risk telemetry & evaluator actions
          </p>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
          {realEvents.length} Events
        </span>
      </div>

      {/* Timeline List */}
      {realEvents.length > 0 ? (
        <div className="relative space-y-3.5 pl-2">
          {/* Subtle connecting vertical line */}
          <div className="absolute left-[18px] top-2 bottom-2 w-[1px] bg-slate-800/80 pointer-events-none" />

          {realEvents.map((activity) => (
            <div
              key={activity.id}
              className="relative flex items-start gap-3 group cursor-pointer"
              onClick={() => handleEventClick(activity.sessionId)}
            >
              {/* Icon Bubble */}
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 z-10 ${getEventBadgeBg(
                  activity.type
                )} shadow-xs`}
              >
                {getEventIcon(activity.type)}
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0 bg-slate-950/40 hover:bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/60 transition-colors">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {activity.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 px-4 rounded-lg bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-2">
          <Clock className="w-6 h-6 text-slate-500" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-slate-300">No Recent Activity</h4>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Actions will appear here in chronological order as live interviews and assessments are completed.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 font-mono">
          Persistent audit journal
        </span>
        <button
          onClick={() => onNavigate('/history')}
          className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 text-xs cursor-pointer"
        >
          <span>Evaluation History</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
