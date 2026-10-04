import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, ShieldCheck, HelpCircle } from 'lucide-react';
import { useCompletedSessions } from '../../services/sessionStore';

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomPieTooltip: React.FC<CustomPieTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0B1220] border border-slate-800 rounded-lg p-3 shadow-xl text-xs space-y-1 min-w-44">
        <div className="flex items-center gap-1.5 font-semibold text-white">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </div>
        <div className="font-mono text-cyan-300 text-sm font-bold">
          {data.count} {data.count === 1 ? 'instance' : 'instances'} ({data.percentage}%)
        </div>
        <div className="text-[11px] text-slate-400 leading-snug">
          {data.description}
        </div>
      </div>
    );
  }
  return null;
};

export const SignalDistributionChart: React.FC = () => {
  const { completedSessions } = useCompletedSessions();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Compute active signal frequencies across real completed sessions
  const { signalData, totalSignalCount } = useMemo(() => {
    const counts: Record<string, number> = {};

    completedSessions.forEach((s) => {
      if (s.riskAssessment?.signals) {
        s.riskAssessment.signals.forEach((sig) => {
          if (sig.active && sig.scoreContribution > 0) {
            counts[sig.name] = (counts[sig.name] || 0) + 1;
          }
        });
      }
    });

    const signalMeta: Record<string, { color: string; desc: string }> = {
      'Eye Tracking Inconsistency': { color: '#06b6d4', desc: 'Frequent off-screen gaze or deviation' },
      'Audio & Verbal Latency': { color: '#3b82f6', desc: 'Unusual delay before complex technical responses' },
      'Response Structure Pattern': { color: '#8b5cf6', desc: 'Syntax or phrasing patterns resembling assistive generation' },
      'Visual Continuity Anomaly': { color: '#f59e0b', desc: 'Multiple persons or feed interruptions' },
      'Resume vs Interview Divergence': { color: '#ec4899', desc: 'Discrepancy between stated credentials and answers' },
      'Multiple Persons Detected': { color: '#f43f5e', desc: 'Secondary attendee identified in camera frame' },
    };

    const total = Object.values(counts).reduce((acc, c) => acc + c, 0);

    const items = Object.entries(counts).map(([name, count]) => {
      const meta = signalMeta[name] || { color: '#10b981', desc: 'Recorded verification signal' };
      return {
        name,
        count,
        value: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: meta.color,
        description: meta.desc,
      };
    });

    return { signalData: items, totalSignalCount: total };
  }, [completedSessions]);

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Signal Vector Distribution
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
            {totalSignalCount} Active
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Distribution of multi-vector signals recorded across completed candidate sessions.
        </p>
      </div>

      {/* Donut Chart Visual & Legend or Clean Empty State */}
      {signalData.length > 0 ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
          {/* Donut Canvas */}
          <div className="relative w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={signalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {signalData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#0f172a"
                      strokeWidth={2}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        filter:
                          activeIndex === index
                            ? 'drop-shadow(0 0 6px rgba(6,182,212,0.6))'
                            : 'none',
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.6,
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold font-mono text-white leading-none">
                {totalSignalCount}
              </span>
              <span className="text-[9px] font-mono uppercase text-slate-400 mt-0.5">
                Signals
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex-1 space-y-1.5 w-full text-xs">
            {signalData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-300 truncate text-[11px]">{item.name}</span>
                </div>
                <span className="font-mono text-cyan-300 font-semibold text-[11px] shrink-0">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 px-4 rounded-lg bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-slate-300">No Risk Signals Flagged</h4>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Completed sessions have no active anomaly signals, or no sessions have been conducted yet.
            </p>
          </div>
        </div>
      )}

      {/* Decision-Support Note */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between font-mono">
        <span>Signals are advisory only</span>
        <span>Human review required</span>
      </div>
    </div>
  );
};
