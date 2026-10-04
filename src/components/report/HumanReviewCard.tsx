import React, { useState } from 'react';
import { UserCheck, ShieldCheck, AlertTriangle, Save, CheckCircle2, FileEdit } from 'lucide-react';
import { HumanReviewState } from '../../types/riskEngine';
import { AIAnalysisResult } from '../../types/aiAnalysis';

interface HumanReviewCardProps {
  review: HumanReviewState;
  aiAnalysis: AIAnalysisResult | null;
  onUpdateReview: (review: Partial<HumanReviewState>) => void;
}

export const HumanReviewCard: React.FC<HumanReviewCardProps> = ({
  review,
  aiAnalysis,
  onUpdateReview,
}) => {
  const [notes, setNotes] = useState(review.reviewerNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveNotes = () => {
    onUpdateReview({ reviewerNotes: notes });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSetStatus = (status: HumanReviewState['status']) => {
    onUpdateReview({ status, reviewerNotes: notes });
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Human-in-the-Loop Review</h3>
            <p className="text-[11px] text-slate-400">Evaluator attestation and final hiring recommendation</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded text-xs font-semibold uppercase border ${
              review.status === 'reviewed'
                ? 'text-emerald-300 bg-emerald-950/40 border-emerald-800/50'
                : review.status === 'additional_verification_requested'
                ? 'text-rose-300 bg-rose-950/40 border-rose-800/50'
                : 'text-amber-300 bg-amber-950/40 border-amber-800/50'
            }`}
          >
            {review.status === 'reviewed'
              ? 'Reviewed & Cleared'
              : review.status === 'additional_verification_requested'
              ? 'Flagged for Verification'
              : 'Review Pending'}
          </span>
        </div>
      </div>

      {/* Recommendation context */}
      {aiAnalysis?.recommendation && (
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">AI Suggested Guideline:</span>
          <span className="font-semibold text-white">{aiAnalysis.recommendation}</span>
        </div>
      )}

      {/* Reviewer Notes Field */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Evaluator Verification Notes:</span>
          {review.reviewedBy && (
            <span className="text-[11px] text-slate-500 font-normal">Assigned to: {review.reviewedBy}</span>
          )}
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record notes on interview demeanor, follow-up probe questions, or technical verification notes..."
          className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
        />
      </div>

      {/* Reviewer Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSetStatus('reviewed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              review.status === 'reviewed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Reviewed</span>
          </button>

          <button
            onClick={() => handleSetStatus('additional_verification_requested')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              review.status === 'additional_verification_requested'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Flag for Additional Verification</span>
          </button>
        </div>

        <button
          onClick={handleSaveNotes}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isSaved ? 'Saved!' : 'Save Notes'}</span>
        </button>
      </div>
    </div>
  );
};
