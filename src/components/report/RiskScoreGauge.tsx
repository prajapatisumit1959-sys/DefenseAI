import React from 'react';
import { Gauge, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RiskAssessment } from '../../types/riskEngine';

interface RiskScoreGaugeProps {
  assessment: RiskAssessment | null;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ assessment }) => {
  if (!assessment) {
    return (
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Risk Score Visualization</h3>
        <p className="text-xs text-slate-400">Risk visualization is pending interview analysis.</p>
      </div>
    );
  }

  const { score, level } = assessment;

  // Normalized width percentage (0 to 100)
  const pct = Math.min(100, Math.max(0, score));

  const barColor =
    level === 'low'
      ? 'from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
      : level === 'medium'
      ? 'from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
      : 'from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]';

  const badgeClass =
    level === 'low'
      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
      : level === 'medium'
      ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
      : 'bg-rose-950/70 text-rose-300 border-rose-800/60';

  const levelTitle =
    level === 'low' ? 'Low Risk' : level === 'medium' ? 'Medium Risk' : 'High Risk';

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Risk Score Index</h3>
            <p className="text-[11px] text-slate-400">Deterministic risk calculation from observable inputs</p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider border ${badgeClass}`}>
          {levelTitle}
        </span>
      </div>

      {/* Main Score Display & Visual Bar */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono tracking-tight">{score}</span>
            <span className="text-base font-mono text-slate-400 font-semibold">/ 100</span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Threshold: {level === 'low' ? '0–30 (Normal)' : level === 'medium' ? '31–60 (Review)' : '61–100 (Elevated)'}
          </span>
        </div>

        {/* Multi-segment Progress Bar with Zone Markers */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-slate-950 rounded-full p-0.5 border border-slate-800 relative overflow-hidden flex">
            {/* Active fill */}
            <div
              style={{ width: `${pct}%` }}
              className={`h-full rounded-full bg-linear-to-r ${barColor} transition-all duration-500`}
            />
          </div>

          {/* Scale labels */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
            <span className="text-emerald-400">0 · Low (0–30)</span>
            <span className="text-amber-400">31 · Medium (31–60)</span>
            <span className="text-rose-400">61 · High (61–100)</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory & Ethical Explanation */}
      <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] sm:text-xs">
          The risk score represents observable review signals from the available interview data. It is not proof of misconduct.
        </p>
      </div>
    </div>
  );
};
