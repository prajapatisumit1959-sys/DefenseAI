import React from 'react';
import {
  Radio,
  UserCheck,
  FileText,
  History,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { RoutePath } from '../../types';

interface QuickActionsProps {
  onNavigate: (path: RoutePath) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      title: 'Analyze Candidate',
      subtitle: 'Review credentials & baseline',
      icon: UserCheck,
      path: '/candidate' as RoutePath,
      badge: 'Step 1',
      primary: false,
    },
    {
      title: 'Start Live Interview',
      subtitle: 'OpenCV webcam telemetry',
      icon: Radio,
      path: '/interview' as RoutePath,
      badge: 'Step 2',
      primary: true,
    },
    {
      title: 'View Final Reports',
      subtitle: 'Audit dossiers & export dossier',
      icon: FileText,
      path: '/report' as RoutePath,
      badge: 'Step 5',
      primary: false,
    },
    {
      title: 'Interview History',
      subtitle: 'Browse all archived sessions',
      icon: History,
      path: '/history' as RoutePath,
      badge: 'Archive',
      primary: false,
    },
  ];

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Quick Actions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Rapid launch shortcuts for recruiter evaluation workflows
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Shortcuts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={() => onNavigate(act.path)}
              className={`p-3.5 rounded-lg border text-left transition-all group flex items-start justify-between gap-3 ${
                act.primary
                  ? 'bg-linear-to-br from-cyan-950/40 to-slate-900/90 border-cyan-800/60 hover:border-cyan-500/80 hover:shadow-md hover:shadow-cyan-950/40'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 transition-colors ${
                    act.primary
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 group-hover:text-cyan-400 group-hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate block">
                      {act.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                    {act.subtitle}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                {act.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-medium ${
                      act.primary
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {act.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
