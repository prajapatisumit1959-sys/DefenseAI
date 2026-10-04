import React, { useState } from 'react';
import { ShieldCheck, Flag, FileText, Check, Save } from 'lucide-react';
import { EvaluatorSessionReview } from '../../types/interview';

interface HumanReviewControlsProps {
  review: EvaluatorSessionReview;
  onUpdateReview: (review: EvaluatorSessionReview) => void;
  onAddTimelineEvent: (title: string, description?: string, status?: 'normal' | 'attention' | 'neutral') => void;
}

export const HumanReviewControls: React.FC<HumanReviewControlsProps> = ({
  review,
  onUpdateReview,
  onAddTimelineEvent,
}) => {
  const [noteText, setNoteText] = useState<string>(review.notes);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const handleFlagForReview = () => {
    const updated: EvaluatorSessionReview = {
      ...review,
      status: 'flagged',
    };
    onUpdateReview(updated);
    onAddTimelineEvent(
      'Session flagged for manual review',
      'Evaluator marked session for secondary human oversight',
      'attention'
    );
  };

  const handleMarkVerified = () => {
    const updated: EvaluatorSessionReview = {
      ...review,
      status: 'verified',
    };
    onUpdateReview(updated);
    onAddTimelineEvent(
      'Session marked as verified',
      'Evaluator confirmed identity and interview conditions',
      'normal'
    );
  };

  const handleSaveNotes = () => {
    const updated: EvaluatorSessionReview = {
      ...review,
      notes: noteText,
      savedTimestamp: new Date().toLocaleTimeString(),
    };
    onUpdateReview(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);

    onAddTimelineEvent(
      'Evaluator note saved',
      noteText.slice(0, 80) + (noteText.length > 80 ? '...' : ''),
      'neutral'
    );
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/50 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Human Review Controls</h3>
            <p className="text-[11px] text-slate-400">Interviewer oversight, audit notes, and verified status</p>
          </div>
        </div>

        <div>
          {review.status === 'verified' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Verified
            </span>
          )}
          {review.status === 'flagged' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60">
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              Flagged for Review
            </span>
          )}
          {review.status === 'unreviewed' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
              Pending Evaluation
            </span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleFlagForReview}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
            review.status === 'flagged'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-slate-900 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border-slate-700 hover:border-amber-700/60'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Flag for Review</span>
        </button>

        <button
          onClick={handleMarkVerified}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
            review.status === 'verified'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-slate-900 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border-slate-700 hover:border-emerald-700/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Mark as Verified</span>
        </button>
      </div>

      {/* Notes Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <label htmlFor="evaluator-notes" className="font-semibold text-slate-300">
            Evaluator Notes:
          </label>
          {review.savedTimestamp && (
            <span className="text-[10px] font-mono text-slate-500">
              Last saved at {review.savedTimestamp}
            </span>
          )}
        </div>

        <textarea
          id="evaluator-notes"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Enter observational feedback, interview questions discussed, or candidate clarifications..."
          rows={3}
          className="w-full rounded-lg bg-slate-950/80 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 font-sans"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Notes are saved in local session memory for dossier compilation.
          </span>

          <button
            onClick={handleSaveNotes}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-colors"
          >
            {justSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
