import {
  DashboardSummaryMetric,
  RiskTrendDay,
  DashboardCandidateInterview,
  SignalDistributionItem,
  SecurityActivityEvent,
  SystemServiceStatus,
} from '../types/dashboard';

/**
 * 1. Summary Cards Demo Data
 * Easily swappable when connecting to real backend analytics endpoints.
 */
export const DASHBOARD_SUMMARY_CARDS: DashboardSummaryMetric[] = [
  {
    id: 'metric-interviews',
    title: 'Interviews Analyzed',
    value: 128,
    change: '+12.5%',
    isPositiveTrend: true,
    deltaType: 'positive',
    iconType: 'video',
    caption: 'Total candidate sessions evaluated (30d)',
  },
  {
    id: 'metric-low-risk',
    title: 'Low Risk',
    value: 76,
    change: '+8.2%',
    isPositiveTrend: true,
    deltaType: 'positive',
    iconType: 'shield-check',
    caption: 'Natural baseline & consistent response markers',
  },
  {
    id: 'metric-review-req',
    title: 'Review Required',
    value: 38,
    change: '+5.4%',
    isPositiveTrend: false,
    deltaType: 'warning',
    iconType: 'alert-triangle',
    caption: 'Mild inconsistencies queued for human review',
  },
  {
    id: 'metric-high-risk',
    title: 'High Risk Signals',
    value: 14,
    change: '-3.1%',
    isPositiveTrend: true, // fewer high-risk signals is a positive trend
    deltaType: 'alert',
    iconType: 'shield-warning',
    caption: 'Multi-vector anomaly clusters requiring audit',
  },
];

/**
 * 2. Risk Overview (Last 7 Days) Demo Data
 */
export const RISK_OVERVIEW_TREND_7D: RiskTrendDay[] = [
  { day: 'Mon', dateStr: 'Sep 22', lowRisk: 10, reviewRequired: 4, highRisk: 2 },
  { day: 'Tue', dateStr: 'Sep 23', lowRisk: 14, reviewRequired: 5, highRisk: 1 },
  { day: 'Wed', dateStr: 'Sep 24', lowRisk: 12, reviewRequired: 7, highRisk: 3 },
  { day: 'Thu', dateStr: 'Sep 25', lowRisk: 16, reviewRequired: 6, highRisk: 2 },
  { day: 'Fri', dateStr: 'Sep 26', lowRisk: 11, reviewRequired: 8, highRisk: 4 },
  { day: 'Sat', dateStr: 'Sep 27', lowRisk: 8, reviewRequired: 3, highRisk: 1 },
  { day: 'Sun', dateStr: 'Sep 28', lowRisk: 13, reviewRequired: 5, highRisk: 1 },
];

/**
 * 3. Recent Interviews Demo Data
 */
export const RECENT_CANDIDATE_INTERVIEWS: DashboardCandidateInterview[] = [
  {
    id: 'INT-9041',
    candidateName: 'Alex Morgan',
    candidateInitials: 'AM',
    candidateEmail: 'alex.morgan@example.com',
    role: 'Frontend Developer',
    interviewDate: 'Today · 10:30 AM',
    aiConfidence: 92,
    riskLevel: 'Low Risk',
    status: 'Completed',
    keyFlagSummary: 'Consistent code derivation & natural camera contact.',
  },
  {
    id: 'INT-9038',
    candidateName: 'Sarah Williams',
    candidateInitials: 'SW',
    candidateEmail: 's.williams@example.com',
    role: 'Data Analyst',
    interviewDate: 'Today · 08:45 AM',
    aiConfidence: 84,
    riskLevel: 'Review Required',
    status: 'Completed',
    keyFlagSummary: 'Brief response latency on SQL windowing question.',
  },
  {
    id: 'INT-9035',
    candidateName: 'Michael Chang',
    candidateInitials: 'MC',
    candidateEmail: 'm.chang@example.com',
    role: 'Senior DevOps Engineer',
    interviewDate: 'Yesterday · 04:15 PM',
    aiConfidence: 61,
    riskLevel: 'High Risk',
    status: 'In Review',
    keyFlagSummary: 'Unusual audio latency & off-screen gaze persistence.',
  },
  {
    id: 'INT-9029',
    candidateName: 'Elena Rostova',
    candidateInitials: 'ER',
    candidateEmail: 'elena.r@example.com',
    role: 'Distributed Systems Engineer',
    interviewDate: 'Yesterday · 01:00 PM',
    aiConfidence: 95,
    riskLevel: 'Low Risk',
    status: 'Completed',
    keyFlagSummary: 'High conversational entropy & authentic whiteboard reasoning.',
  },
  {
    id: 'INT-9024',
    candidateName: 'David Kim',
    candidateInitials: 'DK',
    candidateEmail: 'david.kim@example.com',
    role: 'Full Stack Engineer',
    interviewDate: 'Sep 26 · 11:30 AM',
    aiConfidence: 78,
    riskLevel: 'Review Required',
    status: 'Completed',
    keyFlagSummary: 'Sudden syntactic shift from casual to formal phrasing.',
  },
];

/**
 * 4. Signal Distribution Categories Demo Data
 */
export const SIGNAL_DISTRIBUTION_DATA: SignalDistributionItem[] = [
  {
    name: 'Answer Consistency',
    value: 34,
    color: '#06b6d4', // cyan-500
    description: 'Lexical shifts, phrasing jumps, and verbatim script markers',
  },
  {
    name: 'Behavioral Signals',
    value: 26,
    color: '#3b82f6', // blue-500
    description: 'Off-axis focal gaze, pupil alignment, and body orientation',
  },
  {
    name: 'Response Delay',
    value: 18,
    color: '#f59e0b', // amber-500
    description: 'Unusual latency onset windows before verbal formulation',
  },
  {
    name: 'Multiple Person',
    value: 12,
    color: '#ef4444', // red-500
    description: 'Secondary voice frequency spikes or peripheral presence',
  },
  {
    name: 'Camera Signals',
    value: 10,
    color: '#8b5cf6', // purple-500
    description: 'Virtual camera driver injection and frame drops',
  },
];

/**
 * 5. Recent Security Activity Demo Events
 */
export const RECENT_SECURITY_ACTIVITIES: SecurityActivityEvent[] = [
  {
    id: 'act-1',
    title: 'Interview session completed',
    description: 'Elena Rostova (INT-9029) session finished. Baseline telemetry recorded.',
    timestamp: '8 minutes ago',
    type: 'session_complete',
    candidateRef: 'Elena Rostova',
  },
  {
    id: 'act-2',
    title: 'Answer consistency analysis generated',
    description: 'AI model processed 14 answers for Sarah Williams (INT-9038). AI Confidence: 84%.',
    timestamp: '24 minutes ago',
    type: 'analysis_generated',
    candidateRef: 'Sarah Williams',
  },
  {
    id: 'act-3',
    title: 'Multiple-person signal detected',
    description: 'Secondary audio input spike flagged at 19:42 in session INT-9035 (Michael Chang).',
    timestamp: '1 hour ago',
    type: 'signal_detected',
    candidateRef: 'Michael Chang',
  },
  {
    id: 'act-4',
    title: 'Candidate report generated',
    description: 'Comprehensive evidentiary dossier exported for Alex Morgan (INT-9041).',
    timestamp: '2 hours ago',
    type: 'report_generated',
    candidateRef: 'Alex Morgan',
  },
  {
    id: 'act-5',
    title: 'Manual review completed',
    description: 'Recruiter Sarah Jenkins verified technical explanation for David Kim (INT-9024).',
    timestamp: '4 hours ago',
    type: 'manual_review',
    candidateRef: 'David Kim',
  },
];

/**
 * 7. System Status Services (Placeholders for real integration)
 */
export const SYSTEM_SERVICES_STATUS: SystemServiceStatus[] = [
  {
    name: 'AI Analysis Engine',
    status: 'Operational',
    details: 'Semantic coherence & latency pipeline',
    simulatedLatency: '42ms',
  },
  {
    name: 'Interview Monitor',
    status: 'Ready',
    details: 'WebRTC telemetry stream receiver',
    simulatedLatency: '18ms',
  },
  {
    name: 'Camera Module',
    status: 'Ready',
    details: 'Gaze tracking & frame integrity service',
    simulatedLatency: '24ms',
  },
  {
    name: 'Risk Engine',
    status: 'Operational',
    details: 'Decision-support rule evaluator',
    simulatedLatency: '35ms',
  },
];

export const DASHBOARD_DISCLAIMER_TEXT =
  'DefenseAI provides AI-assisted signals for human review. It does not make automated hiring or misconduct decisions.';
