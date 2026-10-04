import React from 'react';
import {
  Video,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { DashboardSummaryMetric } from '../../types/dashboard';

interface StatCardProps {
  metric: DashboardSummaryMetric;
}

export const StatCard: React.FC<StatCardProps> = ({ metric }) => {
  const renderIcon = () => {
    switch (metric.iconType) {
      case 'video':
        return <Video className="w-5 h-5 text-cyan-400" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'shield-warning':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      default:
        return <Video className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getDeltaStyles = () => {
    switch (metric.deltaType) {
      case 'positive':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/40 border-emerald-800/40',
          Icon: TrendingUp,
        };
      case 'warning':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-950/40 border-amber-800/40',
          Icon: TrendingUp,
        };
      case 'alert':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-950/40 border-rose-800/40',
          Icon: TrendingDown,
        };
      default:
        return {
          text: 'text-cyan-400',
          bg: 'bg-cyan-950/40 border-cyan-800/40',
          Icon: TrendingUp,
        };
    }
  };

  const deltaStyle = getDeltaStyles();
  const TrendIcon = deltaStyle.Icon;

  return (
    <div className="relative group rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden">
      {/* Subtle accent bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/50 transition-all duration-300" />

      {/* Header row with title and icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase font-mono">
          {metric.title}
        </span>
        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/90 group-hover:border-slate-700 transition-colors">
          {renderIcon()}
        </div>
      </div>

      {/* Value & Delta */}
      <div className="my-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-mono tabular-nums">
            {metric.value}
          </span>
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${deltaStyle.bg} ${deltaStyle.text}`}
          >
            <TrendIcon className="w-3 h-3" />
            <span>{metric.change}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">vs. previous 30-day window</div>
      </div>

      {/* Footer caption */}
      <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 line-clamp-1 group-hover:text-slate-300 transition-colors flex items-center justify-between">
        <span>{metric.caption}</span>
      </div>
    </div>
  );
};
