import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { CandidateProfile } from '../../types/candidate';
import { AIAnalysisResult } from '../../types/aiAnalysis';

interface ResumeConsistencyCardProps {
  candidate: CandidateProfile;
  aiAnalysis: AIAnalysisResult | null;
}

export const ResumeConsistencyCard: React.FC<ResumeConsistencyCardProps> = ({
  candidate,
  aiAnalysis,
}) => {
  const score = aiAnalysis?.resumeConsistencyScore;
  const skills = candidate.resume.skills || [];
  const projects = candidate.resume.projects || [];
  const experienceYears = candidate.experienceYears;

  const isConsistent = typeof score === 'number' && score >= 70;
  const hasScore = typeof score === 'number';

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Resume Consistency Verification
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluation of stated credentials versus technical interview depth
            </p>
          </div>
        </div>

        <div>
          {hasScore ? (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
                isConsistent
                  ? 'text-emerald-300 bg-emerald-950/50 border-emerald-800/60'
                  : 'text-amber-300 bg-amber-950/50 border-amber-800/60'
              }`}
            >
              {isConsistent ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isConsistent ? 'Consistent with Experience' : 'Potential Inconsistency'}</span>
              <span className="ml-1 font-mono text-[11px]">({score}/100)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium text-slate-400 bg-slate-800 border border-slate-700">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Insufficient Data</span>
            </span>
          )}
        </div>
      </div>

      {/* Rationale explanation */}
      {aiAnalysis && (
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Evaluation Synthesis: </span>
          {aiAnalysis.overallAssessment ||
            'Candidate responses demonstrate depth consistent with reported background.'}
        </div>
      )}

      {/* Considered elements grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Skills */}
        <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Stated Skills</span>
            <span className="text-[10px] font-mono text-cyan-400">
              {skills.length} listed
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {skills.length > 0 ? (
              skills.map((s, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">None specified</span>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Experience Level</span>
            <span className="text-[10px] font-mono text-cyan-400">
              {experienceYears} yrs
            </span>
          </div>
          <div className="text-xs text-slate-300">
            <p className="font-medium text-white">{candidate.role}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Education: {candidate.resume.education || 'Not provided'}
            </p>
          </div>
        </div>

        {/* Projects */}
        <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Projects Considered</span>
            <span className="text-[10px] font-mono text-cyan-400">
              {projects.length} verified
            </span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {projects.length > 0 ? (
              projects.map((p, idx) => (
                <div key={idx} className="text-[11px] text-slate-300 truncate">
                  • <span className="text-slate-200">{p}</span>
                </div>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">None recorded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
