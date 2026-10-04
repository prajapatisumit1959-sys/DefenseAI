import React, { useState } from 'react';
import {
  History,
  Search,
  ExternalLink,
  Download,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Radio,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/layout/DisclaimerBanner';
import { RoutePath } from '../types';
import { useCompletedSessions } from '../services/sessionStore';

interface HistoryPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const { completedSessions, selectSession, deleteSession } = useCompletedSessions();

  const filtered = completedSessions.filter((s) => {
    const candidateName = s.candidate?.name || s.session?.candidateName || '';
    const candidateRole = s.candidate?.role || s.session?.role || '';
    const sessionId = s.session?.sessionId || '';
    const reviewerNotes = s.review?.reviewerNotes || '';

    const matchesSearch =
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidateRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewerNotes.toLowerCase().includes(searchTerm.toLowerCase());

    const level = s.riskAssessment?.level || 'unassessed';
    const matchesLevel =
      filterLevel === 'all' ||
      (filterLevel === 'low' && level === 'low') ||
      (filterLevel === 'moderate' && level === 'medium') ||
      (filterLevel === 'elevated' && level === 'high');

    return matchesSearch && matchesLevel;
  });

  const handleViewReport = (sessionId: string) => {
    selectSession(sessionId);
    onNavigate('/report');
  };

  const handleExportCSV = () => {
    if (completedSessions.length === 0) {
      setNotice('No completed sessions available to export.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    const headers = [
      'Session ID',
      'Candidate Name',
      'Role',
      'Status',
      'Duration',
      'Risk Level',
      'Risk Score',
      'AI Confidence',
      'Review Status',
      'Completed At',
    ];

    const rows = completedSessions.map((s) => [
      `"${s.session.sessionId}"`,
      `"${s.session.candidateName}"`,
      `"${s.session.role}"`,
      `"${s.session.status}"`,
      `"${s.session.duration}"`,
      `"${s.riskAssessment?.level || 'N/A'}"`,
      `"${s.riskAssessment?.score ?? 'N/A'}"`,
      `"${s.aiAnalysis?.aiConfidence ?? 'N/A'}"`,
      `"${s.review.status}"`,
      `"${s.generatedAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `defenseai_completed_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotice('Exported completed sessions archive in CSV format.');
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Interview Evaluation History
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
              {completedSessions.length} {completedSessions.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Searchable historical repository of verified completed sessions, telemetry, and human reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completedSessions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('/interview')}
            className="px-3 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Interview</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
          {notice}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate, role, session ID, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Risk Filter:</span>
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterLevel('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterLevel === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterLevel('low')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterLevel === 'low'
                  ? 'bg-slate-800 text-emerald-300 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Low Risk
            </button>
            <button
              onClick={() => setFilterLevel('moderate')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterLevel === 'moderate'
                  ? 'bg-slate-800 text-amber-300 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Moderate
            </button>
            <button
              onClick={() => setFilterLevel('elevated')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterLevel === 'elevated'
                  ? 'bg-slate-800 text-rose-300 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Elevated
            </button>
          </div>
        </div>
      </div>

      {/* History Archive Table */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111E] text-slate-400 border-b border-slate-800/80 font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Candidate & Role</th>
                  <th className="py-3 px-4">Duration & Time</th>
                  <th className="py-3 px-4">Risk Evaluation</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((s) => {
                  const riskLevel = s.riskAssessment?.level || 'unassessed';
                  const riskScore = s.riskAssessment?.score;
                  const dateStr = s.generatedAt
                    ? new Date(s.generatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr key={s.session.sessionId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold whitespace-nowrap">
                        {s.session.sessionId}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{s.session.candidateName}</div>
                        <div className="text-[11px] text-slate-400">{s.session.role}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        <div className="text-slate-200 font-mono">{s.session.duration}</div>
                        <div className="text-[11px] text-slate-500">{dateStr}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {s.riskAssessment ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold uppercase px-2 py-0.5 rounded border ${
                                riskLevel === 'high'
                                  ? 'text-rose-300 bg-rose-950/40 border-rose-800/50'
                                  : riskLevel === 'medium'
                                  ? 'text-amber-300 bg-amber-950/40 border-amber-800/50'
                                  : 'text-emerald-300 bg-emerald-950/40 border-emerald-800/50'
                              }`}
                            >
                              {riskLevel} Risk ({riskScore})
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {s.riskAssessment.signals.length} {s.riskAssessment.signals.length === 1 ? 'signal' : 'signals'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">
                            Assessment Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium ${
                            s.review.status === 'reviewed'
                              ? 'text-emerald-400'
                              : s.review.status === 'additional_verification_requested'
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.review.status === 'reviewed'
                            ? 'Reviewed'
                            : s.review.status === 'additional_verification_requested'
                            ? 'Flagged for Verification'
                            : 'Pending Review'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => onNavigate('/candidate')}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="View Candidate Dossier"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleViewReport(s.session.sessionId)}
                          className="p-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="View Report for this Session"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] font-medium pr-0.5">Report</span>
                        </button>
                        <button
                          onClick={() => deleteSession(s.session.sessionId)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-500 transition-colors cursor-pointer"
                          title="Delete Session Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">
                  {completedSessions.length === 0
                    ? 'No Completed Interview Sessions'
                    : 'No Sessions Matching Search Filter'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {completedSessions.length === 0
                    ? 'Only completed interview sessions from the Live Interview Monitor are recorded here. Start and complete a session to view historical evaluations.'
                    : 'Try clearing the search query or adjusting the risk filter to see other archived sessions.'}
                </p>
              </div>
              {completedSessions.length === 0 ? (
                <button
                  onClick={() => onNavigate('/interview')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Start Live Interview</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterLevel('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-slate-700"
                >
                  <span>Reset Search & Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
