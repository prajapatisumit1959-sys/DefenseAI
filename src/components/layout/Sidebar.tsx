import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Radio,
  FileText,
  History,
  Settings,
  Shield,
  HelpCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { RoutePath } from '../../types';

interface SidebarProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard' as RoutePath,
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      label: 'Candidate Analysis',
      path: '/candidate' as RoutePath,
      icon: UserCheck,
      badge: '3 queued',
    },
    {
      label: 'Live Interview',
      path: '/interview' as RoutePath,
      icon: Radio,
      badge: 'Live',
      live: true,
    },
    {
      label: 'Reports',
      path: '/report' as RoutePath,
      icon: FileText,
      badge: undefined,
    },
    {
      label: 'History',
      path: '/history' as RoutePath,
      icon: History,
      badge: undefined,
    },
    {
      label: 'Settings',
      path: '/settings' as RoutePath,
      icon: Settings,
      badge: undefined,
    },
  ];

  const handleItemClick = (path: RoutePath) => {
    onNavigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B111E] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => handleItemClick('/')}
              className="flex items-center gap-3 text-left group transition-opacity hover:opacity-90"
            >
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xs shadow-cyan-950/50">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base font-semibold tracking-tight text-white block">
                  Defense<span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-mono">
                  Interview Integrity
                </span>
              </div>
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/60"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500 font-mono">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                        item.live
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50 animate-pulse'
                          : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 5-Step Workflow Mini Map */}
          <div className="mx-3 mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                5-Step Workflow
              </span>
              <span className="text-slate-500">Pipeline</span>
            </div>
            <div className="space-y-1 text-[11px] font-sans text-slate-400">
              <button
                onClick={() => handleItemClick('/candidate')}
                className="w-full flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-slate-800/60 hover:text-slate-200 text-left transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">1</span>
                  <span className="truncate">Candidate</span>
                </span>
                <span className="text-[9px] font-mono text-slate-500">Profile</span>
              </button>
              <button
                onClick={() => handleItemClick('/interview')}
                className="w-full flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-slate-800/60 hover:text-slate-200 text-left transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">2</span>
                  <span className="truncate">Interview</span>
                </span>
                <span className="text-[9px] font-mono text-rose-400">Live</span>
              </button>
              <button
                onClick={() => handleItemClick('/candidate')}
                className="w-full flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-slate-800/60 hover:text-slate-200 text-left transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">3</span>
                  <span className="truncate">AI Analysis</span>
                </span>
                <span className="text-[9px] font-mono text-slate-500">Gemini</span>
              </button>
              <button
                onClick={() => handleItemClick('/candidate')}
                className="w-full flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-slate-800/60 hover:text-slate-200 text-left transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">4</span>
                  <span className="truncate">Risk Assessment</span>
                </span>
                <span className="text-[9px] font-mono text-amber-400">Score</span>
              </button>
              <button
                onClick={() => handleItemClick('/report')}
                className="w-full flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-slate-800/60 hover:text-slate-200 text-left transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">5</span>
                  <span className="truncate">Final Report</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400">Audit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Area with Mandated Notice */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wide">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>AI Decision Support</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
              Signals assist recruiter inquiry. <span className="text-slate-200 font-medium">Human review required</span> for all decisions.
            </p>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-mono">
            <span>Platform v1.0.0</span>
            <span className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors">
              <HelpCircle className="w-3 h-3" />
              Ethics Protocol
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
