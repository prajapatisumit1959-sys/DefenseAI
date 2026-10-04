import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { RiskAssessment } from '../../types/riskEngine';

interface LiveRiskCardProps {
  assessment: RiskAssessment;
  multiplePersonDetected: boolean;
}

export const LiveRiskCard: React.FC<LiveRiskCardProps> = ({
  assessment,
  multiplePersonDetected,
}) => {
  const getBadge = () => {
    switch (assessment.level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase font-mono bg-rose-950/80 text-rose-300 border border-rose-800/80">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            HIGH RISK ({assessment.score}/100)
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase font-mono bg-amber-950/80 text-amber-300 border border-amber-700/80">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            MEDIUM RISK ({assessment.score}/100)
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            LOW RISK ({assessment.score}/100)
          </span>
        );
    }
  };

  const activeSignals = assessment.signals.filter((s) => s.active);

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/50 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Live Risk Indicators</h3>
            <p className="text-[11px] text-slate-400">Deterministic scoring engine · Zero black-box decisions</p>
          </div>
        </div>
        {getBadge()}
      </div>

      {/* Signals List */}
      <div>
        <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-2">
          Risk Signals Detected:
        </div>

        {activeSignals.length === 0 ? (
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No risk signals detected in current session.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {activeSignals.map((signal) => (
              <div
                key={signal.id}
                className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{signal.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">{signal.explanation}</p>
                </div>
                <span className="font-mono text-xs font-bold text-amber-400 shrink-0 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                  +{signal.weight} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Explanation */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Risk Explanation & Human-in-the-Loop Recommendation:</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {assessment.recommendation}
        </p>
        <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
          Risk signals represent real-time sensory inputs for evaluator context, never automated disqualifications.
        </p>
      </div>
    </div>
  );
};
