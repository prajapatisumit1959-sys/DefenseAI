import React from 'react';
import { SignalStatusState } from '../../types/interview';

interface SignalCardProps {
  icon: React.ReactNode;
  name: string;
  value: string | number;
  status: SignalStatusState;
  subtext?: string;
  actionButton?: React.ReactNode;
  isMonitored?: boolean;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  icon,
  name,
  value,
  status,
  subtext,
  actionButton,
  isMonitored = true,
}) => {
  // Status indicator styling
  const getStatusBadge = () => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            NORMAL
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            ATTENTION
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-900 text-slate-400 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            UNAVAILABLE
          </span>
        );
    }
  };

  const borderClass =
    status === 'ATTENTION'
      ? 'border-amber-700/60 bg-amber-950/20'
      : status === 'NORMAL'
      ? 'border-slate-800/80 bg-slate-950/60'
      : 'border-slate-800/60 bg-slate-950/40 opacity-80';

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${borderClass} flex flex-col justify-between gap-2.5`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              status === 'ATTENTION'
                ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                : status === 'NORMAL'
                ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            {icon}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">{name}</div>
            {subtext && <div className="text-[10px] text-slate-400">{subtext}</div>}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/60">
        <div
          className={`text-sm font-semibold tracking-tight ${
            status === 'ATTENTION'
              ? 'text-amber-300'
              : status === 'NORMAL'
              ? 'text-white'
              : 'text-slate-400'
          }`}
        >
          {value}
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>
    </div>
  );
};
