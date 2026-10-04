import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Shield, Video, Cpu, Activity } from 'lucide-react';
import { InterviewSessionData } from '../../types/report';

interface SessionSummaryCardProps {
  session: InterviewSessionData;
  cvConnected: boolean;
  hasRiskAssessment: boolean;
}

export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  session,
  cvConnected,
  hasRiskAssessment,
}) => {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
        <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Interview Session Metadata</h3>
          <p className="text-[11px] text-slate-400">Audit identifiers and system integration health</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Session ID</span>
          <div className="font-mono text-cyan-400 font-semibold mt-0.5 truncate">
            {session.sessionId}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Duration</span>
          <div className="font-mono text-slate-200 font-semibold mt-0.5">
            {session.duration}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Start / End</span>
          <div className="font-mono text-slate-300 text-[11px] mt-0.5 truncate">
            {session.startTime || '10:42:18'} - {session.endTime || '10:56:55'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Questions</span>
          <div className="text-slate-200 font-semibold mt-0.5">
            {session.questionsCompleted} Completed
          </div>
        </div>
      </div>

      {/* Integration Status Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Camera Feed</span>
          </div>
          <span className={`text-[10px] font-mono font-medium ${session.cameraAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
            {session.cameraAvailable ? 'Recorded' : 'Off'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px]">AI Evaluation</span>
          </div>
          <span className={`text-[10px] font-mono font-medium ${session.aiAnalysisCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
            {session.aiAnalysisCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">OpenCV CV</span>
          </div>
          <span className={`text-[10px] font-mono font-medium ${cvConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
            {cvConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Risk Engine</span>
          </div>
          <span className={`text-[10px] font-mono font-medium ${hasRiskAssessment ? 'text-emerald-400' : 'text-amber-400'}`}>
            {hasRiskAssessment ? 'Evaluated' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};
