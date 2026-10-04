import {
  AIAnalysisResult,
  CandidateAnalysisPayload,
  AnalysisErrorResponse,
} from '../types/aiAnalysis';

/**
 * Validates that an object conforms to the AIAnalysisResult schema.
 */
function validateAIAnalysisResult(data: any): AIAnalysisResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Malformed AI response: expected a JSON object.');
  }

  if (typeof data.overallAssessment !== 'string' || !data.overallAssessment.trim()) {
    throw new Error('Malformed AI response: missing or invalid overallAssessment.');
  }

  const clampScore = (val: any, defaultVal = 70): number => {
    const num = Number(val);
    if (isNaN(num)) return defaultVal;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  const answerQualityScore = clampScore(data.answerQualityScore, 75);
  const resumeConsistencyScore = clampScore(data.resumeConsistencyScore, 75);
  const relevanceScore = clampScore(data.relevanceScore, 80);
  const technicalDepthScore = clampScore(data.technicalDepthScore, 70);
  const aiConfidence = clampScore(data.aiConfidence, 85);

  const potentialSignals = Array.isArray(data.potentialSignals)
    ? data.potentialSignals.map((sig: any) => ({
        type: String(sig.type || 'Response Pattern'),
        severity: ['low', 'medium', 'high'].includes(String(sig.severity).toLowerCase())
          ? (String(sig.severity).toLowerCase() as 'low' | 'medium' | 'high')
          : 'low',
        description: String(sig.description || 'Observed answer pattern requiring review.'),
        evidence: String(sig.evidence || 'Reference from interview answer text.'),
      }))
    : [];

  const questionAnalysis = Array.isArray(data.questionAnalysis)
    ? data.questionAnalysis.map((qa: any, index: number) => ({
        questionNumber: Number(qa.questionNumber) || index + 1,
        relevanceScore: clampScore(qa.relevanceScore, 80),
        technicalDepthScore: clampScore(qa.technicalDepthScore, 75),
        quality: ['strong', 'adequate', 'weak'].includes(String(qa.quality).toLowerCase())
          ? (String(qa.quality).toLowerCase() as 'strong' | 'adequate' | 'weak')
          : 'adequate',
        explanation: String(qa.explanation || 'Evaluation completed based on response transcript.'),
      }))
    : [];

  const recommendation =
    String(data.recommendation).toLowerCase() === 'consistent'
      ? 'consistent'
      : 'review_required';

  const defaultLimitations = [
    'Analysis evaluates provided text transcripts and resume data only.',
    'Text-based analysis alone cannot definitively confirm unauthorized AI or external assistance.',
    'All signals are assistive indicators and must be validated through human technical inquiry.',
    'Camera, audio frequency, and ambient acoustic streams are not evaluated in this text pass.',
  ];

  const limitations = Array.isArray(data.limitations) && data.limitations.length > 0
    ? data.limitations.map(String)
    : defaultLimitations;

  return {
    overallAssessment: data.overallAssessment,
    answerQualityScore,
    resumeConsistencyScore,
    relevanceScore,
    technicalDepthScore,
    aiConfidence,
    potentialSignals,
    questionAnalysis,
    recommendation,
    limitations,
    evaluatedAt: data.evaluatedAt || new Date().toISOString(),
    modelUsed: data.modelUsed || 'gemini-3.8-flash',
  };
}

/**
 * Executes server-side candidate interview evaluation using the Gemini API proxy.
 * Never calls Gemini directly from the client.
 */
export async function analyzeCandidateInterview(
  payload: CandidateAnalysisPayload
): Promise<AIAnalysisResult> {
  // Client validation
  if (!payload.interviewResponses || payload.interviewResponses.length === 0) {
    throw new Error('Please provide at least one interview response before running AI analysis.');
  }

  const hasEmptyAnswers = payload.interviewResponses.every(
    (q) => !q.answer || q.answer.trim().length === 0
  );
  if (hasEmptyAnswers) {
    throw new Error('Interview answers cannot be completely empty. Please enter candidate responses to analyze.');
  }

  try {
    const response = await fetch('/api/analyze-candidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errData: AnalysisErrorResponse;
      try {
        errData = await response.json();
      } catch {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }

      if (response.status === 503) {
        throw new Error(
          errData.error || 'AI analysis is currently unavailable. Check your Gemini API configuration.'
        );
      }

      throw new Error(errData.error || `Analysis request failed with status ${response.status}`);
    }

    const rawData = await response.json();
    return validateAIAnalysisResult(rawData);
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the analysis server. Please ensure the backend is running.');
    }
    throw err;
  }
}

/**
 * Checks server Gemini configuration status without exposing keys.
 */
export async function checkGeminiStatus(): Promise<{
  configured: boolean;
  model: string;
  status: string;
}> {
  try {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) {
      return { configured: false, model: 'gemini-3.8-flash', status: 'unavailable' };
    }
    return await res.json();
  } catch {
    return { configured: false, model: 'gemini-3.8-flash', status: 'offline' };
  }
}
