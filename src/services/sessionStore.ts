import { useState, useEffect, useCallback } from 'react';
import { PRIMARY_CANDIDATE } from '../data/candidateData';
import { CandidateProfile } from '../types/candidate';
import { AIAnalysisResult } from '../types/aiAnalysis';
import { RiskAssessment, HumanReviewState } from '../types/riskEngine';
import { VisionSignals } from '../types/vision';
import { SessionTimelineEvent } from '../types/interview';
import { InterviewReportData, ReviewerChecklist, InterviewSessionData } from '../types/report';
import { evaluateRiskAssessment } from './riskEngine';

const COMPLETED_SESSIONS_KEY = 'defenseai_completed_sessions_v1';
const SELECTED_SESSION_ID_KEY = 'defenseai_selected_session_id_v1';
const ACTIVE_SESSION_KEY = 'defenseai_active_session_v1';

export const DEFAULT_CHECKLIST: ReviewerChecklist = {
  reviewResponses: false,
  reviewConsistencySignals: false,
  reviewVisionSignals: false,
  verifyCandidateInfo: false,
  completeHumanAssessment: false,
};

export const DEFAULT_SESSION_META: InterviewSessionData = {
  sessionId: PRIMARY_CANDIDATE.id,
  candidateName: PRIMARY_CANDIDATE.name,
  role: PRIMARY_CANDIDATE.role,
  startTime: null,
  endTime: null,
  duration: '00:00:00',
  elapsedSeconds: 0,
  status: 'Ready',
  cameraAvailable: false,
  cameraActive: false,
  aiAnalysisCompleted: false,
  cvConnected: false,
  questionsCompleted: 0,
};

function createInitialReportData(): InterviewReportData {
  return {
    hasCompletedSession: false,
    candidate: PRIMARY_CANDIDATE,
    session: DEFAULT_SESSION_META,
    aiAnalysis: null,
    riskAssessment: null,
    visionSignals: null,
    cvConnected: false,
    timeline: [],
    review: {
      status: 'pending',
      reviewerNotes: '',
    },
    checklist: DEFAULT_CHECKLIST,
    generatedAt: new Date().toISOString(),
  };
}

// Storage loaders
function loadCompletedSessions(): InterviewReportData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPLETED_SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not load completed sessions from localStorage:', err);
  }
  return [];
}

function loadSelectedSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(SELECTED_SESSION_ID_KEY);
  } catch {
    return null;
  }
}

function loadActiveSession(): InterviewReportData {
  if (typeof window === 'undefined') return createInitialReportData();
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not load active session:', err);
  }
  return createInitialReportData();
}

// In-memory state
let completedSessions: InterviewReportData[] = loadCompletedSessions();
let selectedSessionId: string | null = loadSelectedSessionId();
let activeSession: InterviewReportData = loadActiveSession();

const listeners = new Set<() => void>();

function persistState() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(completedSessions));
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(activeSession));
    if (selectedSessionId) {
      localStorage.setItem(SELECTED_SESSION_ID_KEY, selectedSessionId);
    } else {
      localStorage.removeItem(SELECTED_SESSION_ID_KEY);
    }
  } catch (err) {
    console.warn('Could not persist sessionStore state:', err);
  }
}

function notifyListeners() {
  persistState();
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying sessionStore listener:', e);
    }
  });
}

export const sessionStore = {
  getCompletedSessions(): InterviewReportData[] {
    return [...completedSessions];
  },

  getSelectedSessionId(): string | null {
    return selectedSessionId;
  },

  getSelectedSession(): InterviewReportData | null {
    if (selectedSessionId) {
      const found = completedSessions.find((s) => s.session.sessionId === selectedSessionId);
      if (found) return found;
    }
    // Return first completed session if available
    return completedSessions.length > 0 ? completedSessions[0] : null;
  },

  getActiveSession(): InterviewReportData {
    return activeSession;
  },

  // Backwards compatibility for get()
  get(): InterviewReportData {
    const selected = sessionStore.getSelectedSession();
    if (selected) return selected;
    return activeSession;
  },

  selectSession(sessionId: string) {
    selectedSessionId = sessionId;
    notifyListeners();
  },

  setCandidate(candidate: CandidateProfile) {
    activeSession = {
      ...activeSession,
      candidate,
      session: {
        ...activeSession.session,
        sessionId: candidate.id,
        candidateName: candidate.name,
        role: candidate.role,
      },
    };
    notifyListeners();
  },

  setAIAnalysis(
    candidate: CandidateProfile,
    aiAnalysis: AIAnalysisResult | null,
    riskAssessment?: RiskAssessment | null,
    humanReview?: HumanReviewState
  ) {
    const calculatedRisk =
      riskAssessment !== undefined
        ? riskAssessment
        : aiAnalysis
        ? evaluateRiskAssessment({
            geminiAnalysis: aiAnalysis,
            interviewMetadata: {
              candidateId: candidate.id,
              candidateName: candidate.name,
              role: candidate.role,
            },
            humanReview: humanReview || activeSession.review,
          })
        : null;

    activeSession = {
      ...activeSession,
      candidate,
      aiAnalysis,
      riskAssessment: calculatedRisk,
      review: humanReview || activeSession.review,
      session: {
        ...activeSession.session,
        sessionId: candidate.id,
        candidateName: candidate.name,
        role: candidate.role,
        aiAnalysisCompleted: Boolean(aiAnalysis),
      },
    };

    // If an existing completed session matches this candidate ID, update its AI analysis too
    completedSessions = completedSessions.map((item) => {
      if (item.candidate.id === candidate.id) {
        return {
          ...item,
          candidate,
          aiAnalysis,
          riskAssessment: calculatedRisk || item.riskAssessment,
          session: {
            ...item.session,
            aiAnalysisCompleted: Boolean(aiAnalysis),
          },
        };
      }
      return item;
    });

    notifyListeners();
  },

  completeInterviewSession(details: {
    duration: string;
    elapsedSeconds: number;
    startTime?: string | null;
    endTime?: string | null;
    timeline: SessionTimelineEvent[];
    visionSignals: VisionSignals | null;
    cvConnected: boolean;
    cameraActive: boolean;
    questionsCompleted?: number;
    evaluatorNotes?: string;
    evaluatorStatus?: 'unreviewed' | 'flagged' | 'verified';
  }): InterviewReportData {
    const finalEndTime = details.endTime || new Date().toTimeString().split(' ')[0];
    const finalStartTime = details.startTime || activeSession.session.startTime || '10:42:18';

    const mappedReviewStatus: HumanReviewState['status'] =
      details.evaluatorStatus === 'verified'
        ? 'reviewed'
        : details.evaluatorStatus === 'flagged'
        ? 'additional_verification_requested'
        : activeSession.review.status;

    // Calculate real deterministic risk with camera signals
    let riskAssessment = activeSession.riskAssessment;
    if (activeSession.aiAnalysis) {
      riskAssessment = evaluateRiskAssessment({
        geminiAnalysis: activeSession.aiAnalysis,
        cameraSignals: details.visionSignals
          ? [
              { type: 'multiple_persons', value: details.visionSignals.multiplePersonDetected },
              { type: 'camera_inconsistency', value: false },
            ]
          : undefined,
        interviewMetadata: {
          candidateId: activeSession.candidate.id,
          candidateName: activeSession.candidate.name,
          role: activeSession.candidate.role,
          durationSeconds: details.elapsedSeconds,
        },
        humanReview: {
          status: mappedReviewStatus,
          reviewerNotes: details.evaluatorNotes || activeSession.review.reviewerNotes,
        },
      });
    }

    const completedReport: InterviewReportData = {
      hasCompletedSession: true,
      candidate: activeSession.candidate,
      session: {
        ...activeSession.session,
        startTime: finalStartTime,
        endTime: finalEndTime,
        duration: details.duration,
        elapsedSeconds: details.elapsedSeconds,
        status: 'Completed',
        cameraAvailable: true,
        cameraActive: details.cameraActive,
        cvConnected: details.cvConnected,
        questionsCompleted: details.questionsCompleted ?? 3,
      },
      visionSignals: details.visionSignals,
      cvConnected: details.cvConnected,
      timeline: details.timeline,
      aiAnalysis: activeSession.aiAnalysis,
      riskAssessment,
      review: {
        ...activeSession.review,
        status: mappedReviewStatus,
        reviewerNotes: details.evaluatorNotes || activeSession.review.reviewerNotes,
        updatedAt: new Date().toISOString(),
      },
      checklist: activeSession.checklist,
      generatedAt: new Date().toISOString(),
    };

    // Replace or prepend into completedSessions
    const existingIdx = completedSessions.findIndex(
      (s) => s.session.sessionId === completedReport.session.sessionId
    );
    if (existingIdx >= 0) {
      completedSessions[existingIdx] = completedReport;
    } else {
      completedSessions = [completedReport, ...completedSessions];
    }

    selectedSessionId = completedReport.session.sessionId;
    activeSession = completedReport;

    notifyListeners();
    return completedReport;
  },

  updateChecklist(checklist: Partial<ReviewerChecklist>) {
    const selected = sessionStore.getSelectedSession();
    const currentTargetId = selected?.session.sessionId || activeSession.session.sessionId;

    activeSession = {
      ...activeSession,
      checklist: { ...activeSession.checklist, ...checklist },
    };

    completedSessions = completedSessions.map((s) => {
      if (s.session.sessionId === currentTargetId) {
        return {
          ...s,
          checklist: { ...s.checklist, ...checklist },
        };
      }
      return s;
    });

    notifyListeners();
  },

  updateReview(review: Partial<HumanReviewState>) {
    const selected = sessionStore.getSelectedSession();
    const currentTargetId = selected?.session.sessionId || activeSession.session.sessionId;

    const updatedReview: HumanReviewState = {
      ...(selected?.review || activeSession.review),
      ...review,
      updatedAt: new Date().toISOString(),
    };

    activeSession = {
      ...activeSession,
      review: updatedReview,
    };

    completedSessions = completedSessions.map((s) => {
      if (s.session.sessionId === currentTargetId) {
        // Recalculate deterministic risk with new review state
        const updatedRisk = s.aiAnalysis
          ? evaluateRiskAssessment({
              geminiAnalysis: s.aiAnalysis,
              cameraSignals: s.visionSignals
                ? [
                    { type: 'multiple_persons', value: s.visionSignals.multiplePersonDetected },
                    { type: 'camera_inconsistency', value: false },
                  ]
                : undefined,
              interviewMetadata: {
                candidateId: s.candidate.id,
                candidateName: s.candidate.name,
                role: s.candidate.role,
                durationSeconds: s.session.elapsedSeconds,
              },
              humanReview: updatedReview,
            })
          : s.riskAssessment;

        return {
          ...s,
          review: updatedReview,
          riskAssessment: updatedRisk,
        };
      }
      return s;
    });

    notifyListeners();
  },

  deleteCompletedSession(sessionId: string) {
    completedSessions = completedSessions.filter((s) => s.session.sessionId !== sessionId);
    if (selectedSessionId === sessionId) {
      selectedSessionId = completedSessions.length > 0 ? completedSessions[0].session.sessionId : null;
    }
    notifyListeners();
  },

  clearAllSessions() {
    completedSessions = [];
    selectedSessionId = null;
    activeSession = createInitialReportData();
    notifyListeners();
  },

  getRealDashboardMetrics() {
    const total = completedSessions.length;
    let lowRisk = 0;
    let reviewRequired = 0;
    let highRisk = 0;

    completedSessions.forEach((s) => {
      if (s.riskAssessment?.level === 'low') {
        lowRisk++;
      } else if (s.riskAssessment?.level === 'medium') {
        reviewRequired++;
      } else if (s.riskAssessment?.level === 'high') {
        highRisk++;
      }
    });

    return {
      total,
      lowRisk,
      reviewRequired,
      highRisk,
      sessions: completedSessions,
    };
  },
};

/**
 * Hook to subscribe to report data for the selected session
 */
export function useSessionReport(): [
  InterviewReportData,
  {
    updateChecklist: (checklist: Partial<ReviewerChecklist>) => void;
    updateReview: (review: Partial<HumanReviewState>) => void;
    selectSession: (sessionId: string) => void;
    completedSessions: InterviewReportData[];
  }
] {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => {
      setTick((t) => t + 1);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const data = sessionStore.getSelectedSession() || sessionStore.getActiveSession();

  const updateChecklist = useCallback((checklist: Partial<ReviewerChecklist>) => {
    sessionStore.updateChecklist(checklist);
  }, []);

  const updateReview = useCallback((review: Partial<HumanReviewState>) => {
    sessionStore.updateReview(review);
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    sessionStore.selectSession(sessionId);
  }, []);

  return [
    data,
    {
      updateChecklist,
      updateReview,
      selectSession,
      completedSessions: sessionStore.getCompletedSessions(),
    },
  ];
}

/**
 * Hook to subscribe to completed sessions list
 */
export function useCompletedSessions() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => {
      setTick((t) => t + 1);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    completedSessions: sessionStore.getCompletedSessions(),
    selectedSession: sessionStore.getSelectedSession(),
    selectedSessionId: sessionStore.getSelectedSessionId(),
    selectSession: (id: string) => sessionStore.selectSession(id),
    deleteSession: (id: string) => sessionStore.deleteCompletedSession(id),
    metrics: sessionStore.getRealDashboardMetrics(),
  };
}
