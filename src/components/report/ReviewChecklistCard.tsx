import React from 'react';
import { CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { ReviewerChecklist } from '../../types/report';

interface ReviewChecklistCardProps {
  checklist: ReviewerChecklist;
  onUpdateChecklist: (checklist: Partial<ReviewerChecklist>) => void;
}

export const ReviewChecklistCard: React.FC<ReviewChecklistCardProps> = ({
  checklist,
  onUpdateChecklist,
}) => {
  const items: { key: keyof ReviewerChecklist; label: string; desc: string }[] = [
    {
      key: 'reviewResponses',
      label: '1. Review candidate interview responses',
      desc: 'Verify that technical responses address the core questions with appropriate depth and specificity.',
    },
    {
      key: 'reviewConsistencySignals',
      label: '2. Review resume & skill consistency signals',
      desc: 'Confirm stated credentials on candidate profile correspond to interview derivation.',
    },
    {
      key: 'reviewVisionSignals',
      label: '3. Verify computer vision & camera signals',
      desc: 'Check face lock status, eye alignment telemetry, and multi-person indicators.',
    },
    {
      key: 'verifyCandidateInfo',
      label: '4. Validate candidate identity & background dossier',
      desc: 'Check profile metadata, experience timeline, and project references.',
    },
    {
      key: 'completeHumanAssessment',
      label: '5. Complete human evaluative sign-off',
      desc: 'Record recruiter notes and confirm decision complies with human-in-the-loop guidelines.',
    },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const isAllComplete = completedCount === items.length;

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Reviewer Checklist</h3>
            <p className="text-[11px] text-slate-400">Standard operating procedure verification steps</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium ${
            isAllComplete
              ? 'text-emerald-300 bg-emerald-950/50 border border-emerald-800/60'
              : 'text-cyan-300 bg-cyan-950/50 border border-cyan-800/60'
          }`}
        >
          {completedCount} / {items.length} Completed
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const isChecked = checklist[item.key];
          return (
            <div
              key={item.key}
              onClick={() => onUpdateChecklist({ [item.key]: !isChecked })}
              className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 text-xs ${
                isChecked
                  ? 'bg-slate-950/80 border-cyan-800/60'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="mt-0.5 shrink-0 text-cyan-400">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${isChecked ? 'text-cyan-200' : 'text-slate-300'}`}>
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
