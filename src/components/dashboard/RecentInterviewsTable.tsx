import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Radio,
  FileCheck,
} from 'lucide-react';
import { RoutePath } from '../../types';
import { useCompletedSessions } from '../../services/sessionStore';

interface RecentInterviewsTableProps {
  onNavigate: (path: RoutePath) => void;
}

export const RecentInterviewsTable: React.FC<RecentInterviewsTableProps> = ({
  onNavigate,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { completedSessions, selectSession } = useCompletedSessions();

  const filteredCandidates = completedSessions.filter((s) => {
    const candidateName = s.session.candidateName || s.candidate.name;
    const role = s.session.role || s.candidate.role;
    const id = s.session.sessionId;
    const riskLevel = s.riskAssessment?.level || 'unassessed';

    const matchesRisk =
      filterRisk === 'All' ||
      (filterRisk === 'Low Risk' && riskLevel === 'low') ||
      (filterRisk === 'Review Required' && riskLevel === 'medium') ||
      (filterRisk === 'High Risk' && riskLevel === 'high');

    const matchesSearch =
      candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRisk && matchesSearch;
  });

  const handleRowClick = (sessionId: string) => {
    selectSession(sessionId);
    onNavigate('/report');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-800/40 bg-emerald-950/30';
    if (score >= 80) return 'text-cyan-400 border-cyan-800/40 bg-cyan-950/30';
    if (score >= 70) return 'text-amber-400 border-amber-800/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-800/40 bg-rose-950/30';
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden flex flex-col justify-between">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Recent Completed Interviews
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
              {completedSessions.length} {completedSessions.length === 1 ? 'Session' : 'Sessions'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified candidate sessions with algorithmic risk telemetry and human validation status.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 w-44 sm:w-52"
            />
          </div>

          {/* Risk Level Filter Pill Group */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
            {['All', 'Low Risk', 'Review Required', 'High Risk'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterRisk === level
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {level === 'Review Required' ? 'Review' : level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B111E] text-slate-400 border-b border-slate-800/80 font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4 sm:px-5">Candidate</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Duration & Date</th>
              <th className="py-3 px-4">AI Confidence</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((s) => {
                const candidateName = s.session.candidateName || s.candidate.name;
                const initials = candidateName
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                const riskLevel = s.riskAssessment?.level;
                const riskScore = s.riskAssessment?.score;
                const confidence = s.aiAnalysis?.aiConfidence;

                return (
                  <tr
                    key={s.session.sessionId}
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => handleRowClick(s.session.sessionId)}
                  >
                    {/* Candidate */}
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-950 to-blue-950 border border-cyan-800/40 flex items-center justify-center text-cyan-300 font-mono font-semibold text-xs shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-white group-hover:text-cyan-300 transition-colors block truncate">
                            {candidateName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block truncate">
                            {s.session.sessionId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {s.session.role}
                    </td>

                    {/* Duration & Date */}
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <div className="font-mono text-slate-200">{s.session.duration}</div>
                      <div className="text-[10px] text-slate-500">
                        {s.generatedAt
                          ? new Date(s.generatedAt).toLocaleDateString()
                          : 'Recent'}
                      </div>
                    </td>

                    {/* AI Confidence */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {typeof confidence === 'number' ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${getConfidenceColor(
                            confidence
                          )}`}
                        >
                          {confidence}%
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Pending</span>
                      )}
                    </td>

                    {/* Risk Level */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {riskLevel ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase border ${
                            riskLevel === 'high'
                              ? 'text-rose-300 bg-rose-950/40 border-rose-800/50'
                              : riskLevel === 'medium'
                              ? 'text-amber-300 bg-amber-950/40 border-amber-800/50'
                              : 'text-emerald-300 bg-emerald-950/40 border-emerald-800/50'
                          }`}
                        >
                          {riskLevel === 'high' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          {riskLevel === 'medium' && <Clock className="w-3 h-3 text-amber-400" />}
                          {riskLevel === 'low' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                          <span>{riskLevel} Risk</span>
                          {riskScore !== undefined && <span className="font-mono ml-0.5">({riskScore})</span>}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Unassessed</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(s.session.sessionId);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-800 text-[11px] text-slate-300 transition-colors"
                      >
                        <FileCheck className="w-3 h-3 text-emerald-400" />
                        <span>Report</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  {completedSessions.length === 0 ? (
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                        <ShieldCheck className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-200">
                          No Completed Interviews Recorded
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Conduct an interview in the Live Interview Monitor to automatically stream OpenCV telemetry and store audit logs.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          onClick={() => onNavigate('/interview')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-cyan-950/40"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Start Live Interview</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-slate-400 space-y-2">
                      <p>No completed sessions match your current filter criteria.</p>
                      <button
                        onClick={() => {
                          setFilterRisk('All');
                          setSearchQuery('');
                        }}
                        className="text-xs text-cyan-400 hover:underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3.5 sm:p-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing {filteredCandidates.length} of {completedSessions.length} completed sessions
        </span>
        <button
          onClick={() => onNavigate('/history')}
          className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>View All History</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
