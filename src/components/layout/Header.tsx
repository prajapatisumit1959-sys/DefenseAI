import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { RoutePath } from '../../types';

interface HeaderProps {
  currentPath: RoutePath;
  onOpenMobileMenu?: () => void;
  onNavigate?: (path: RoutePath) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onOpenMobileMenu,
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getPageMeta = (path: RoutePath) => {
    switch (path) {
      case '/dashboard':
        return {
          title: 'Recruiter Dashboard',
          subtitle: 'Recruiter hub · 5-step evaluation pipeline overview & candidate queue',
        };
      case '/candidate':
        return {
          title: 'Candidate Analysis',
          subtitle: 'Step 1 (Candidate Profile), Step 3 (AI Analysis) & Step 4 (Risk Assessment)',
        };
      case '/interview':
        return {
          title: 'Live Interview Monitoring',
          subtitle: 'Step 2 · Real-time OpenCV telemetry, sensory signals & response duration',
        };
      case '/report':
        return {
          title: 'Explainable Analysis Report',
          subtitle: 'Step 5 · Synthesized evidentiary dossier, reviewer checklist & sign-off',
        };
      case '/history':
        return {
          title: 'Interview History & Archive',
          subtitle: 'Comprehensive audit logs of all past interview evaluations',
        };
      case '/settings':
        return {
          title: 'Application Settings',
          subtitle: 'System sensitivity thresholds, compliance rules & workspace team roles',
        };
      default:
        return {
          title: 'Overview',
          subtitle: 'DefenseAI Decision Support Platform',
        };
    }
  };

  const { title, subtitle } = getPageMeta(currentPath);

  const notifications = [
    {
      id: 'n1',
      title: 'Interview INT-8918 Flagged',
      time: '12 min ago',
      desc: 'Elevated audio cadence shift during Question 4 requires reviewer attention.',
      read: false,
      targetPath: '/candidate' as RoutePath,
    },
    {
      id: 'n2',
      title: 'Review Cleared: Elena Rostova',
      time: '1 hr ago',
      desc: 'David Miller confirmed authentic code derivation on INT-8921.',
      read: true,
      targetPath: '/report' as RoutePath,
    },
    {
      id: 'n3',
      title: 'Live Session Started',
      time: '3 hr ago',
      desc: 'Candidate Marcus Vance entered the monitored session room.',
      read: true,
      targetPath: '/interview' as RoutePath,
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B111E]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/60 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="truncate">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
              {title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" />
              Decision Support Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block truncate mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications & Recruiter Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Bar / Affordance */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-md focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
          />
        </div>

        {/* Mobile Search Icon */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/60 transition-colors"
          aria-label="Search"
          onClick={() => {
            if (onNavigate) onNavigate('/candidate');
          }}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/60 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full ring-2 ring-[#0B111E]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#0D1527] border border-slate-800 rounded-lg shadow-xl shadow-black/50 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">System Alerts</span>
                <span className="text-[11px] text-cyan-400 font-mono">1 unread</span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      if (onNavigate) onNavigate(n.targetPath);
                    }}
                    className={`w-full text-left p-3 hover:bg-slate-800/40 transition-colors flex items-start gap-3 ${
                      !n.read ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 text-cyan-400 shrink-0">
                      {n.read ? <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> : <Clock className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-2 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-800/80 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    if (onNavigate) onNavigate('/candidate');
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                >
                  View full review queue <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recruiter Profile / Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-xs font-semibold text-white shadow-xs">
              SJ
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-medium text-slate-200 block leading-tight">
                Sarah Jenkins
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                Senior Recruiter
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0D1527] border border-slate-800 rounded-lg shadow-xl shadow-black/50 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800/80">
                <p className="text-xs font-semibold text-white">Sarah Jenkins</p>
                <p className="text-[11px] text-slate-400 truncate">s.jenkins@enterprise-sec.io</p>
                <span className="mt-1 inline-block text-[10px] text-cyan-400 font-mono">
                  Role: Lead Reviewer
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigate) onNavigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 text-left transition-colors"
                >
                  Evaluation Preferences
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigate) onNavigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 text-left transition-colors"
                >
                  Ethical Review Guidelines
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onNavigate) onNavigate('/');
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 text-left transition-colors"
                >
                  Return to Landing Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
