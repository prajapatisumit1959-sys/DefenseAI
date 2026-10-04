import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { RiskAssessment } from '../../types/riskEngine';

interface ExplainableSignalsBreakdownProps {
  assessment: RiskAssessment | null;
}

export const ExplainableSignalsBreakdown: React.FC<ExplainableSignalsBreakdownProps> = ({
  assessment,
}) => {
  if (!assessment) {
    return (
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-2">
        <h3 className="text-sm font-bold text-white tracking-tight">Explainable Risk Signals</h3>
        <p className="text-xs text-slate-400">Analysis required to generate signal breakdown.</p>
      </div>
    );
  }

  // Strictly filter to active signals that actually contributed to the score
  const activeSignals = assessment.signals.filter((s) => s.active && s.scoreContribution > 0);

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Explainable Risk Signals</h3>
            <p className="text-[11px] text-slate-400">
              Granular breakdown of signals actively contributing to the risk score
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {activeSignals.length} Active {activeSignals.length === 1 ? 'Signal' : 'Signals'}
        </span>
      </div>

      {activeSignals.length === 0 ? (
        <div className="p-5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-emerald-200">No elevated risk signals detected</div>
            <p className="text-emerald-400/80 text-[11px] mt-0.5">
              All evaluated interview responses and observable sensory inputs remain within normal consistency thresholds.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activeSignals.map((signal) => {
            const severityBadge =
              signal.severity === 'high'
                ? 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                : signal.severity === 'medium'
                ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';

            return (
              <div
                key={signal.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3 hover:border-slate-700 transition-colors"
              >
                {/* Header row: Name, Severity, Contribution */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        signal.severity === 'high'
                          ? 'text-rose-400'
                          : signal.severity === 'medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-white tracking-tight">{signal.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${severityBadge}`}
                    >
                      {signal.severity}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                      +{signal.scoreContribution} pts
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-xs text-slate-300 leading-relaxed pl-6 border-l-2 border-slate-800">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block mb-0.5">
                    Explanation
                  </span>
                  {signal.explanation}
                </div>

                {/* Evidence quotation */}
                {signal.evidence && (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      <FileText className="w-3 h-3" />
                      <span>Evidentiary Quote / Log Context</span>
                    </div>
                    <blockquote className="italic text-slate-300 font-sans border-l-2 border-cyan-500/50 pl-2 py-0.5">
                      "{signal.evidence}"
                    </blockquote>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
