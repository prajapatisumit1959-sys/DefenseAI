import React from 'react';
import {
  FileText,
  Download,
  Printer,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Hash,
  Activity,
} from 'lucide-react';
import { RoutePath } from '../../types';
import { InterviewReportData } from '../../types/report';

interface ReportHeaderProps {
  reportData: InterviewReportData;
  onNavigate: (path: RoutePath) => void;
  onPrint: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  reportData,
  onNavigate,
  onPrint,
  onDownload,
  isDownloading = false,
}) => {
  const { candidate, session, generatedAt } = reportData;

  const formattedDate = new Date(generatedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold uppercase">
              Step 5 of 5
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Interview Security Analysis
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-mono">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Decision Support Report
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Evidentiary dossier synthesizing candidate background (Step 1), live session telemetry (Step 2), Gemini AI consistency (Step 3), and multi-factor risk assessment (Step 4).
          </p>
        </div>

        {/* Action Buttons (Hidden during print) */}
        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          <button
            onClick={() => onNavigate('/interview')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Interview</span>
          </button>

          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            title="Download client-side audit file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isDownloading ? 'Exporting...' : 'Download Report'}</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-950/40"
            title="Print or save as PDF via browser"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Meta details bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Candidate</div>
          <div className="font-semibold text-white mt-0.5">{candidate.name}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Role</div>
          <div className="font-medium text-slate-200 mt-0.5">{candidate.role}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Session ID</div>
          <div className="font-mono font-semibold text-cyan-300 mt-0.5">{session.sessionId}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Interview Status</div>
          <div className="mt-0.5">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold font-mono border ${
                session.status === 'Completed'
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                  : session.status === 'Active'
                  ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {session.status}
            </span>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Analysis Date</div>
          <div className="text-slate-300 font-mono text-[11px] mt-0.5">{formattedDate}</div>
        </div>
      </div>
    </div>
  );
};
