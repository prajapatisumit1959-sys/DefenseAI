import { AIAnalysisResult } from './aiAnalysis';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskSignal {
  id: string;
  name: string;
  type: string;
  severity: RiskLevel;
  weight: number; // Maximum potential weight contribution (e.g. 20, 15, 10)
  scoreContribution: number; // Actual points added to this candidate's score
  description: string;
  explanation: string;
  evidence: string;
  active: boolean; // Whether the condition was triggered
  category: 'gemini_analysis' | 'camera_signal' | 'behavioral_signal';
  status: 'detected' | 'not_detected' | 'not_connected';
}

export interface RiskDataSourceStatus {
  available: boolean;
  status: 'Connected' | 'Not Connected' | 'Not Available';
  description: string;
}

export interface HumanReviewState {
  status: 'pending' | 'reviewed' | 'additional_verification_requested';
  reviewerNotes: string;
  reviewedBy?: string;
  updatedAt?: string;
}

export interface RiskAssessment {
  score: number; // 0 <= score <= 100 (deterministic, clamped)
  level: RiskLevel; // low (0-30), medium (31-60), high (61-100)
  signals: RiskSignal[]; // Active signals that contributed to the score
  allSignals: RiskSignal[]; // All 7 signals evaluated (active, inactive, unconnected)
  recommendation: string; // Explanatory recommendation
  summary: string;
  dataSources: {
    geminiAnalysis: RiskDataSourceStatus;
    cameraSignals: RiskDataSourceStatus;
    behavioralSignals: RiskDataSourceStatus;
  };
  humanReview: HumanReviewState;
  evaluatedAt: string;
}

export interface RiskEngineInputs {
  geminiAnalysis: AIAnalysisResult;
  behavioralSignals?: Array<{
    type: string;
    value: unknown;
  }>;
  cameraSignals?: Array<{
    type: string;
    value: unknown;
  }>;
  interviewMetadata?: {
    candidateId?: string;
    candidateName?: string;
    role?: string;
    durationSeconds?: number;
  };
  humanReview?: Partial<HumanReviewState>;
}

export interface DeterministicTestScenario {
  id: string;
  label: string;
  description: string;
  targetLevel: RiskLevel;
  mockGeminiResult: AIAnalysisResult;
}
