import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Radio,
  User,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/layout/DisclaimerBanner';
import { WorkflowStepper } from '../components/common/WorkflowStepper';
import { RoutePath } from '../types';
import { useSessionReport } from '../services/sessionStore';

// Report components
import { ReportHeader } from '../components/report/ReportHeader';
import { ExecutiveSummaryCard } from '../components/report/ExecutiveSummaryCard';
import { RiskScoreGauge } from '../components/report/RiskScoreGauge';
import { ExplainableSignalsBreakdown } from '../components/report/ExplainableSignalsBreakdown';
import { GeminiAnalysisCard } from '../components/report/GeminiAnalysisCard';
import { QuestionAnalysisAccordion } from '../components/report/QuestionAnalysisAccordion';
import { ResumeConsistencyCard } from '../components/report/ResumeConsistencyCard';
import { ComputerVisionCard } from '../components/report/ComputerVisionCard';
import { SessionSummaryCard } from '../components/report/SessionSummaryCard';
import { SessionTimelineCard } from '../components/report/SessionTimelineCard';
import { HumanReviewCard } from '../components/report/HumanReviewCard';
import { ReviewChecklistCard } from '../components/report/ReviewChecklistCard';
import { DataSourcesAndLimitations } from '../components/report/DataSourcesAndLimitations';

interface ReportPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ onNavigate }) => {
  const [reportData, { updateChecklist, updateReview, selectSession, completedSessions }] =
    useSessionReport();

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // If there are no completed sessions or the current session is not completed
  if (!reportData || !reportData.hasCompletedSession) {
    return (
      <div className="space-y-6">
        <DisclaimerBanner compact />

        {/* 5-Step Recruiter Workflow Indicator */}
        <WorkflowStepper currentStep={5} onNavigate={onNavigate} variant="compact" />

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 font-semibold uppercase">
              Step 5 of 5: Final Report
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Awaiting Completed Session & Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Step 5 compiles the final decision-support dossier by synthesizing data from earlier stages: candidate profile (Step 1), live telemetry (Step 2), AI semantic consistency (Step 3), and multi-factor risk assessment (Step 4).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/candidate')}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <User className="w-4 h-4" />
              <span>Start at Step 1: Candidate</span>
            </button>

            <button
              onClick={() => onNavigate('/interview')}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Open Step 2: Live Interview</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle client-side audit file export
  const handleDownload = () => {
    const candidateName = reportData.candidate.name;
    const sessionId = reportData.session.sessionId;
    const riskScore = reportData.riskAssessment?.score ?? 'N/A';
    const riskLevel = reportData.riskAssessment?.level ?? 'unassessed';

    const auditData = {
      title: 'DefenseAI Verification Audit Report',
      generatedAt: reportData.generatedAt,
      candidate: {
        id: reportData.candidate.id,
        name: candidateName,
        role: reportData.candidate.role,
        experienceYears: reportData.candidate.experienceYears,
      },
      session: reportData.session,
      riskAssessment: reportData.riskAssessment,
      aiAnalysis: reportData.aiAnalysis,
      cvSignals: reportData.visionSignals,
      timelineEvents: reportData.timeline,
      humanReview: reportData.review,
      checklist: reportData.checklist,
      notice:
        'DefenseAI is a decision-support system. Risk indicators should not be used as the sole basis for employment decisions.',
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `defenseai_report_${sessionId}_${candidateName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Audit bundle exported for ${candidateName} (${sessionId})`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner compact />

      {/* 5-Step Recruiter Workflow Indicator */}
      <WorkflowStepper currentStep={5} onNavigate={onNavigate} variant="compact" />

      {/* Session Switcher if multiple completed sessions exist */}
      {completedSessions.length > 1 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">Archived Completed Sessions:</span>
          <div className="flex items-center gap-2">
            <select
              value={reportData.session.sessionId}
              onChange={(e) => selectSession(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500/60 font-mono"
            >
              {completedSessions.map((s) => (
                <option key={s.session.sessionId} value={s.session.sessionId}>
                  {s.session.sessionId} — {s.session.candidateName} ({s.session.duration})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {downloadNotice && (
        <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
          {downloadNotice}
        </div>
      )}

      {/* 1. Header with metadata and print/download actions */}
      <ReportHeader
        reportData={reportData}
        onNavigate={onNavigate}
        onPrint={handlePrint}
        onDownload={handleDownload}
      />

      {/* 2 & 3. Executive Summary + Risk Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ExecutiveSummaryCard
            riskAssessment={reportData.riskAssessment}
            aiAnalysis={reportData.aiAnalysis}
          />
        </div>
        <div className="lg:col-span-4">
          <RiskScoreGauge assessment={reportData.riskAssessment} />
        </div>
      </div>

      {/* 4. Explainable Risk Signals Breakdown */}
      <ExplainableSignalsBreakdown assessment={reportData.riskAssessment} />

      {/* 5. Gemini AI Analysis Card */}
      <GeminiAnalysisCard aiAnalysis={reportData.aiAnalysis} onNavigate={onNavigate} />

      {/* 6. Question Analysis Accordion */}
      <QuestionAnalysisAccordion
        candidate={reportData.candidate}
        aiAnalysis={reportData.aiAnalysis}
      />

      {/* 7. Resume Consistency Card */}
      <ResumeConsistencyCard
        candidate={reportData.candidate}
        aiAnalysis={reportData.aiAnalysis}
      />

      {/* 8. Computer Vision Signals */}
      <ComputerVisionCard
        visionSignals={reportData.visionSignals}
        cvConnected={reportData.cvConnected}
      />

      {/* 9 & 10. Session Summary & Session Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <SessionSummaryCard
            session={reportData.session}
            cvConnected={reportData.cvConnected}
            hasRiskAssessment={Boolean(reportData.riskAssessment)}
          />
        </div>
        <div className="lg:col-span-6">
          <SessionTimelineCard timeline={reportData.timeline} />
        </div>
      </div>

      {/* 11 & 12. Human Review & Review Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <HumanReviewCard
            review={reportData.review}
            aiAnalysis={reportData.aiAnalysis}
            onUpdateReview={updateReview}
          />
        </div>
        <div className="lg:col-span-5">
          <ReviewChecklistCard
            checklist={reportData.checklist}
            onUpdateChecklist={updateChecklist}
          />
        </div>
      </div>

      {/* 13, 14, 15. Data Sources, Expandable Limitations, Final Decision-Support Notice */}
      <DataSourcesAndLimitations />
    </div>
  );
};
