import { RoutePath } from './index';

export type DashboardRiskLevel = 'Low Risk' | 'Review Required' | 'High Risk';

export type CandidateInterviewStatus = 'Completed' | 'In Review' | 'Scheduled' | 'Pending Human Sign-off';

export interface DashboardSummaryMetric {
  id: string;
  title: string;
  value: number | string;
  change: string;
  isPositiveTrend?: boolean;
  deltaType: 'positive' | 'warning' | 'alert' | 'neutral';
  iconType: 'video' | 'shield-check' | 'alert-triangle' | 'shield-warning';
  caption: string;
}

export interface RiskTrendDay {
  day: string;
  dateStr: string;
  lowRisk: number;
  reviewRequired: number;
  highRisk: number;
}

export interface DashboardCandidateInterview {
  id: string;
  candidateName: string;
  candidateInitials: string;
  candidateEmail: string;
  role: string;
  interviewDate: string;
  aiConfidence: number; // e.g. 92
  riskLevel: DashboardRiskLevel;
  status: CandidateInterviewStatus;
  keyFlagSummary?: string;
}

export interface SignalDistributionItem {
  name: string;
  value: number;
  color: string;
  description: string;
}

export interface SecurityActivityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'session_complete' | 'signal_detected' | 'analysis_generated' | 'report_generated' | 'manual_review';
  candidateRef?: string;
}

export interface SystemServiceStatus {
  name: string;
  status: 'Operational' | 'Ready' | 'Degraded';
  details: string;
  simulatedLatency?: string;
}
