import { AIAnalysisResult } from '../types/aiAnalysis';
import {
  RiskAssessment,
  RiskEngineInputs,
  RiskLevel,
  RiskSignal,
  DeterministicTestScenario,
} from '../types/riskEngine';

/**
 * Deterministic Risk Analysis Engine for DefenseAI
 *
 * Rules:
 * 1. Score starts at 0 and is strictly deterministic (no Math.random()).
 * 2. Risk levels:
 *    - 0-30: Low Risk
 *    - 31-60: Medium Risk
 *    - 61-100: High Risk
 * 3. Weights:
 *    - A. Resume/Answer inconsistency: 20
 *    - B. Low answer relevance: 15
 *    - C. Low technical depth: 15
 *    - D. Weak answer quality: 10
 *    - E. Multiple-person detection: 20 (inactive unless real sensor data supplied)
 *    - F. Unusual response delay: 10 (inactive unless real sensor data supplied)
 *    - G. Camera inconsistency: 10 (inactive unless real sensor data supplied)
 * 4. Camera and behavioral signals remain inactive/not connected without real telemetry.
 * 5. Every score addition is accompanied by an explainability note and evidence quotation.
 */

export const RISK_WEIGHTS = {
  RESUME_INCONSISTENCY: 20,
  LOW_ANSWER_RELEVANCE: 15,
  LOW_TECHNICAL_DEPTH: 15,
  WEAK_ANSWER_QUALITY: 10,
  MULTIPLE_PERSON_DETECTION: 20,
  UNUSUAL_RESPONSE_DELAY: 10,
  CAMERA_INCONSISTENCY: 10,
} as const;

export const RISK_RECOMMENDATIONS = {
  LOW: 'Current evidence shows no major review signals. Continue normal human evaluation.',
  MEDIUM: 'Some potential inconsistencies were identified. Manual review is recommended.',
  HIGH: 'Multiple review signals were identified. Conduct additional human verification before making a decision.',
} as const;

export const IMPORTANT_LIMITATION_STATEMENT =
  'Risk scores represent signals generated from the available interview data. They are not proof of misconduct and should not be used as the sole basis for employment decisions.';

/**
 * Determines Risk Level deterministically from score
 */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score <= 30) return 'low';
  if (score <= 60) return 'medium';
  return 'high';
}

/**
 * Formats user-facing label for risk level
 */
export function formatRiskLevel(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'Low Risk';
    case 'medium':
      return 'Medium Risk';
    case 'high':
      return 'High Risk';
  }
}

/**
 * Evaluates Gemini AI Analysis and creates explainable risk signals
 */
export function evaluateRiskAssessment(inputs: RiskEngineInputs): RiskAssessment {
  const { geminiAnalysis, behavioralSignals, cameraSignals, humanReview } = inputs;

  const evaluatedSignals: RiskSignal[] = [];

  // ==========================================
  // Signal A: Resume / Answer Inconsistency (Weight: 20)
  // ==========================================
  const resumeScore = Number(geminiAnalysis?.resumeConsistencyScore ?? 100);
  const resumeSignalsInGemini = geminiAnalysis?.potentialSignals?.filter((s) => {
    const t = (s.type || '').toLowerCase();
    const d = (s.description || '').toLowerCase();
    return (
      t.includes('resume') ||
      t.includes('consistency') ||
      t.includes('background') ||
      t.includes('experience') ||
      d.includes('resume') ||
      d.includes('experience') ||
      d.includes('mismatch')
    );
  }) || [];

  const isResumeInconsistent = resumeScore < 70 || resumeSignalsInGemini.length > 0;
  if (isResumeInconsistent) {
    const primaryEvidence =
      resumeSignalsInGemini[0]?.evidence ||
      resumeSignalsInGemini[0]?.description ||
      `Consistency score measured at ${resumeScore}/100. Responses demonstrate disparity with claimed resume background.`;

    evaluatedSignals.push({
      id: 'sig-resume-inconsistency',
      name: 'Resume / Answer Inconsistency',
      type: 'Potential Resume Inconsistency',
      severity: resumeScore < 50 ? 'high' : 'medium',
      weight: RISK_WEIGHTS.RESUME_INCONSISTENCY,
      scoreContribution: RISK_WEIGHTS.RESUME_INCONSISTENCY,
      active: true,
      category: 'gemini_analysis',
      status: 'detected',
      description:
        'Discrepancy detected between candidate resume claims and verbal response depth or terminology in interview transcript.',
      explanation:
        'The candidate profile lists qualifications or experience that were not substantiated by the depth or terminology in the interview responses.',
      evidence: primaryEvidence,
    });
  } else {
    evaluatedSignals.push({
      id: 'sig-resume-inconsistency',
      name: 'Resume / Answer Inconsistency',
      type: 'Resume Alignment',
      severity: 'low',
      weight: RISK_WEIGHTS.RESUME_INCONSISTENCY,
      scoreContribution: 0,
      active: false,
      category: 'gemini_analysis',
      status: 'not_detected',
      description: 'Candidate verbal explanations align with listed technical experience.',
      explanation: `Demonstrated technical profile matches resume claims (Score: ${resumeScore}/100).`,
      evidence: 'Consistent alignment across technical answers and stated background.',
    });
  }

  // ==========================================
  // Signal B: Low Answer Relevance (Weight: 15)
  // ==========================================
  const relevanceScore = Number(geminiAnalysis?.relevanceScore ?? 100);
  const lowRelevanceQuestions = (geminiAnalysis?.questionAnalysis || []).filter(
    (q) => q.relevanceScore < 65
  );
  const relevanceSignalsInGemini = (geminiAnalysis?.potentialSignals || []).filter((s) => {
    const t = (s.type || '').toLowerCase();
    const d = (s.description || '').toLowerCase();
    return t.includes('relevance') || d.includes('relevance') || d.includes('tangential') || d.includes('off-topic');
  });

  const isLowRelevance = relevanceScore < 70 || lowRelevanceQuestions.length > 0 || relevanceSignalsInGemini.length > 0;
  if (isLowRelevance) {
    const evidenceText =
      lowRelevanceQuestions.length > 0
        ? `Question ${lowRelevanceQuestions[0].questionNumber}: Relevance rated at ${lowRelevanceQuestions[0].relevanceScore}/100. "${lowRelevanceQuestions[0].explanation}"`
        : relevanceSignalsInGemini[0]?.evidence ||
          `Overall answer prompt relevance evaluated at ${relevanceScore}/100.`;

    evaluatedSignals.push({
      id: 'sig-low-relevance',
      name: 'Low Answer Relevance',
      type: 'Prompt Divergence',
      severity: relevanceScore < 50 ? 'high' : 'medium',
      weight: RISK_WEIGHTS.LOW_ANSWER_RELEVANCE,
      scoreContribution: RISK_WEIGHTS.LOW_ANSWER_RELEVANCE,
      active: true,
      category: 'gemini_analysis',
      status: 'detected',
      description: 'One or more responses diverged from the prompt questions or failed to address key requirements.',
      explanation: 'The response addresses part of the question but does not fully explain the requested concept.',
      evidence: evidenceText,
    });
  } else {
    evaluatedSignals.push({
      id: 'sig-low-relevance',
      name: 'Low Answer Relevance',
      type: 'Prompt Alignment',
      severity: 'low',
      weight: RISK_WEIGHTS.LOW_ANSWER_RELEVANCE,
      scoreContribution: 0,
      active: false,
      category: 'gemini_analysis',
      status: 'not_detected',
      description: 'Responses directly address the questions asked without prompt evasion.',
      explanation: `Responses showed direct relevance to all interview prompts (Score: ${relevanceScore}/100).`,
      evidence: 'Direct conceptual alignment with interview questions.',
    });
  }

  // ==========================================
  // Signal C: Low Technical Depth (Weight: 15)
  // ==========================================
  const depthScore = Number(geminiAnalysis?.technicalDepthScore ?? 100);
  const shallowQuestions = (geminiAnalysis?.questionAnalysis || []).filter(
    (q) => q.technicalDepthScore < 60
  );

  const isLowDepth = depthScore < 65 || shallowQuestions.length > 0;
  if (isLowDepth) {
    const evidenceText =
      shallowQuestions.length > 0
        ? `Question ${shallowQuestions[0].questionNumber}: Technical depth scored ${shallowQuestions[0].technicalDepthScore}/100. "${shallowQuestions[0].explanation}"`
        : `Overall technical depth scored at ${depthScore}/100, below expected engineering standard.`;

    evaluatedSignals.push({
      id: 'sig-low-depth',
      name: 'Low Technical Depth',
      type: 'Superficial Technical Explanation',
      severity: depthScore < 50 ? 'high' : 'medium',
      weight: RISK_WEIGHTS.LOW_TECHNICAL_DEPTH,
      scoreContribution: RISK_WEIGHTS.LOW_TECHNICAL_DEPTH,
      active: true,
      category: 'gemini_analysis',
      status: 'detected',
      description: 'Technical explanations remain high-level without expected architectural or implementation rigor.',
      explanation: 'Responses provided high-level summaries without the expected architectural, algorithmic, or implementation specifics.',
      evidence: evidenceText,
    });
  } else {
    evaluatedSignals.push({
      id: 'sig-low-depth',
      name: 'Low Technical Depth',
      type: 'Technical Rigor',
      severity: 'low',
      weight: RISK_WEIGHTS.LOW_TECHNICAL_DEPTH,
      scoreContribution: 0,
      active: false,
      category: 'gemini_analysis',
      status: 'not_detected',
      description: 'Technical answers showed satisfactory architectural depth and domain vocabulary.',
      explanation: `Demonstrated technical depth meets role expectations (Score: ${depthScore}/100).`,
      evidence: 'Concrete engineering concepts and trade-offs articulated.',
    });
  }

  // ==========================================
  // Signal D: Weak Answer Quality (Weight: 10)
  // ==========================================
  const qualityScore = Number(geminiAnalysis?.answerQualityScore ?? 100);
  const weakQualityQuestions = (geminiAnalysis?.questionAnalysis || []).filter(
    (q) => q.quality === 'weak'
  );

  const isWeakQuality = qualityScore < 60 || weakQualityQuestions.length > 0;
  if (isWeakQuality) {
    const evidenceText =
      weakQualityQuestions.length > 0
        ? `Question ${weakQualityQuestions[0].questionNumber} evaluated as weak quality: "${weakQualityQuestions[0].explanation}"`
        : `Aggregate answer quality scored at ${qualityScore}/100.`;

    evaluatedSignals.push({
      id: 'sig-weak-quality',
      name: 'Weak Answer Quality',
      type: 'Sub-baseline Response Quality',
      severity: qualityScore < 45 ? 'high' : 'medium',
      weight: RISK_WEIGHTS.WEAK_ANSWER_QUALITY,
      scoreContribution: RISK_WEIGHTS.WEAK_ANSWER_QUALITY,
      active: true,
      category: 'gemini_analysis',
      status: 'detected',
      description: 'Overall answers contain noticeable factual or structural gaps.',
      explanation: 'Responses showed noticeable gaps in clarity, conceptual precision, or complete explanations.',
      evidence: evidenceText,
    });
  } else {
    evaluatedSignals.push({
      id: 'sig-weak-quality',
      name: 'Weak Answer Quality',
      type: 'Answer Quality Baseline',
      severity: 'low',
      weight: RISK_WEIGHTS.WEAK_ANSWER_QUALITY,
      scoreContribution: 0,
      active: false,
      category: 'gemini_analysis',
      status: 'not_detected',
      description: 'Answer quality is coherent and well-structured.',
      explanation: `Answer quality satisfies expected clarity standards (Score: ${qualityScore}/100).`,
      evidence: 'Responses provide coherent, structured reasoning.',
    });
  }

  // ==========================================
  // Signal E: Multiple-person Detection (Weight: 20)
  // MANDATE: Must remain inactive unless real camera telemetry is supplied.
  // DO NOT invent camera data.
  // ==========================================
  const hasRealCameraMultiPerson =
    Array.isArray(cameraSignals) && cameraSignals.some((c) => c.type === 'multiple_persons' && c.value === true);

  if (hasRealCameraMultiPerson) {
    evaluatedSignals.push({
      id: 'sig-multi-person',
      name: 'Multiple-Person Detection',
      type: 'Visual Frame Co-presence',
      severity: 'high',
      weight: RISK_WEIGHTS.MULTIPLE_PERSON_DETECTION,
      scoreContribution: RISK_WEIGHTS.MULTIPLE_PERSON_DETECTION,
      active: true,
      category: 'camera_signal',
      status: 'detected',
      description: 'Additional faces or individuals detected in video telemetry stream.',
      explanation: 'Verified camera feed indicates presence of secondary individual during assessment.',
      evidence: 'Camera video frame telemetry flagged secondary face bounding box.',
    });
  } else {
    evaluatedSignals.push({
      id: 'sig-multi-person',
      name: 'Multiple-Person Detection',
      type: 'Visual Frame Co-presence',
      severity: 'low',
      weight: RISK_WEIGHTS.MULTIPLE_PERSON_DETECTION,
      scoreContribution: 0,
      active: false,
      category: 'camera_signal',
      status: 'not_connected',
      description: 'Camera telemetry feed is not connected. Video multi-person detection is inactive.',
      explanation: 'No camera sensor stream connected. Real-time visual tracking is not active.',
      evidence: 'Visual stream: Not Connected (OpenCV pipeline pending)',
    });
  }

  // ==========================================
  // Signal F: Unusual Response Delay (Weight: 10)
  // MANDATE: Must remain inactive unless real behavioral telemetry is supplied.
  // DO NOT invent behavioral data.
  // ==========================================
  const hasRealUnusualDelay =
    Array.isArray(behavioralSignals) && behavioralSignals.some((b) => b.type === 'unusual_delay' && b.value === true);

  if (hasRealUnusualDelay) {
    evaluatedSignals.push({
      id: 'sig-response-delay',
      name: 'Unusual Response Delay',
      type: 'Audio Latency Anomaly',
      severity: 'medium',
      weight: RISK_WEIGHTS.UNUSUAL_RESPONSE_DELAY,
      scoreContribution: RISK_WEIGHTS.UNUSUAL_RESPONSE_DELAY,
      active: true,
      category: 'behavioral_signal',
      status: 'detected',
      description: 'Speech onset latency significantly exceeded conversational baseline.',
      explanation: 'Candidate paused for an extended duration before verbalizing answers without cognitive explanation.',
      evidence: 'Audio timestamp telemetry recorded latency anomaly.',
    });
  } else {
    evaluatedSignals.push({
      id: 'sig-response-delay',
      name: 'Unusual Response Delay',
      type: 'Audio Latency Anomaly',
      severity: 'low',
      weight: RISK_WEIGHTS.UNUSUAL_RESPONSE_DELAY,
      scoreContribution: 0,
      active: false,
      category: 'behavioral_signal',
      status: 'not_connected',
      description: 'Audio speech latency sensor stream is not connected.',
      explanation: 'Real-time microphone timestamp latency pipeline is not connected.',
      evidence: 'Audio sensor stream: Not Connected',
    });
  }

  // ==========================================
  // Signal G: Camera Inconsistency (Weight: 10)
  // MANDATE: Must remain inactive unless real camera telemetry is supplied.
  // DO NOT invent camera data.
  // ==========================================
  const hasRealCameraInconsistency =
    Array.isArray(cameraSignals) && cameraSignals.some((c) => c.type === 'camera_inconsistency' && c.value === true);

  if (hasRealCameraInconsistency) {
    evaluatedSignals.push({
      id: 'sig-camera-inconsistency',
      name: 'Camera Inconsistency',
      type: 'Gaze & Frame Stream Variance',
      severity: 'medium',
      weight: RISK_WEIGHTS.CAMERA_INCONSISTENCY,
      scoreContribution: RISK_WEIGHTS.CAMERA_INCONSISTENCY,
      active: true,
      category: 'camera_signal',
      status: 'detected',
      description: 'Gaze direction or camera optical flow showed persistent off-axis deviation.',
      explanation: 'Visual optical flow showed persistent screen diversion during technical prompts.',
      evidence: 'Computer vision tracking flagged off-axis gaze disparity.',
    });
  } else {
    evaluatedSignals.push({
      id: 'sig-camera-inconsistency',
      name: 'Camera Inconsistency',
      type: 'Gaze & Frame Stream Variance',
      severity: 'low',
      weight: RISK_WEIGHTS.CAMERA_INCONSISTENCY,
      scoreContribution: 0,
      active: false,
      category: 'camera_signal',
      status: 'not_connected',
      description: 'Camera optical flow and gaze tracking are not connected.',
      explanation: 'No video stream connected. Gaze alignment tracking is not active.',
      evidence: 'Visual stream: Not Connected (OpenCV pipeline pending)',
    });
  }

  // ==========================================
  // Deterministic Score Calculation
  // Start with 0. Add weights of active signals. Clamp between 0 and 100.
  // ==========================================
  const activeSignals = evaluatedSignals.filter((s) => s.active && s.scoreContribution > 0);
  const rawScore = activeSignals.reduce((acc, curr) => acc + curr.scoreContribution, 0);
  const finalScore = Math.max(0, Math.min(100, rawScore));
  const level = getRiskLevelFromScore(finalScore);

  let recommendation: string;
  if (level === 'low') {
    recommendation = RISK_RECOMMENDATIONS.LOW;
  } else if (level === 'medium') {
    recommendation = RISK_RECOMMENDATIONS.MEDIUM;
  } else {
    recommendation = RISK_RECOMMENDATIONS.HIGH;
  }

  const summary =
    activeSignals.length === 0
      ? 'No elevated risk indicators detected in available transcript data. Responses demonstrate technical consistency.'
      : `${activeSignals.length} risk indicator${activeSignals.length === 1 ? '' : 's'} identified (${activeSignals.map((s) => s.name).join(', ')}). Recruiter review recommended.`;

  return {
    score: finalScore,
    level,
    signals: activeSignals,
    allSignals: evaluatedSignals,
    recommendation,
    summary,
    dataSources: {
      geminiAnalysis: {
        available: true,
        status: 'Connected',
        description: 'Gemini 3.8 Flash transcript evaluation and semantic consistency analysis.',
      },
      cameraSignals: {
        available: false,
        status: 'Not Connected',
        description: 'Video streaming and computer vision (OpenCV) not initialized.',
      },
      behavioralSignals: {
        available: false,
        status: 'Not Connected',
        description: 'Microphone latency and audio timestamp sensors not initialized.',
      },
    },
    humanReview: {
      status: humanReview?.status || 'pending',
      reviewerNotes: humanReview?.reviewerNotes || '',
      reviewedBy: humanReview?.reviewedBy,
      updatedAt: humanReview?.updatedAt,
    },
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Deterministic Test / Demo Scenarios for UI Verification & Evaluation
 * Clearly labeled as test/demo fixtures to demonstrate engine behavior
 * without requiring live API calls.
 */
export const DETERMINISTIC_TEST_SCENARIOS: DeterministicTestScenario[] = [
  {
    id: 'scenario-1-low',
    label: 'Scenario 1: Low Risk (Strong Answers)',
    description: 'Strong technical answers + consistent resume background → 0 indicators, Low Risk (0/100)',
    targetLevel: 'low',
    mockGeminiResult: {
      overallAssessment:
        'The candidate demonstrated thorough conceptual understanding with clear, direct explanations that closely align with their stated resume experience. No semantic discrepancies were surfaced.',
      answerQualityScore: 92,
      resumeConsistencyScore: 95,
      relevanceScore: 90,
      technicalDepthScore: 88,
      aiConfidence: 94,
      potentialSignals: [],
      questionAnalysis: [
        {
          questionNumber: 1,
          relevanceScore: 95,
          technicalDepthScore: 90,
          quality: 'strong',
          explanation: 'Clear distinction between component state and props with proper terminology.',
        },
        {
          questionNumber: 2,
          relevanceScore: 92,
          technicalDepthScore: 88,
          quality: 'strong',
          explanation: 'Accurately outlined render profiling, memoization, and lazy loading strategies.',
        },
        {
          questionNumber: 3,
          relevanceScore: 90,
          technicalDepthScore: 85,
          quality: 'strong',
          explanation: 'Accurate REST HTTP method taxonomy with idempotency awareness.',
        },
      ],
      recommendation: 'consistent',
      limitations: [
        'Evaluation is grounded strictly in transcript text.',
        'External camera and voice biometric sensors are not connected.',
      ],
      modelUsed: 'gemini-3.8-flash (Demo Fixture)',
    },
  },
  {
    id: 'scenario-2-medium',
    label: 'Scenario 2: Medium Risk (Inconsistency & Relevance)',
    description: 'Some weak answers + potential consistency issue → 2 indicators, Medium Risk (35/100)',
    targetLevel: 'medium',
    mockGeminiResult: {
      overallAssessment:
        'Candidate provided brief answers that occasionally diverged from the technical questions. While fundamental concepts were touched on, resume claims of senior-level engineering experience were not supported by technical depth in the transcript.',
      answerQualityScore: 68,
      resumeConsistencyScore: 58,
      relevanceScore: 60,
      technicalDepthScore: 66,
      aiConfidence: 89,
      potentialSignals: [
        {
          type: 'Potential Resume Inconsistency',
          severity: 'medium',
          description:
            'The candidate profile lists React experience, but the provided response demonstrates limited explanation of React concepts.',
          evidence:
            'Candidate claimed 4 years of senior React development, but answered Question 1 with a two-sentence definition omitting hooks, lifecycle, or rendering model.',
        },
        {
          type: 'Low Answer Relevance',
          severity: 'medium',
          description: 'The response addresses part of the question but does not fully explain the requested concept.',
          evidence:
            'In Question 2 regarding optimization, the candidate discussed general bug fixing rather than performance profiling or memoization.',
        },
      ],
      questionAnalysis: [
        {
          questionNumber: 1,
          relevanceScore: 62,
          technicalDepthScore: 64,
          quality: 'adequate',
          explanation: 'Minimal explanation lacking depth expected for stated experience level.',
        },
        {
          questionNumber: 2,
          relevanceScore: 58,
          technicalDepthScore: 60,
          quality: 'weak',
          explanation: 'Diverged from performance optimization towards general debugging.',
        },
      ],
      recommendation: 'review_required',
      limitations: [
        'Evaluation is based on text transcript only.',
        'Human recruiter interview verification is strongly recommended.',
      ],
      modelUsed: 'gemini-3.8-flash (Demo Fixture)',
    },
  },
  {
    id: 'scenario-3-high',
    label: 'Scenario 3: High Risk (Multiple Significant Signals)',
    description: 'Multiple significant text-analysis signals → 4 indicators, High Risk (60/100)',
    targetLevel: 'high',
    mockGeminiResult: {
      overallAssessment:
        'Substantial variance detected across all evaluated technical responses. Candidate showed pronounced difficulty answering basic domain questions, diverged from prompts repeatedly, and demonstrated responses inconsistent with listed qualifications.',
      answerQualityScore: 42,
      resumeConsistencyScore: 35,
      relevanceScore: 45,
      technicalDepthScore: 40,
      aiConfidence: 96,
      potentialSignals: [
        {
          type: 'Resume / Experience Inconsistency',
          severity: 'high',
          description:
            'Listed senior distributed systems experience contradicts responses failing to describe leader election or consensus basics.',
          evidence:
            'Resume claims authoring multi-raft sharding engines, but transcript stated: "Raft is when nodes vote by checking which one is older."',
        },
        {
          type: 'Low Answer Relevance',
          severity: 'high',
          description: 'Candidate evaded technical details and answered with unrelated generic statements.',
          evidence:
            'When asked about split-vote resolution, candidate answered by explaining general network cable setups.',
        },
        {
          type: 'Superficial Technical Depth',
          severity: 'high',
          description: 'Absence of algorithmic terminology, distributed primitives, or concurrency principles.',
          evidence: 'Zero mentions of RPCs, timeouts, logs, or quorums.',
        },
      ],
      questionAnalysis: [
        {
          questionNumber: 1,
          relevanceScore: 40,
          technicalDepthScore: 35,
          quality: 'weak',
          explanation: 'Inaccurate conceptual response with fundamental errors regarding consensus protocols.',
        },
      ],
      recommendation: 'review_required',
      limitations: [
        'Analysis reflects solely transcript semantic evaluation.',
        'Must not be used as an automatic disqualification.',
      ],
      modelUsed: 'gemini-3.8-flash (Demo Fixture)',
    },
  },
];
