import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Info,
  Shield,
  Filter,
  RefreshCw,
  Download,
} from 'lucide-react';
import { DASHBOARD_DISCLAIMER_TEXT } from '../data/dashboardData';
import { WorkflowStepper } from '../components/common/WorkflowStepper';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskOverviewChart } from '../components/dashboard/RiskOverviewChart';
import { RecentInterviewsTable } from '../components/dashboard/RecentInterviewsTable';
import { SignalDistributionChart } from '../components/dashboard/SignalDistributionChart';
import { SecurityActivity } from '../components/dashboard/SecurityActivity';
import { QuickActions } from '../components/dashboard/QuickActions';
import { SystemStatus } from '../components/dashboard/SystemStatus';
import { RoutePath } from '../types';
import { useCompletedSessions } from '../services/sessionStore';
import { DashboardSummaryMetric } from '../types/dashboard';

interface DashboardPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { metrics } = useCompletedSessions();

  const summaryCards: DashboardSummaryMetric[] = [
    {
      id: 'metric-interviews',
      title: 'Interviews Analyzed',
      value: metrics.total,
      change: metrics.total > 0 ? `${metrics.total} recorded` : '0 recorded',
      isPositiveTrend: true,
      deltaType: 'positive',
      iconType: 'video',
      caption: 'Real completed candidate sessions',
    },
    {
      id: 'metric-low-risk',
      title: 'Low Risk',
      value: metrics.lowRisk,
      change: metrics.total > 0 ? `${Math.round((metrics.lowRisk / metrics.total) * 100)}%` : '0%',
      isPositiveTrend: true,
      deltaType: 'positive',
      iconType: 'shield-check',
      caption: 'Natural baseline & consistent response markers',
    },
    {
      id: 'metric-review-req',
      title: 'Review Required',
      value: metrics.reviewRequired,
      change: metrics.total > 0 ? `${Math.round((metrics.reviewRequired / metrics.total) * 100)}%` : '0%',
      isPositiveTrend: false,
      deltaType: 'warning',
      iconType: 'alert-triangle',
      caption: 'Mild inconsistencies queued for human review',
    },
    {
      id: 'metric-high-risk',
      title: 'High Risk Signals',
      value: metrics.highRisk,
      change: metrics.total > 0 ? `${Math.round((metrics.highRisk / metrics.total) * 100)}%` : '0%',
      isPositiveTrend: metrics.highRisk === 0,
      deltaType: metrics.highRisk > 0 ? 'alert' : 'neutral',
      iconType: 'shield-warning',
      caption: 'Multi-vector anomaly clusters requiring audit',
    },
  ];

  const dateOptions = [
    'Last 7 Days',
    'Last 30 Days',
    'Last 90 Days',
    'Quarter to Date',
    'Year to Date',
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Required Platform Disclaimer Banner */}
      <div className="rounded-lg bg-slate-900/80 border border-cyan-900/30 p-3.5 sm:p-4 text-xs text-slate-300 flex items-start gap-3 shadow-xs">
        <div className="p-1 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5">
          <div className="font-semibold text-cyan-200 text-xs flex items-center gap-2">
            <span>Decision Support Mandate</span>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-slate-400 font-normal">Human-in-the-Loop Architecture</span>
          </div>
          <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">
            {DASHBOARD_DISCLAIMER_TEXT}
          </p>
        </div>
      </div>

      {/* Recruiter Onboarding & 5-Step Evaluation Workflow */}
      <WorkflowStepper onNavigate={onNavigate} />

      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Security Overview
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
              Recruiter Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor interview sessions, candidate signals, and AI-assisted risk analysis.
          </p>
        </div>

        {/* Right Controls: Date Range Selector & Quick Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            title="Refresh telemetry overview"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Date range picker selector */}
          <div className="relative">
            <button
              onClick={() => setShowRangeDropdown(!showRangeDropdown)}
              className="px-3.5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800/80 text-slate-200 border border-slate-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRangeDropdown && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[#0B1220] border border-slate-800 rounded-lg shadow-xl shadow-black/60 py-1.5 z-40">
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt);
                      setShowRangeDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-mono transition-colors ${
                      dateRange === opt
                        ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. Summary Cards (4 stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* 6. Quick Actions Section */}
      <QuickActions onNavigate={onNavigate} />

      {/* Primary Analytics Grid: 8 Cols (Charts & Tables) + 4 Cols (Signal Breakdown & Feeds) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Risk Overview + Recent Interviews */}
        <div className="lg:col-span-8 space-y-6">
          {/* 2. Risk Overview Chart */}
          <RiskOverviewChart />

          {/* 3. Recent Interviews Table */}
          <RecentInterviewsTable onNavigate={onNavigate} />
        </div>

        {/* Right Column (4 cols): Signal Distribution, System Status & Security Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* 4. Interview Signal Distribution */}
          <SignalDistributionChart />

          {/* 7. System Status */}
          <SystemStatus />

          {/* 5. Recent Security Activity Timeline */}
          <SecurityActivity onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};
