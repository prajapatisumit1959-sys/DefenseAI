import React from 'react';
import { Info } from 'lucide-react';
import { SYSTEM_DISCLAIMER } from '../../data/mockData';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div
      className={`rounded-lg bg-slate-900/80 border border-cyan-900/30 text-slate-300 flex items-start gap-3 shadow-xs ${
        compact ? 'p-3 text-xs' : 'p-4 text-xs sm:text-sm'
      }`}
    >
      <div className="p-1 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 shrink-0 mt-0.5">
        <Info className="w-3.5 h-3.5" />
      </div>
      <div className="space-y-1">
        <div className="font-medium text-cyan-200 text-xs flex items-center gap-2">
          <span>Decision Support Disclaimer</span>
          <span className="text-slate-500 font-normal">·</span>
          <span className="text-slate-400 font-normal">Recruiter Discretion Required</span>
        </div>
        <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">
          {SYSTEM_DISCLAIMER}
        </p>
      </div>
    </div>
  );
};
