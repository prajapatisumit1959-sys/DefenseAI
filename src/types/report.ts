import { CandidateProfile } from './candidate';
import { AIAnalysisResult } from './aiAnalysis';
import { RiskAssessment, HumanReviewState } from './riskEngine';
import { VisionSignals } from './vision';
import { SessionTimelineEvent } from './interview';

export interface ReviewerChecklist {
  reviewResponses: boolean;
  reviewConsistencySignals: boolean;
  reviewVisionSignals: boolean;
  verifyCandidateInfo: boolean;
  completeHumanAssessment: boolean;
}

export interface InterviewSessionData {
  sessionId: string;
  candidateName: string;
  role: string;
  startTime: string | null;
  endTime: string | null;
  duration: string;
  elapsedSeconds: number;
  status: 'Completed' | 'Active' | 'Paused' | 'Ready' | 'Not Started';
  cameraAvailable: boolean;
  cameraActive: boolean;
  aiAnalysisCompleted: boolean;
  cvConnected: boolean;
  questionsCompleted: number;
}

export interface InterviewReportData {
  hasCompletedSession: boolean;
  candidate: CandidateProfile;
  session: InterviewSessionData;
  aiAnalysis: AIAnalysisResult | null;
  riskAssessment: RiskAssessment | null;
  visionSignals: VisionSignals | null;
  cvConnected: boolean;
  timeline: SessionTimelineEvent[];
  review: HumanReviewState;
  checklist: ReviewerChecklist;
  generatedAt: string;
}
