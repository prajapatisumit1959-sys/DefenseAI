export type SignalSeverity = 'low' | 'medium' | 'high';

export interface PotentialSignal {
  type: string;
  severity: SignalSeverity;
  description: string;
  evidence: string;
}

export type QuestionQuality = 'strong' | 'adequate' | 'weak';

export interface QuestionAnalysis {
  questionNumber: number;
  relevanceScore: number;
  technicalDepthScore: number;
  quality: QuestionQuality;
  explanation: string;
}

export type AIRecommendation = 'consistent' | 'review_required';

export interface AIAnalysisResult {
  overallAssessment: string;
  answerQualityScore: number; // 0-100
  resumeConsistencyScore: number; // 0-100
  relevanceScore: number; // 0-100
  technicalDepthScore: number; // 0-100
  aiConfidence: number; // 0-100
  potentialSignals: PotentialSignal[];
  questionAnalysis: QuestionAnalysis[];
  recommendation: AIRecommendation;
  limitations: string[];
  evaluatedAt?: string;
  modelUsed?: string;
}

export interface CandidateAnalysisPayload {
  candidate: {
    name: string;
    role: string;
    experience: string;
    education: string;
    skills: string[];
    projects: string[];
  };
  interviewResponses: Array<{
    questionNumber?: number;
    question: string;
    answer: string;
    responseTime?: number;
    category?: string;
  }>;
}

export interface AnalysisErrorResponse {
  error: string;
  code?: 'CONFIG_ERROR' | 'INVALID_INPUT' | 'API_ERROR' | 'PARSE_ERROR' | 'NETWORK_ERROR';
  details?: string;
}
