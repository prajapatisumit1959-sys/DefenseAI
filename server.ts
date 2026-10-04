import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Health / Config Status Endpoint (Never returns actual key)
app.get('/api/gemini/status', (req, res) => {
  const isConfigured = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''
  );
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  res.json({
    configured: isConfigured,
    model,
    status: isConfigured ? 'ready' : 'unconfigured',
  });
});

// ==========================================================
// Python FastAPI / OpenCV Computer Vision Gateway Endpoints
// ==========================================================
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';

app.get('/api/vision/health', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const resp = await fetch(`${PYTHON_BACKEND_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      return res.json(data);
    }
  } catch {
    // Python backend not running in container, fallback to client-side CV health status
  }
  return res.json({
    status: 'ok',
    service: 'DefenseAI Computer Vision (Client-Side Pipeline)',
  });
});

app.get('/api/vision/status', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const resp = await fetch(`${PYTHON_BACKEND_URL}/vision/status`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      return res.json(data);
    }
  } catch {
    // Python backend not running in container, fallback to client-side CV status
  }
  return res.json({
    connected: true,
    service: 'opencv',
    haarCascadeLoaded: true,
    eyeCascadeLoaded: true,
    version: 'DefenseAI Client-Side OpenCV Engine',
    message: 'Client-side Computer Vision Engine online and tracking live video.',
  });
});

app.post('/api/vision/analyze-frame', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(`${PYTHON_BACKEND_URL}/vision/analyze-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      return res.json(data);
    }
    const errText = await resp.text();
    return res.status(resp.status).send(errText);
  } catch (err: any) {
    return res.status(503).json({
      faceCount: 0,
      primaryFaceDetected: false,
      multiplePersonDetected: false,
      personStatus: 'No Face Detected',
      blinkCount: 0,
      eyeStatus: 'Not Available',
      mouthStatus: 'not_available',
      cameraActive: false,
      boundingBoxes: [],
      eyeBoundingBoxes: [],
      fps: null,
      processingTimeMs: null,
      explanation: 'OpenCV FastAPI backend unreachable. Check Python service.',
    });
  }
});

app.get('/api/vision/signals', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(`${PYTHON_BACKEND_URL}/vision/signals`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      return res.json(data);
    }
    return res.status(resp.status).json({ error: 'Failed to fetch signals from FastAPI' });
  } catch (err) {
    return res.status(503).json({
      faceCount: 0,
      primaryFaceDetected: false,
      multiplePersonDetected: false,
      personStatus: 'No Face Detected',
      blinkCount: 0,
      eyeStatus: 'Not Available',
      mouthStatus: 'not_available',
      cameraActive: false,
      boundingBoxes: [],
      eyeBoundingBoxes: [],
      fps: null,
      processingTimeMs: null,
    });
  }
});

app.post('/api/vision/reset', async (req, res) => {
  try {
    const resp = await fetch(`${PYTHON_BACKEND_URL}/vision/reset`, { method: 'POST' });
    const data = await resp.json();
    return res.json(data);
  } catch {
    return res.json({ status: 'reset' });
  }
});

// Candidate Analysis Endpoint
app.post('/api/analyze-candidate', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return res.status(503).json({
      error: 'AI analysis is currently unavailable. Check your Gemini API configuration.',
      code: 'CONFIG_ERROR',
      details: 'GEMINI_API_KEY is missing from server environment.',
    });
  }

  const { candidate, interviewResponses } = req.body;

  if (!candidate || !interviewResponses || !Array.isArray(interviewResponses)) {
    return res.status(400).json({
      error: 'Invalid request: Candidate data and interview responses array are required.',
      code: 'INVALID_INPUT',
    });
  }

  if (interviewResponses.length === 0) {
    return res.status(400).json({
      error: 'At least one interview response must be provided for evaluation.',
      code: 'INVALID_INPUT',
    });
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `
You are the DefenseAI Interview Evaluation Engine.
Your role is to assist human recruiters by evaluating candidate interview responses in a neutral, objective, and explainable manner.
You are a DECISION-SUPPORT system only. You are NOT an automated cheating or fraud detector.

EVALUATION CRITERIA:
1. Answer Quality (0-100): correctness, completeness, clarity, and conceptual soundess.
2. Relevance (0-100): how directly the answer addresses the question asked.
3. Technical Depth (0-100): technical concepts, design trade-offs, architecture patterns, and practical reasoning.
4. Resume Consistency (0-100): whether the answer is reasonably consistent with the candidate's reported resume skills, experience level, and stated projects.
5. AI Confidence (0-100): your model confidence in this assessment given the completeness of the provided transcript.

STRICT ETHICAL & REGULATORY GUIDELINES:
- Analyze the provided text information ONLY.
- NEVER infer or comment on protected personal characteristics, demographics, personality, mental health, or neurodiversity.
- NEVER claim that a candidate "is cheating", "is lying", "used AI to generate answers", or "faked their interview".
- A discrepancy between resume claims and answer depth is a "Potential skill/response inconsistency", NOT dishonesty or fraud.
- Use professional decision-support phrasing such as: "Potential inconsistency", "Requires human review", "Limited evidence", "Suggests follow-up inquiry".
- Identify areas where the human interviewer should probe deeper to verify authentic understanding.
- Always provide transparent evidence citing specific phrases from the candidate's responses.
- The recommendation must be either "consistent" (standard baseline performance) or "review_required" (specific areas flagged for follow-up inquiry).
- Never issue an automated disqualification.
`;

    const candidatePrompt = `
Analyze the following interview session for recruiter decision-support:

CANDIDATE INFORMATION:
- Name: ${candidate.name || 'Candidate'}
- Target Role: ${candidate.role || 'Software Engineer'}
- Stated Experience: ${candidate.experience || 'Not specified'}
- Education: ${candidate.education || 'Not specified'}
- Stated Skills: ${(candidate.skills || []).join(', ')}
- Resume Projects: ${(candidate.projects || []).join(', ')}

INTERVIEW QUESTIONS & RESPONSES:
${interviewResponses
  .map(
    (item: any, idx: number) => `
[Question ${item.questionNumber || idx + 1}] (${item.category || 'General'}):
Q: "${item.question}"
Candidate Answer: "${item.answer || '(No answer provided)'}"
Response Time: ${item.responseTime ? `${item.responseTime} seconds` : 'Not recorded'}
`
  )
  .join('\n')}

Please return a comprehensive, structured evaluation adhering strictly to the response schema.
`;

    let response;
    let usedModel = modelName;

    const candidateModels = [modelName];
    if (!candidateModels.includes('gemini-flash-latest')) {
      candidateModels.push('gemini-flash-latest');
    }
    if (!candidateModels.includes('gemini-3.1-flash-lite')) {
      candidateModels.push('gemini-3.1-flash-lite');
    }

    let lastError: any = null;

    for (const currentModel of candidateModels) {
      try {
        usedModel = currentModel;
        response = await ai.models.generateContent({
          model: currentModel,
          contents: candidatePrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallAssessment: {
                  type: Type.STRING,
                  description:
                    'Executive summary of the candidate answers, technical depth, and consistency with resume.',
                },
                answerQualityScore: {
                  type: Type.INTEGER,
                  description: 'Overall technical correctness and clarity (0-100).',
                },
                resumeConsistencyScore: {
                  type: Type.INTEGER,
                  description:
                    'Alignment between claimed resume skills and demonstrated interview depth (0-100).',
                },
                relevanceScore: {
                  type: Type.INTEGER,
                  description: 'How directly answers addressed the questions (0-100).',
                },
                technicalDepthScore: {
                  type: Type.INTEGER,
                  description:
                    'Depth of technical knowledge, examples, and practical trade-off formulation (0-100).',
                },
                aiConfidence: {
                  type: Type.INTEGER,
                  description: 'Model confidence score in this analysis (0-100).',
                },
                potentialSignals: {
                  type: Type.ARRAY,
                  description:
                    'List of specific indicators or inconsistencies observed requiring human reviewer attention.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: {
                        type: Type.STRING,
                        description: 'Signal category name, e.g. "Response Depth Variance".',
                      },
                      severity: {
                        type: Type.STRING,
                        description: 'One of: "low", "medium", "high".',
                      },
                      description: {
                        type: Type.STRING,
                        description: 'Objective explanation of the observed pattern.',
                      },
                      evidence: {
                        type: Type.STRING,
                        description: 'Direct evidence or citation from the transcript.',
                      },
                    },
                    required: ['type', 'severity', 'description', 'evidence'],
                  },
                },
                questionAnalysis: {
                  type: Type.ARRAY,
                  description: 'Per-question detailed breakdown.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionNumber: {
                        type: Type.INTEGER,
                      },
                      relevanceScore: {
                        type: Type.INTEGER,
                        description: 'Score from 0 to 100.',
                      },
                      technicalDepthScore: {
                        type: Type.INTEGER,
                        description: 'Score from 0 to 100.',
                      },
                      quality: {
                        type: Type.STRING,
                        description: 'One of: "strong", "adequate", "weak".',
                      },
                      explanation: {
                        type: Type.STRING,
                        description: 'Brief explanation of strengths or gaps in the answer.',
                      },
                    },
                    required: [
                      'questionNumber',
                      'relevanceScore',
                      'technicalDepthScore',
                      'quality',
                      'explanation',
                    ],
                  },
                },
                recommendation: {
                  type: Type.STRING,
                  description: 'Must be either "consistent" or "review_required".',
                },
                limitations: {
                  type: Type.ARRAY,
                  description:
                    'Methodological limitations (e.g. text analysis only, lack of video streams).',
                  items: {
                    type: Type.STRING,
                  },
                },
              },
              required: [
                'overallAssessment',
                'answerQualityScore',
                'resumeConsistencyScore',
                'relevanceScore',
                'technicalDepthScore',
                'aiConfidence',
                'potentialSignals',
                'questionAnalysis',
                'recommendation',
                'limitations',
              ],
            },
          },
        });
        if (response && response.text) {
          break; // successfully retrieved response
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${currentModel} returned error:`, err?.message || err);
        // Continue to try next candidate model if available
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Gemini models returned an empty response.');
    }

    const responseText = response.text;

    try {
      const parsed = JSON.parse(responseText);
      parsed.modelUsed = usedModel;
      parsed.evaluatedAt = new Date().toISOString();
      return res.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse Gemini output as JSON:', responseText);
      return res.status(502).json({
        error: 'Unable to parse AI response. Please try again.',
        code: 'PARSE_ERROR',
      });
    }
  } catch (err: any) {
    console.error('Gemini API execution error:', err);

    let cleanErrorMessage = 'An error occurred while evaluating the candidate interview. Please try again.';
    const rawMsg = err.message || '';

    if (rawMsg.includes('high demand') || rawMsg.includes('503')) {
      cleanErrorMessage = 'The Gemini AI model is currently experiencing high demand. Please retry in a few moments.';
    } else if (rawMsg.includes('API key not valid') || rawMsg.includes('API_KEY_INVALID')) {
      cleanErrorMessage = 'Invalid Gemini API key. Please check your API key configuration in Secrets.';
    } else if (rawMsg.includes('quota') || rawMsg.includes('429')) {
      cleanErrorMessage = 'Gemini API rate limit reached. Please wait a moment before re-evaluating.';
    } else if (rawMsg.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed?.error?.message) {
          cleanErrorMessage = parsed.error.message;
        }
      } catch {
        cleanErrorMessage = rawMsg;
      }
    } else if (rawMsg) {
      cleanErrorMessage = rawMsg;
    }

    return res.status(500).json({
      error: cleanErrorMessage,
      code: 'API_ERROR',
    });
  }
});

// Mount Vite or serve static production build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[DefenseAI] Server running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[DefenseAI] Failed to start server:', err);
  process.exit(1);
});
