export type SignalStatusState = 'NORMAL' | 'ATTENTION' | 'UNAVAILABLE';

export interface SignalCardProps {
  icon: React.ReactNode;
  name: string;
  value: string | number;
  status: SignalStatusState;
  subtext?: string;
  actionButton?: React.ReactNode;
}

export interface SessionTimelineEvent {
  id: string;
  timestamp: string; // HH:MM:SS
  isoTime: string;
  title: string;
  description?: string;
  type: 'session' | 'camera' | 'face' | 'multi_person' | 'pause' | 'resume' | 'question' | 'verification';
  status: 'normal' | 'attention' | 'neutral';
}

export interface QuestionTimingRecord {
  questionId: string;
  questionText: string;
  startTime: string | null;
  endTime: string | null;
  responseDurationSeconds: number;
  status: 'Waiting for Response' | 'Recording Response' | 'Response Completed';
}

export interface EvaluatorSessionReview {
  status: 'unreviewed' | 'flagged' | 'verified';
  notes: string;
  savedTimestamp?: string;
}
