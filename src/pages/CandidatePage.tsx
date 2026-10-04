import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  PlusCircle,
  Download,
  Info,
  Layers,
  ArrowRight,
  Shield,
  FileCheck,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { PRIMARY_CANDIDATE } from '../data/candidateData';
import { CandidateProfile, ResumeData, InterviewQuestionItem } from '../types/candidate';
import { AIAnalysisResult } from '../types/aiAnalysis';
import { HumanReviewState } from '../types/riskEngine';
import { analyzeCandidateInterview, checkGeminiStatus } from '../services/geminiService';
import { evaluateRiskAssessment } from '../services/riskEngine';
import { CandidateProfileCard } from '../components/candidate/CandidateProfileCard';
import { WorkflowStepper } from '../components/common/WorkflowStepper';
import { ResumeSection } from '../components/candidate/ResumeSection';
import { InterviewAnswerSection } from '../components/candidate/InterviewAnswerSection';
import { AnalysisInputSummary } from '../components/candidate/AnalysisInputSummary';
import { AnalysisStatusTimeline } from '../components/candidate/AnalysisStatusTimeline';
import { CandidateSummarySidebar } from '../components/candidate/CandidateSummarySidebar';
import { AnalysisLoadingState } from '../components/candidate/AnalysisLoadingState';
import { AIAnalysisResultView } from '../components/candidate/AIAnalysisResultView';
import { AnalysisErrorView } from '../components/candidate/AnalysisErrorView';
import { RoutePath } from '../types';
import { sessionStore } from '../services/sessionStore';

interface CandidatePageProps {
  onNavigate: (path: RoutePath) => void;
}

export const CandidatePage: React.FC<CandidatePageProps> = ({ onNavigate }) => {
  const [candidate, setCandidate] = useState<CandidateProfile>(PRIMARY_CANDIDATE);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [humanReviewState, setHumanReviewState] = useState<HumanReviewState>({
    status: 'pending',
    reviewerNotes: '',
  });
  const [engineStatus, setEngineStatus] = useState<{
    configured: boolean;
    model: string;
    status: string;
  }>({
    configured: true,
    model: 'gemini-3.8-flash',
    status: 'checking',
  });

  // Calculate deterministic Risk Assessment whenever analysisResult or candidate changes
  const riskAssessment = useMemo(() => {
    if (!analysisResult) return null;
    return evaluateRiskAssessment({
      geminiAnalysis: analysisResult,
      interviewMetadata: {
        candidateId: candidate.id,
        candidateName: candidate.name,
        role: candidate.role,
      },
      humanReview: humanReviewState,
    });
  }, [analysisResult, candidate, humanReviewState]);

  // Check server configuration status on mount
  useEffect(() => {
    checkGeminiStatus().then((status) => {
      setEngineStatus(status);
    });
  }, []);

  // Handlers for candidate sub-data updates
  const handleUpdateResume = (updatedResume: ResumeData) => {
    setCandidate((prev: CandidateProfile) => ({
      ...prev,
      resume: updatedResume,
    }));
  };

  const handleUpdateQuestions = (updatedQuestions: InterviewQuestionItem[]) => {
    setCandidate((prev: CandidateProfile) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleCandidateChange = (newCandidate: CandidateProfile) => {
    setCandidate(newCandidate);
    setAnalysisResult(null);
    setAnalysisError(null);
    setHumanReviewState({ status: 'pending', reviewerNotes: '' });
  };

  const handleNewAnalysis = () => {
    const freshDraft: CandidateProfile = {
      id: `DEF-2026-00${Math.floor(Math.random() * 90) + 10}`,
      name: 'New Candidate',
      role: 'Software Engineer',
      experienceYears: '3.0 Years',
      location: 'Remote, Global',
      interviewStatus: 'Completed',
      avatarInitials: 'NC',
      email: 'candidate@example.com',
      resume: {
        skills: ['JavaScript', 'TypeScript', 'Node.js', 'React'],
        experienceYears: '3.0 Years',
        education: 'B.S. Computer Science',
        projects: ['Full-stack Application'],
        analysisStatus: 'Not Started',
      },
      questions: [
        {
          id: `draft-q1`,
          questionNumber: 1,
          questionText: 'Please introduce yourself and describe your recent technical projects.',
          answerText: '',
          category: 'Technical',
          responseTimeSeconds: 45,
        },
      ],
    };
    setCandidate(freshDraft);
    setAnalysisResult(null);
    setAnalysisError(null);
    setHumanReviewState({ status: 'pending', reviewerNotes: '' });
    setNotification('Initialized new candidate analysis draft.');
    setTimeout(() => setNotification(null), 3500);
  };

  // Real Gemini AI Analysis Trigger
  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setAnalysisError(null);

    const payload = {
      candidate: {
        name: candidate.name,
        role: candidate.role,
        experience: candidate.experienceYears,
        education: candidate.resume.education,
        skills: candidate.resume.skills,
        projects: candidate.resume.projects,
      },
      interviewResponses: candidate.questions.map((q) => ({
        questionNumber: q.questionNumber,
        question: q.questionText,
        answer: q.answerText,
        responseTime: q.responseTimeSeconds,
        category: q.category,
      })),
    };

    try {
      const result = await analyzeCandidateInterview(payload);
      setAnalysisResult(result);
      sessionStore.setAIAnalysis(candidate, result, null, humanReviewState);
      setNotification('Gemini AI evaluation generated successfully.');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAnalysisError(
        err.message || 'An unexpected error occurred while communicating with the Gemini AI service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasResume = Boolean(candidate.resume.fileName || candidate.resume.skills.length > 0);

  return (
    <div className="space-y-6">
      {/* Required Decision Support Disclaimer Banner */}
      <div className="rounded-lg bg-slate-900/80 border border-cyan-900/30 p-3.5 sm:p-4 text-xs text-slate-300 flex items-start gap-3 shadow-xs">
        <div className="p-1 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5">
          <div className="font-semibold text-cyan-200 text-xs flex items-center gap-2">
            <span>Decision Support Mandate</span>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-slate-400 font-normal">Human-in-the-Loop Protocol</span>
          </div>
          <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">
            DefenseAI provides decision-support signals and does not make automated hiring or misconduct decisions.
          </p>
        </div>
      </div>

      {/* 5-Step Recruiter Workflow Navigation Indicator */}
      <WorkflowStepper
        currentStep={analysisResult ? 3 : 1}
        onNavigate={onNavigate}
        variant="compact"
      />

      {notification && (
        <div className="p-3 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono flex items-center justify-between animate-in fade-in duration-200">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Candidate Analysis
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini AI Engine</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Review candidate information and prepare interview data for AI-assisted analysis.
          </p>
        </div>

        {/* Top-right Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleNewAnalysis}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (analysisResult) {
                onNavigate('/report');
              } else {
                setNotification('Please run AI Analysis first to generate the complete evidentiary report.');
                setTimeout(() => setNotification(null), 3500);
              }
            }}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              analysisResult
                ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
                : 'bg-slate-900/40 text-slate-500 border border-slate-800/60 cursor-not-allowed opacity-60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Candidate Profile Card with Step 1 Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold uppercase">
              Step 1 of 5
            </span>
            <span className="text-xs font-semibold text-white">Candidate Profile & Verification Baseline</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Review identity, credentials, and baseline interview questions
          </span>
        </div>
        <CandidateProfileCard
          candidate={candidate}
          onSelectCandidate={handleCandidateChange}
        />
      </div>

      {/* Main Workspace Grid (8 cols Main Workflow / 4 cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Interactive Workspace or Results */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active State Routing: Loading vs Error vs Result vs Input Form */}
          {isLoading ? (
            <AnalysisLoadingState candidateName={candidate.name} />
          ) : analysisError ? (
            <AnalysisErrorView
              errorMessage={analysisError}
              onRetry={handleRunAnalysis}
              onEditInputs={() => setAnalysisError(null)}
            />
          ) : analysisResult ? (
            <div className="space-y-6">
              <AIAnalysisResultView
                result={analysisResult}
                candidate={candidate}
                onRerun={handleRunAnalysis}
                onEditInputs={() => setAnalysisResult(null)}
                humanReviewState={humanReviewState}
                onUpdateHumanReview={(updated) => setHumanReviewState(updated)}
              />

              {/* Next Step Banner: Proceed to Step 5 (Final Report) */}
              <div className="rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-800/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                      Step 3 & 4 Complete
                    </span>
                    <h4 className="text-sm font-bold text-white">AI Analysis & Risk Evaluation Generated</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    The Gemini semantic signals and multi-factor risk assessment are ready. Proceed to Step 5 to review the full evidentiary dossier and sign off.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/report')}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md shadow-cyan-950/40 cursor-pointer"
                >
                  <span>Proceed to Step 5: Final Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1 Inputs Sub-Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold uppercase">
                    Step 1 Baseline Inputs
                  </span>
                  <span className="text-xs font-semibold text-white">Resume Claims & Interview Transcripts</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/interview')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                >
                  <span>Need live video? Step 2: Live Interview</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 3. Resume Section */}
              <ResumeSection
                resume={candidate.resume}
                onUpdateResume={handleUpdateResume}
              />

              {/* 4 & 5. Interview Responses & Answer Metadata */}
              <InterviewAnswerSection
                questions={candidate.questions}
                onUpdateQuestions={handleUpdateQuestions}
              />

              {/* 6. Analysis Inputs Summary */}
              <AnalysisInputSummary
                status={{
                  resumeAvailable: hasResume,
                  resumeDetails: candidate.resume.fileName
                    ? `${candidate.resume.fileName} attached`
                    : 'Skills staged manually',
                  responsesCount: candidate.questions.length,
                  behavioralSignalsConnected: false,
                  cameraAnalysisConnected: false,
                  aiEngineConnected: engineStatus.configured,
                  aiModelName: engineStatus.model,
                }}
              />
            </>
          )}
        </div>

        {/* Right Column (4 cols): Summary Panel, Status Steps & Primary Trigger */}
        <div className="lg:col-span-4 space-y-6">
          {/* 9 & 7. Candidate Summary Sidebar & Large Analyze Trigger */}
          <CandidateSummarySidebar
            candidate={candidate}
            responsesCount={candidate.questions.length}
            hasResume={hasResume}
            isLoading={isLoading}
            analysisResult={analysisResult}
            riskAssessment={riskAssessment}
            onRunAnalysis={handleRunAnalysis}
          />

          {/* 8. Analysis Pipeline Status Timeline */}
          <AnalysisStatusTimeline
            hasResume={hasResume}
            responsesCount={candidate.questions.length}
            isAiLoading={isLoading}
            isAiCompleted={Boolean(analysisResult)}
          />
        </div>
      </div>
    </div>
  );
};
