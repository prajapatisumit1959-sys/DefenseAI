import React from 'react';
import {
  User,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Hash,
  ChevronDown,
} from 'lucide-react';
import { CandidateProfile } from '../../types/candidate';
import { CANDIDATE_ROSTER } from '../../data/candidateData';

interface CandidateProfileCardProps {
  candidate: CandidateProfile;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const CandidateProfileCard: React.FC<CandidateProfileCardProps> = ({
  candidate,
  onSelectCandidate,
}) => {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 hover:border-slate-700/80 transition-all shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Avatar & Primary Details */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-cyan-950 via-slate-900 to-blue-950 border border-cyan-800/50 flex items-center justify-center text-cyan-300 font-mono font-bold text-lg shadow-md shrink-0">
              {candidate.avatarInitials}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090D16]"
              title="Identity record confirmed"
            />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg font-bold text-white tracking-tight truncate">
                {candidate.name}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 border border-slate-700 text-cyan-400">
                <Hash className="w-3 h-3 text-cyan-500" />
                <span>{candidate.id}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Interview {candidate.interviewStatus}</span>
              </span>
            </div>

            {/* Sub-meta items */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>{candidate.role}</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Experience: <strong className="text-slate-300 font-medium">{candidate.experienceYears}</strong></span>
              </div>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidate.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Candidate Switcher for Recruiter Navigation */}
        <div className="flex items-center gap-2.5 self-end lg:self-center border-t lg:border-t-0 border-slate-800/80 pt-3 lg:pt-0 w-full lg:w-auto justify-between lg:justify-end">
          <label className="text-xs text-slate-400 font-mono whitespace-nowrap">
            Switch Dossier:
          </label>
          <div className="relative">
            <select
              value={candidate.id}
              onChange={(e) => {
                const found = CANDIDATE_ROSTER.find((c) => c.id === e.target.value);
                if (found) onSelectCandidate(found);
              }}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/60 cursor-pointer"
            >
              {CANDIDATE_ROSTER.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) · {c.role}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
