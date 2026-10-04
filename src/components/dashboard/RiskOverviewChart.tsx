import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Shield, Radio, Activity } from 'lucide-react';
import { useCompletedSessions } from '../../services/sessionStore';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1220] border border-slate-800 rounded-lg p-3 shadow-xl text-xs space-y-2 min-w-44">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-mono">
          <span className="font-semibold text-white">{label}</span>
          <span className="text-cyan-400 text-[11px]">Real Sessions</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-300">{entry.name}:</span>
              </div>
              <span className="font-mono font-semibold text-white">
                {entry.value} {entry.value === 1 ? 'session' : 'sessions'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const RiskOverviewChart: React.FC = () => {
  const { completedSessions } = useCompletedSessions();

  const [activeSeries, setActiveSeries] = useState<{
    lowRisk: boolean;
    reviewRequired: boolean;
    highRisk: boolean;
  }>({
    lowRisk: true,
    reviewRequired: true,
    highRisk: true,
  });

  const toggleSeries = (key: 'lowRisk' | 'reviewRequired' | 'highRisk') => {
    setActiveSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Build 7-day trend from real completed sessions
  const chartData = useMemo(() => {
    const days: { day: string; dateStr: string; lowRisk: number; reviewRequired: number; highRisk: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dateIsoPrefix = d.toISOString().slice(0, 10);

      const matching = completedSessions.filter((s) => {
        const sessionDate = s.generatedAt?.slice(0, 10);
        return sessionDate === dateIsoPrefix;
      });

      const low = matching.filter((s) => s.riskAssessment?.level === 'low').length;
      const medium = matching.filter((s) => s.riskAssessment?.level === 'medium').length;
      const high = matching.filter((s) => s.riskAssessment?.level === 'high').length;

      days.push({
        day: dayLabel,
        dateStr,
        lowRisk: low,
        reviewRequired: medium,
        highRisk: high,
      });
    }

    return days;
  }, [completedSessions]);

  const hasSessions = completedSessions.length > 0;

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Risk Overview
            </h3>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-cyan-400" />
              <span>Real Telemetry</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily distribution of low-risk, review-queued, and elevated risk signals across the past 7 days.
          </p>
        </div>

        {/* Legend / Filter toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleSeries('lowRisk')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSeries.lowRisk
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : 'bg-slate-900 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Low Risk</span>
          </button>

          <button
            onClick={() => toggleSeries('reviewRequired')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSeries.reviewRequired
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                : 'bg-slate-900 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Review Required</span>
          </button>

          <button
            onClick={() => toggleSeries('highRisk')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSeries.highRisk
                ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                : 'bg-slate-900 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>High Risk</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      {hasSessions ? (
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradientReview" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradientHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />

              {activeSeries.lowRisk && (
                <Area
                  type="monotone"
                  dataKey="lowRisk"
                  name="Low Risk"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientLow)"
                />
              )}
              {activeSeries.reviewRequired && (
                <Area
                  type="monotone"
                  dataKey="reviewRequired"
                  name="Review Required"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientReview)"
                />
              )}
              {activeSeries.highRisk && (
                <Area
                  type="monotone"
                  dataKey="highRisk"
                  name="High Risk"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientHigh)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-64 rounded-lg bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <Shield className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">No Session Telemetry to Plot</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Complete candidate interviews to view real-time 7-day risk distribution and volume trends.
            </p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px]">
          {completedSessions.length} total completed {completedSessions.length === 1 ? 'session' : 'sessions'} recorded
        </span>
        <span className="text-[11px] text-slate-500">
          Source: Real-time session store
        </span>
      </div>
    </div>
  );
};
