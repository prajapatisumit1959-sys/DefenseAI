export type RoutePath =
  | '/'
  | '/dashboard'
  | '/candidate'
  | '/interview'
  | '/report'
  | '/history'
  | '/settings';

export type SignalLevel = 'low' | 'moderate' | 'elevated';

export type ReviewStatus = 'pending_review' | 'verified_authentic' | 'followup_required' | 'cleared';

export interface InterviewSession {
  id: string;
  candidateName: string;
  candidateRole: string;
  candidateEmail: string;
  date: string;
  durationMinutes: number;
  overallSignalLevel: SignalLevel;
  reviewStatus: ReviewStatus;
  primarySignalsCount: number;
  reviewerNotes?: string;
  assignedRecruiter: string;
}

export interface BehavioralSignal {
  id: string;
  timestamp: string;
  category: 'Audio Latency' | 'Gaze Alignment' | 'Speech Consistency' | 'Screen Interaction';
  severity: SignalLevel;
  description: string;
  explainabilityNote: string;
  suggestedFollowUp: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  deltaText: string;
  deltaType: 'neutral' | 'positive' | 'warning' | 'alert';
  description: string;
}

export * from './riskEngine';
export * from './vision';
