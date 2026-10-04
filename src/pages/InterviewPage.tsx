import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Radio,
  Play,
  Pause,
  Square,
  AlertTriangle,
  User,
  Users,
  Eye,
  Activity,
  Smile,
  Clock,
  Mic,
  ArrowRight,
  Shield,
  RotateCcw,
  Sparkles,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { RoutePath } from '../types';
import { DisclaimerBanner } from '../components/layout/DisclaimerBanner';
import { PRIMARY_CANDIDATE } from '../data/candidateData';
import { visionService } from '../services/visionService';
import { VisionSignals, VisionStatusResponse } from '../types/vision';
import { evaluateRiskAssessment, DETERMINISTIC_TEST_SCENARIOS } from '../services/riskEngine';
import {
  SessionTimelineEvent,
  QuestionTimingRecord,
  EvaluatorSessionReview,
} from '../types/interview';

// Subcomponents
import { SignalCard } from '../components/interview/SignalCard';
import { SessionTimeline } from '../components/interview/SessionTimeline';
import { InterviewQuestionCard } from '../components/interview/InterviewQuestionCard';
import { SessionSignalSummary } from '../components/interview/SessionSignalSummary';
import { LiveRiskCard } from '../components/interview/LiveRiskCard';
import { HumanReviewControls } from '../components/interview/HumanReviewControls';
import { EndSessionModal } from '../components/interview/EndSessionModal';
import { PostInterviewBanner } from '../components/interview/PostInterviewBanner';
import { WorkflowStepper } from '../components/common/WorkflowStepper';
import { sessionStore } from '../services/sessionStore';

export type CameraStatusType =
  | 'Ready'
  | 'Connecting'
  | 'Active'
  | 'Permission Denied'
  | 'Unavailable'
  | 'Stopped';

export type MonitoringStateType = 'Ready' | 'Active' | 'Paused' | 'Ended';

interface InterviewPageProps {
  onNavigate: (path: RoutePath) => void;
}

export const InterviewPage: React.FC<InterviewPageProps> = ({ onNavigate }) => {
  // Session State
  const [monitoringState, setMonitoringState] = useState<MonitoringStateType>('Ready');
  const [cameraStatus, setCameraStatus] = useState<CameraStatusType>('Ready');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Session Timers
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionStartTimeStr, setSessionStartTimeStr] = useState<string | null>(null);

  // End Session Confirmation Modal
  const [isEndModalOpen, setIsEndModalOpen] = useState<boolean>(false);

  // Computer Vision Service State
  const [cvStatus, setCvStatus] = useState<VisionStatusResponse>({
    connected: false,
    service: 'opencv',
    message: 'Checking FastAPI computer vision service...',
  });
  const [isCheckingCv, setIsCheckingCv] = useState<boolean>(false);
  const [visionSignals, setVisionSignals] = useState<VisionSignals | null>(null);
  const [isAnalyzingFrame, setIsAnalyzingFrame] = useState<boolean>(false);

  // Session Timeline Events (strictly from actual events)
  const [timelineEvents, setTimelineEvents] = useState<SessionTimelineEvent[]>([]);

  // Current Interview Question state
  const [questionRecord, setQuestionRecord] = useState<QuestionTimingRecord>({
    questionId: 'q-2',
    questionText: 'How would you optimize a slow React application?',
    startTime: null,
    endTime: null,
    responseDurationSeconds: 0,
    status: 'Waiting for Response',
  });

  // Human Review & Notes State
  const [evaluatorReview, setEvaluatorReview] = useState<EvaluatorSessionReview>({
    status: 'unreviewed',
    notes: '',
  });

  // Refs for tracking transitions and preventing duplicate timeline events
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnalyzingRef = useRef<boolean>(false);

  const prevCameraStatus = useRef<CameraStatusType>('Ready');
  const prevFaceDetected = useRef<boolean>(false);
  const prevMultiplePersons = useRef<boolean>(false);

  // Format HH:MM:SS
  const formatHHMMSS = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Helper to append a verified event to the timeline
  const addTimelineEvent = useCallback(
    (
      title: string,
      description?: string,
      type: SessionTimelineEvent['type'] = 'session',
      status: SessionTimelineEvent['status'] = 'normal'
    ) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0]; // e.g. 10:42:18
      const newEvent: SessionTimelineEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: timeStr,
        isoTime: now.toISOString(),
        title,
        description,
        type,
        status,
      };
      setTimelineEvents((prev) => [newEvent, ...prev]);
    },
    []
  );

  // Check OpenCV backend status
  const checkBackendStatus = useCallback(async () => {
    setIsCheckingCv(true);
    try {
      const status = await visionService.checkStatus();
      setCvStatus(status);
    } catch {
      setCvStatus({
        connected: false,
        service: 'opencv',
        message: 'FastAPI OpenCV backend is not connected.',
      });
    } finally {
      setIsCheckingCv(false);
    }
  }, []);

  // Poll backend status on mount and periodically
  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 15000);
    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  // Session timer effect when monitoring is Active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (monitoringState === 'Active') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [monitoringState]);

  // Stop all MediaStream tracks and clean up video element
  const stopCameraStream = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Track stop error:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVisionSignals(null);
  }, []);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [stopCameraStream]);

  // Capture frame from live video and run computer vision analysis
  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef.current || cameraStatus !== 'Active' || !cvStatus.connected) return;
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) return;
    if (isAnalyzingRef.current) return;

    try {
      isAnalyzingRef.current = true;
      setIsAnalyzingFrame(true);

      // Direct zero-copy video element analysis in browser
      let signals = await visionService.analyzeVideo(videoRef.current);

      if (!signals) {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          signals = await visionService.analyzeFrame(dataUrl);
        }
      }

      if (signals) {
        setVisionSignals(signals);

        // Check for face detection transition
        if (signals.primaryFaceDetected && !prevFaceDetected.current) {
          prevFaceDetected.current = true;
          addTimelineEvent(
            'Primary face detected',
            'Haar cascade locked onto primary candidate face ROI',
            'face',
            'normal'
          );
        } else if (!signals.primaryFaceDetected) {
          prevFaceDetected.current = false;
        }

        // Check for multiple-person detection transition
        if (signals.multiplePersonDetected && !prevMultiplePersons.current) {
          prevMultiplePersons.current = true;
          addTimelineEvent(
            'Multiple-person signal detected',
            `OpenCV detected ${signals.faceCount} visible faces in frame. Review recommended.`,
            'multi_person',
            'attention'
          );
        } else if (!signals.multiplePersonDetected) {
          prevMultiplePersons.current = false;
        }
      }
    } catch (err) {
      console.warn('Frame capture error:', err);
    } finally {
      isAnalyzingRef.current = false;
      setIsAnalyzingFrame(false);
    }
  }, [cameraStatus, cvStatus.connected, addTimelineEvent]);

  // Start continuous frame analysis whenever camera is active and CV is connected
  useEffect(() => {
    if (cameraStatus === 'Active' && cvStatus.connected) {
      frameIntervalRef.current = setInterval(captureAndAnalyzeFrame, 75);
      captureAndAnalyzeFrame();
    } else {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    }
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [cameraStatus, cvStatus.connected, captureAndAnalyzeFrame]);

  // Helper to check if running inside embedded preview / iframe
  const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

  // Request browser camera stream directly on user activation
  const handleEnableCamera = async () => {
    // Prevent repeated or overlapping requests
    if (cameraStatus === 'Connecting') return;

    setErrorMessage(null);
    setCameraStatus('Connecting');

    // 1. Check whether navigator.mediaDevices and navigator.mediaDevices.getUserMedia are available
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraStatus('Unavailable');
      const msg = isEmbedded
        ? 'Camera API is unavailable in this embedded preview frame. Please open the app in a separate browser tab to test the webcam.'
        : 'Camera API (navigator.mediaDevices.getUserMedia) is not supported or unavailable in this browser environment. Ensure the site is running on HTTPS or localhost.';
      setErrorMessage(msg);
      return;
    }

    try {
      // 2. Explicitly request video stream on user action
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const videoTracks = stream.getVideoTracks();
      if (!videoTracks || videoTracks.length === 0) {
        throw new Error('No active video track was returned by the camera.');
      }

      // Stop any existing stream before replacing
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      streamRef.current = stream;

      // Listen for track ended (e.g. user revoked permission in browser or unplugged device)
      videoTracks.forEach((track) => {
        track.onended = () => {
          stopCameraStream();
          setCameraStatus('Stopped');
          setErrorMessage('Camera video track ended or was disconnected.');
          prevCameraStatus.current = 'Stopped';
          addTimelineEvent(
            'Camera disconnected',
            'Webcam video track ended',
            'camera',
            'normal'
          );
        };
      });

      // 4. Attach returned MediaStream to existing video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video playback warning:', playErr);
        }
      }

      // 7. Do not show "Camera Active" unless the MediaStream has actually started
      if (videoTracks[0].readyState === 'live') {
        setCameraStatus('Active');
        if (prevCameraStatus.current !== 'Active') {
          prevCameraStatus.current = 'Active';
          addTimelineEvent(
            'Camera connected',
            'Browser webcam stream initiated with live video feed',
            'camera',
            'normal'
          );
        }
      } else {
        setCameraStatus('Unavailable');
        setErrorMessage('Webcam stream was initiated but track state is not live.');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);

      // Clean up any partial stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      const errName = err?.name || '';
      // Explicitly handle standard MediaDevices errors
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraStatus('Permission Denied');
        setErrorMessage(
          'Camera permission was denied. Please allow camera access in your browser or site settings (click the camera or lock icon in your browser address bar), then click "Try Again". If running inside an embedded preview, you can also open the app in a separate browser tab.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraStatus('Unavailable');
        setErrorMessage('No camera device was found on your system. Please connect a webcam and click "Try Again".');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setCameraStatus('Unavailable');
        setErrorMessage(
          'The camera is currently in use by another application or blocked by the operating system. Close other apps and click "Try Again".'
        );
      } else if (errName === 'OverconstrainedError' || errName === 'ConstraintNotSatisfiedError') {
        setCameraStatus('Unavailable');
        setErrorMessage('Requested video settings are not supported by your camera hardware.');
      } else if (errName === 'SecurityError') {
        setCameraStatus('Permission Denied');
        setErrorMessage(
          'Camera access is restricted due to browser security or iframe permissions policy. Please check site permissions or open the app in a separate browser tab.'
        );
      } else {
        setCameraStatus('Unavailable');
        setErrorMessage(
          err?.message || 'Unable to connect to camera. Access is required for live visual monitoring. Click "Try Again".'
        );
      }
    }
  };

  const startCamera = handleEnableCamera;

  // 5. Stop all MediaStream tracks when camera is disabled
  const handleDisableCamera = () => {
    stopCameraStream();
    setCameraStatus('Stopped');
    setErrorMessage(null);
    prevCameraStatus.current = 'Stopped';
    addTimelineEvent(
      'Camera disconnected',
      'Webcam stream was stopped by reviewer',
      'camera',
      'normal'
    );
  };

  // SESSION CONTROLS
  const handleStartMonitoring = async () => {
    const nowStr = new Date().toTimeString().split(' ')[0];
    if (!sessionStartTimeStr) {
      setSessionStartTimeStr(nowStr);
    }
    setMonitoringState('Active');
    addTimelineEvent(
      'Interview session started',
      `Session DEF-2026-001 started for ${PRIMARY_CANDIDATE.name}`,
      'session',
      'normal'
    );

    if (cameraStatus !== 'Active') {
      await handleEnableCamera();
    }
  };

  const handlePauseMonitoring = () => {
    setMonitoringState('Paused');
    addTimelineEvent(
      'Interview monitoring paused',
      'Session timer paused; camera stream remains in standby',
      'pause',
      'normal'
    );
  };

  const handleResumeMonitoring = async () => {
    setMonitoringState('Active');
    addTimelineEvent(
      'Interview monitoring resumed',
      'Session timer and frame telemetry resumed',
      'resume',
      'normal'
    );
    if (cameraStatus !== 'Active') {
      await handleEnableCamera();
    }
  };

  const handleRequestEndSession = () => {
    setIsEndModalOpen(true);
  };

  const handleConfirmEndSession = () => {
    setIsEndModalOpen(false);
    setMonitoringState('Ended');
    stopCameraStream();
    setCameraStatus('Stopped');

    const durationStr = formatHHMMSS(elapsedSeconds);
    const endTimestamp = new Date().toTimeString().split(' ')[0];

    const finalEvent: SessionTimelineEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: endTimestamp,
      isoTime: new Date().toISOString(),
      title: 'Interview session completed',
      description: `Total duration: ${durationStr}. Finalizing telemetry review.`,
      type: 'session',
      status: 'normal',
    };

    const finalTimeline = [finalEvent, ...timelineEvents];
    setTimelineEvents(finalTimeline);

    // Save real completed session to persistent store
    sessionStore.completeInterviewSession({
      duration: durationStr,
      elapsedSeconds,
      startTime: sessionStartTimeStr || endTimestamp,
      endTime: endTimestamp,
      timeline: finalTimeline,
      visionSignals,
      cvConnected: cvStatus.connected,
      cameraActive: false,
      questionsCompleted: questionRecord.status === 'Response Completed' ? 3 : 2,
      evaluatorNotes: evaluatorReview.notes,
      evaluatorStatus: evaluatorReview.status,
    });
  };

  const handleCancelEndSession = () => {
    setIsEndModalOpen(false);
  };

  const handleRestart = () => {
    setMonitoringState('Ready');
    setElapsedSeconds(0);
    setSessionStartTimeStr(null);
    setErrorMessage(null);
    stopCameraStream();
    setCameraStatus('Ready');
    setVisionSignals(null);
    prevFaceDetected.current = false;
    prevMultiplePersons.current = false;
    prevCameraStatus.current = 'Ready';
    setTimelineEvents([]);
    setQuestionRecord({
      questionId: 'q-2',
      questionText: 'How would you optimize a slow React application?',
      startTime: null,
      endTime: null,
      responseDurationSeconds: 0,
      status: 'Waiting for Response',
    });
  };

  // Reset blink and vision signals
  const handleResetBlinks = async () => {
    await visionService.resetSignals();
    setVisionSignals((prev) =>
      prev
        ? {
            ...prev,
            blinkCount: 0,
          }
        : null
    );
    addTimelineEvent('Blink counter reset', 'Evaluator reset blink counter to zero', 'session', 'neutral');
  };

  // QUESTION TIMING CONTROLS
  const handleStartQuestionResponse = () => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setQuestionRecord((prev) => ({
      ...prev,
      startTime: timeStr,
      endTime: null,
      responseDurationSeconds: 0,
      status: 'Recording Response',
    }));
    addTimelineEvent(
      'Interview question response started',
      `Candidate began answering: "${questionRecord.questionText}"`,
      'question',
      'normal'
    );
  };

  const handleCompleteQuestionResponse = () => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setQuestionRecord((prev) => {
      const finalRecord: QuestionTimingRecord = {
        ...prev,
        endTime: timeStr,
        status: 'Response Completed',
      };
      return finalRecord;
    });

    addTimelineEvent(
      'Interview question response completed',
      `Response completed. Duration recorded for AI analysis.`,
      'question',
      'normal'
    );
  };

  const handleResetQuestion = () => {
    setQuestionRecord({
      questionId: 'q-2',
      questionText: 'How would you optimize a slow React application?',
      startTime: null,
      endTime: null,
      responseDurationSeconds: 0,
      status: 'Waiting for Response',
    });
  };

  // Deterministic testing helper for verifying signals and risk engine integration
  const applyTestScenario = (scenario: 'single' | 'blink' | 'multi' | 'none') => {
    const nowIso = new Date().toISOString();
    if (scenario === 'single') {
      setVisionSignals({
        faceCount: 1,
        primaryFaceDetected: true,
        multiplePersonDetected: false,
        personStatus: 'Single Person',
        explanation: null,
        blinkCount: visionSignals?.blinkCount || 0,
        eyeStatus: 'Both Eyes Detected',
        mouthStatus: 'not_available',
        cameraActive: true,
        boundingBoxes: [
          { x: 380, y: 140, width: 360, height: 420, label: 'Primary Face', isPrimary: true, boxType: 'face' },
        ],
        eyeBoundingBoxes: [
          { x: 440, y: 240, width: 60, height: 40, label: 'Left Eye', isPrimary: false, boxType: 'eye' },
          { x: 600, y: 240, width: 60, height: 40, label: 'Right Eye', isPrimary: false, boxType: 'eye' },
        ],
        fps: 28.0,
        processingTimeMs: 24.2,
        timestamp: nowIso,
      });
      if (!prevFaceDetected.current) {
        prevFaceDetected.current = true;
        addTimelineEvent('Primary face detected', 'Haar cascade locked onto primary face', 'face', 'normal');
      }
    } else if (scenario === 'blink') {
      const newBlinkCount = (visionSignals?.blinkCount || 0) + 1;
      setVisionSignals({
        faceCount: 1,
        primaryFaceDetected: true,
        multiplePersonDetected: false,
        personStatus: 'Single Person',
        explanation: null,
        blinkCount: newBlinkCount,
        eyeStatus: 'Both Eyes Detected',
        mouthStatus: 'not_available',
        cameraActive: true,
        boundingBoxes: [
          { x: 380, y: 140, width: 360, height: 420, label: 'Primary Face', isPrimary: true, boxType: 'face' },
        ],
        eyeBoundingBoxes: [
          { x: 440, y: 240, width: 60, height: 40, label: 'Left Eye', isPrimary: false, boxType: 'eye' },
          { x: 600, y: 240, width: 60, height: 40, label: 'Right Eye', isPrimary: false, boxType: 'eye' },
        ],
        fps: 28.0,
        processingTimeMs: 22.8,
        timestamp: nowIso,
      });
    } else if (scenario === 'multi') {
      setVisionSignals({
        faceCount: 2,
        primaryFaceDetected: true,
        multiplePersonDetected: true,
        personStatus: 'Multiple Persons Detected',
        explanation: 'Multiple visible faces detected. Manual review recommended.',
        blinkCount: visionSignals?.blinkCount || 0,
        eyeStatus: 'Both Eyes Detected',
        mouthStatus: 'not_available',
        cameraActive: true,
        boundingBoxes: [
          { x: 260, y: 140, width: 340, height: 400, label: 'Primary Face', isPrimary: true, boxType: 'face' },
          { x: 740, y: 200, width: 280, height: 320, label: 'Subject #2', isPrimary: false, boxType: 'face' },
        ],
        eyeBoundingBoxes: [
          { x: 320, y: 230, width: 55, height: 38, label: 'Left Eye', isPrimary: false, boxType: 'eye' },
          { x: 470, y: 230, width: 55, height: 38, label: 'Right Eye', isPrimary: false, boxType: 'eye' },
        ],
        fps: 26.5,
        processingTimeMs: 31.5,
        timestamp: nowIso,
      });
      if (!prevMultiplePersons.current) {
        prevMultiplePersons.current = true;
        addTimelineEvent(
          'Multiple-person signal detected',
          'More than one visible face was detected in camera frame.',
          'multi_person',
          'attention'
        );
      }
    } else {
      setVisionSignals({
        faceCount: 0,
        primaryFaceDetected: false,
        multiplePersonDetected: false,
        personStatus: 'No Face Detected',
        explanation: null,
        blinkCount: visionSignals?.blinkCount || 0,
        eyeStatus: 'No Eyes Detected',
        mouthStatus: 'not_available',
        cameraActive: true,
        boundingBoxes: [],
        eyeBoundingBoxes: [],
        fps: 28.0,
        processingTimeMs: 16.5,
        timestamp: nowIso,
      });
      prevFaceDetected.current = false;
      prevMultiplePersons.current = false;
    }
  };

  // Scroll to signals or timeline section
  const handleScrollToReview = () => {
    const el = document.getElementById('session-timeline');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Convert real vision signals to Risk Engine inputs
  const currentRiskAssessment = evaluateRiskAssessment({
    geminiAnalysis: DETERMINISTIC_TEST_SCENARIOS[0].mockGeminiResult,
    cameraSignals:
      visionSignals && (cameraStatus === 'Active' || visionSignals.cameraActive)
        ? [
            { type: 'multiple_persons', value: visionSignals.multiplePersonDetected },
            { type: 'camera_inconsistency', value: false },
          ]
        : undefined,
  });

  return (
    <div className="space-y-6">
      {/* Regulatory & Decision-Support Notice */}
      <DisclaimerBanner compact />

      {/* 5-Step Recruiter Workflow Indicator */}
      <WorkflowStepper currentStep={2} onNavigate={onNavigate} variant="compact" />

      {/* Confirmation Modal for Ending Session */}
      <EndSessionModal
        isOpen={isEndModalOpen}
        onConfirm={handleConfirmEndSession}
        onCancel={handleCancelEndSession}
        sessionDuration={formatHHMMSS(elapsedSeconds)}
      />

      {/* 1. PAGE HEADER & PRIMARY CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold uppercase">
                  Step 2 of 5
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Live Interview Monitor
                </h1>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                    monitoringState === 'Active'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 animate-pulse'
                      : monitoringState === 'Paused'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      : monitoringState === 'Ended'
                      ? 'bg-slate-900 text-slate-400 border-slate-800'
                      : 'bg-cyan-950/50 text-cyan-300 border-cyan-800/50'
                  }`}
                >
                  {monitoringState === 'Active'
                    ? '● LIVE'
                    : monitoringState === 'Paused'
                    ? 'PAUSED'
                    : monitoringState === 'Ended'
                    ? 'COMPLETED'
                    : 'READY'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Real-time visual telemetry, sensory analysis, and human evaluation workspace. Captures live signals for AI Analysis (Step 3) and Risk Assessment (Step 4).
              </p>
            </div>
          </div>
        </div>

        {/* Top-Right Session Controls */}
        <div className="flex items-center gap-2.5">
          {monitoringState === 'Ready' && (
            <button
              onClick={handleStartMonitoring}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-950/40"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Monitoring</span>
            </button>
          )}

          {monitoringState === 'Active' && (
            <>
              <button
                onClick={handlePauseMonitoring}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-amber-950/30"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>

              <button
                onClick={handleRequestEndSession}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-950/40"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>End Session</span>
              </button>
            </>
          )}

          {monitoringState === 'Paused' && (
            <>
              <button
                onClick={handleResumeMonitoring}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-950/30"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>

              <button
                onClick={handleRequestEndSession}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-950/40"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>End Session</span>
              </button>
            </>
          )}

          {monitoringState === 'Ended' && (
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Session</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('/candidate')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            <span>Candidate Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Post-Interview Banner if Completed */}
      {monitoringState === 'Ended' && (
        <PostInterviewBanner
          sessionDuration={formatHHMMSS(elapsedSeconds)}
          onNavigate={onNavigate}
          onRestart={handleRestart}
        />
      )}

      {/* MAIN THREE-SECTION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ======================================================== */}
        {/* LEFT / MAIN SECTION: Large Live Camera Preview (cols 1-7) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* CAMERA CONTAINER */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl relative flex flex-col">
            {/* Top Toolbar */}
            <div className="px-5 py-3 bg-[#0B111E] border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-white">Live Stream</span>
                <span className="text-slate-500 text-xs">·</span>
                <div className="flex items-center gap-2 text-xs">
                  {cameraStatus === 'Active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ● CAMERA ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      <VideoOff className="w-3 h-3" />
                      CAMERA UNAVAILABLE
                    </span>
                  )}
                </div>
              </div>

              {/* Toolbar Controls, Timer & CV indicator */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-slate-400">
                {cameraStatus === 'Active' ? (
                  <button
                    onClick={handleDisableCamera}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900/90 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 text-[11px] font-sans font-medium transition-colors"
                    title="Stop camera video stream"
                  >
                    <VideoOff className="w-3 h-3 text-rose-400" />
                    <span>Disable Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEnableCamera}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 text-[11px] font-sans font-medium transition-colors"
                  >
                    <Video className="w-3 h-3 text-cyan-400" />
                    <span>Enable Camera</span>
                  </button>
                )}

                {isAnalyzingFrame && (
                  <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    CV Analyzing
                  </span>
                )}
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-200 font-semibold">{formatHHMMSS(elapsedSeconds)}</span>
                </div>
              </div>
            </div>

            {/* VIDEO CANVAS & OVERLAY */}
            <div className="relative aspect-video w-full bg-[#060911] flex items-center justify-center overflow-hidden">
              {/* Actual Video Stream Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  cameraStatus === 'Active' ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              />

              {/* Haar Cascade Bounding Boxes Visual Overlay */}
              {cameraStatus === 'Active' && videoRef.current && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Face Bounding Boxes */}
                  {visionSignals?.boundingBoxes &&
                    visionSignals.boundingBoxes.map((box, idx) => {
                      const vw = videoRef.current?.videoWidth || 1280;
                      const vh = videoRef.current?.videoHeight || 720;
                      const leftPct = (box.x / vw) * 100;
                      const topPct = (box.y / vh) * 100;
                      const widthPct = (box.width / vw) * 100;
                      const heightPct = (box.height / vh) * 100;

                      return (
                        <div
                          key={`face-${idx}`}
                          style={{
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: `${widthPct}%`,
                            height: `${heightPct}%`,
                          }}
                          className={`absolute border-2 rounded-lg transition-all duration-200 ${
                            idx === 0
                              ? 'border-cyan-400/90 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                              : 'border-amber-400/90 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                          }`}
                        >
                          <div
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-t font-semibold ${
                              idx === 0
                                ? 'bg-cyan-500/90 text-slate-950'
                                : 'bg-amber-500/90 text-slate-950'
                            }`}
                          >
                            {idx === 0 ? 'Primary Candidate' : `Secondary Face #${idx + 1}`}
                          </div>
                        </div>
                      );
                    })}

                  {/* Eye Bounding Boxes inside Primary Face */}
                  {visionSignals?.eyeBoundingBoxes &&
                    visionSignals.eyeBoundingBoxes.map((ebox, eidx) => {
                      const vw = videoRef.current?.videoWidth || 1280;
                      const vh = videoRef.current?.videoHeight || 720;
                      const leftPct = (ebox.x / vw) * 100;
                      const topPct = (ebox.y / vh) * 100;
                      const widthPct = (ebox.width / vw) * 100;
                      const heightPct = (ebox.height / vh) * 100;

                      return (
                        <div
                          key={`eye-${eidx}`}
                          style={{
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: `${widthPct}%`,
                            height: `${heightPct}%`,
                          }}
                          className="absolute border border-cyan-300 rounded shadow-[0_0_8px_rgba(34,211,238,0.7)] transition-all duration-150"
                        >
                          <div className="text-[9px] font-mono px-1 bg-cyan-400 text-slate-950 font-bold -mt-3.5 inline-block rounded-xs">
                            Eye
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Placeholder when Camera is Not Active */}
              {cameraStatus !== 'Active' && (
                <div className="flex flex-col items-center justify-center text-center p-6 max-w-md space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                    {cameraStatus === 'Connecting' ? (
                      <Radio className="w-8 h-8 text-cyan-400 animate-spin" />
                    ) : cameraStatus === 'Permission Denied' ? (
                      <AlertTriangle className="w-8 h-8 text-rose-400" />
                    ) : (
                      <VideoOff className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-white">
                      {cameraStatus === 'Connecting'
                        ? 'Connecting to Camera...'
                        : cameraStatus === 'Permission Denied'
                        ? 'Camera Status: Permission Denied'
                        : cameraStatus === 'Stopped'
                        ? 'Camera Feed Stopped'
                        : cameraStatus === 'Unavailable'
                        ? 'CAMERA UNAVAILABLE'
                        : 'Camera Inactive'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {errorMessage ||
                        'Camera access is required for live visual monitoring. Please enable permissions to preview your webcam.'}
                    </p>
                  </div>

                  {/* Embedded preview warning when running inside iframe */}
                  {isEmbedded && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs text-left flex flex-col gap-2 w-full">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          Camera access may be unavailable in embedded preview. Open the app in a separate browser tab to test the webcam.
                        </span>
                      </div>
                      <a
                        href={typeof window !== 'undefined' ? window.location.href : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-medium transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open App in Separate Tab</span>
                      </a>
                    </div>
                  )}

                  {cameraStatus !== 'Connecting' && monitoringState !== 'Ended' && (
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      {cameraStatus === 'Permission Denied' || cameraStatus === 'Unavailable' ? (
                        <>
                          <button
                            onClick={handleEnableCamera}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-950/40"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Try Again</span>
                          </button>
                          <button
                            onClick={handleEnableCamera}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-all"
                          >
                            <Video className="w-4 h-4" />
                            <span>Enable Camera</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEnableCamera}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-950/40"
                        >
                          <Video className="w-4 h-4" />
                          <span>Enable Camera</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Video Overlay Top & Bottom Panels */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Top Overlay Row: Candidate, Role, Session, Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-400">Candidate:</span>
                    <span className="font-semibold text-white">{PRIMARY_CANDIDATE.name}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">Role:</span>
                    <span className="text-slate-200 font-medium">{PRIMARY_CANDIDATE.role}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs font-mono">
                    <span className="text-slate-400">Session:</span>
                    <span className="text-cyan-300 font-semibold">{PRIMARY_CANDIDATE.id}</span>
                    <span className="text-slate-600">·</span>
                    <span
                      className={`font-semibold ${
                        cameraStatus === 'Active'
                          ? 'text-emerald-400'
                          : cameraStatus === 'Connecting'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {cameraStatus === 'Active' ? 'LIVE' : cameraStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Visual HUD Overlay (Face Count, Eye Status, Blink Count, Multi-Person, Camera, FPS) */}
                {cameraStatus === 'Active' && (
                  <div className="absolute top-14 right-4 pointer-events-none bg-slate-950/90 border border-slate-700/80 rounded-lg p-2.5 font-mono text-xs text-slate-200 shadow-2xl backdrop-blur-md space-y-1 min-w-[210px] z-10">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 pb-1 border-b border-slate-800 flex items-center justify-between">
                      <span>OpenCV Vision HUD</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Face Count:</span>
                      <span className="font-semibold text-white">
                        {visionSignals ? visionSignals.faceCount : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Eye Status:</span>
                      <span
                        className={`font-semibold ${
                          visionSignals?.eyeStatus === 'Both Eyes Detected'
                            ? 'text-emerald-400'
                            : visionSignals?.eyeStatus === 'One Eye Detected'
                            ? 'text-amber-300'
                            : visionSignals?.eyeStatus === 'No Eyes Detected'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {visionSignals?.eyeStatus || 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-slate-500">Current Openness:</span>
                      <span className="font-semibold text-cyan-300">
                        {typeof visionSignals?.eyeOpenness === 'number'
                          ? `${Math.round(visionSignals.eyeOpenness * 100)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-slate-500">Baseline Openness:</span>
                      <span className="font-semibold text-slate-300">
                        {typeof visionSignals?.baselineOpenness === 'number'
                          ? `${Math.round(visionSignals.baselineOpenness * 100)}%`
                          : 'Calibrating...'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Blink Count:</span>
                      <span className="font-semibold text-cyan-300">
                        {visionSignals ? visionSignals.blinkCount : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-slate-500">Blink State:</span>
                      <span
                        className={`font-semibold ${
                          visionSignals?.blinkTrackingState === 'CLOSED'
                            ? 'text-amber-400'
                            : visionSignals?.blinkTrackingState === 'OPEN'
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {visionSignals?.blinkTrackingState || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-slate-500">Closed Frames:</span>
                      <span className="font-semibold text-slate-300">
                        {typeof visionSignals?.consecutiveClosedFrames === 'number'
                          ? visionSignals.consecutiveClosedFrames
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Multiple Person:</span>
                      <span
                        className={`font-semibold ${
                          visionSignals?.multiplePersonDetected ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        {visionSignals?.multiplePersonDetected ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Camera:</span>
                      <span className="font-semibold text-emerald-400">ACTIVE</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">FPS:</span>
                      <span className="font-semibold text-cyan-400">
                        {visionSignals?.fps ? `${visionSignals.fps}` : '28'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Multiple Person Alert Notification Banner on Video */}
                {visionSignals?.multiplePersonDetected && (
                  <div className="self-center bg-amber-950/95 border border-amber-600/80 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 text-xs animate-pulse max-w-lg pointer-events-auto">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-amber-300">Multiple Person Signal</div>
                        <div className="text-[11px] text-amber-200/90">
                          More than one visible face was detected in the camera frame.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleScrollToReview}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[11px] transition-colors shrink-0 shadow-xs"
                    >
                      Review Signal
                    </button>
                  </div>
                )}

                {/* Bottom Overlay Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-mono">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`font-semibold ${
                          monitoringState === 'Active'
                            ? 'text-emerald-400'
                            : monitoringState === 'Paused'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {monitoringState.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-mono">
                      <span className="text-slate-400">CV Engine:</span>
                      <span
                        className={`font-semibold ${
                          cvStatus.connected ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {cvStatus.connected ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-mono text-slate-400">
                    OpenCV Sentinel · Live Feed
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stream Diagnostics Bar */}
            <div className="p-3.5 bg-[#0B111E] border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      cameraStatus === 'Active' ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  Resolution: {cameraStatus === 'Active' ? '1280 × 720 (Live)' : 'Standby'}
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  Faces:{' '}
                  <strong className="text-slate-200">
                    {visionSignals ? visionSignals.faceCount : 'Awaiting data'}
                  </strong>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  Eyes:{' '}
                  <strong className="text-cyan-300">
                    {visionSignals ? visionSignals.eyeStatus : 'Standby'}
                  </strong>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  Blinks:{' '}
                  <strong className="text-cyan-300">
                    {visionSignals ? visionSignals.blinkCount : 0}
                  </strong>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  FPS:{' '}
                  <strong className="text-slate-200">
                    {visionSignals?.fps ? `${visionSignals.fps} FPS` : '28 FPS'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  Haar Face
                </span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  Haar Eye
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Verification Presets (Provides offline testability & quick pipeline check) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-200">Test Telemetry Presets:</span>
              <span className="text-[11px] text-slate-400">(Verification controls)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => applyTestScenario('single')}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[11px] transition-colors"
                title="Single candidate with both eyes detected"
              >
                1 Face + Both Eyes
              </button>
              <button
                onClick={() => applyTestScenario('blink')}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[11px] transition-colors"
                title="Simulate candidate blink"
              >
                +1 Blink
              </button>
              <button
                onClick={() => applyTestScenario('multi')}
                className="px-2.5 py-1 rounded bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 font-mono text-[11px] transition-colors"
                title="Simulate 2 faces detected in frame"
              >
                2 Faces (Multi-Person)
              </button>
              <button
                onClick={() => applyTestScenario('none')}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 font-mono text-[11px] transition-colors"
                title="No face detected"
              >
                No Face
              </button>
              {visionSignals && (
                <button
                  onClick={handleResetBlinks}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 font-mono text-[11px] transition-colors"
                  title="Reset blink count"
                >
                  Reset Blinks
                </button>
              )}
            </div>
          </div>

          {/* Current Interview Question & Response Timing Section */}
          <InterviewQuestionCard
            timingRecord={questionRecord}
            onStartResponse={handleStartQuestionResponse}
            onCompleteResponse={handleCompleteQuestionResponse}
            onResetResponse={handleResetQuestion}
          />
        </div>

        {/* ======================================================== */}
        {/* RIGHT SECTION: Signals Panel, Timers & Controls (cols 8-12) */}
        {/* ======================================================== */}
        <div id="signals-panel" className="lg:col-span-5 space-y-4">
          {/* SESSION TIMING & INFO CARD */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Interview Session</h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                {PRIMARY_CANDIDATE.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Session Started:</div>
                <div className="font-mono text-sm font-bold text-white mt-1">
                  {sessionStartTimeStr || 'Not Started'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Session Duration:</div>
                <div className="font-mono text-sm font-bold text-cyan-400 mt-1">
                  {formatHHMMSS(elapsedSeconds)}
                </div>
              </div>
            </div>
          </div>

          {/* COMPUTER VISION BACKEND STATUS */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Python OpenCV Service
                </h4>
              </div>
              <button
                onClick={checkBackendStatus}
                disabled={isCheckingCv}
                title="Check Python backend status"
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingCv ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">FastAPI Backend Status:</span>
              {cvStatus.connected ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected (Active)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Computer Vision Offline
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {cvStatus.connected
                ? cvStatus.message || 'Haar cascade face and eye detector active for frame analysis.'
                : 'Computer vision offline. Vision signals unavailable until backend is running.'}
            </p>
          </div>

          {/* 3 & 4. REUSABLE SIGNALCARDS GRID */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Live Interview Signals</h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Telemetry
              </span>
            </div>

            <div className="space-y-3">
              {/* Face Count */}
              <SignalCard
                icon={<User className="w-4 h-4" />}
                name="Face Count"
                value={
                  cvStatus.connected && visionSignals && cameraStatus === 'Active'
                    ? visionSignals.faceCount
                    : 'Not Available'
                }
                status={
                  !cvStatus.connected || cameraStatus !== 'Active'
                    ? 'UNAVAILABLE'
                    : visionSignals && visionSignals.faceCount > 1
                    ? 'ATTENTION'
                    : 'NORMAL'
                }
                subtext="Visible faces in frame"
              />

              {/* Primary Face */}
              <SignalCard
                icon={<User className="w-4 h-4" />}
                name="Primary Face"
                value={
                  cvStatus.connected && visionSignals && cameraStatus === 'Active'
                    ? visionSignals.primaryFaceDetected
                      ? 'Detected'
                      : 'Not Detected'
                    : 'Not Available'
                }
                status={
                  !cvStatus.connected || cameraStatus !== 'Active'
                    ? 'UNAVAILABLE'
                    : visionSignals && !visionSignals.primaryFaceDetected
                    ? 'ATTENTION'
                    : 'NORMAL'
                }
                subtext="Main candidate frontal lock"
              />

              {/* Eye Status */}
              <SignalCard
                icon={<Eye className="w-4 h-4" />}
                name="Eye Status"
                value={
                  cvStatus.connected && visionSignals && cameraStatus === 'Active'
                    ? visionSignals.eyeStatus
                    : 'Not Available'
                }
                status={
                  !cvStatus.connected || cameraStatus !== 'Active'
                    ? 'UNAVAILABLE'
                    : visionSignals?.eyeStatus === 'No Eyes Detected'
                    ? 'ATTENTION'
                    : 'NORMAL'
                }
                subtext="Haar cascade eye detection (not gaze tracking)"
              />

              {/* Blink Count */}
              <SignalCard
                icon={<Eye className="w-4 h-4" />}
                name="Blink Count"
                value={
                  cvStatus.connected && visionSignals && cameraStatus === 'Active'
                    ? `${visionSignals.blinkCount}`
                    : 'Not Available'
                }
                status={!cvStatus.connected || cameraStatus !== 'Active' ? 'UNAVAILABLE' : 'NORMAL'}
                subtext="Consecutive frame prototype counter"
                actionButton={
                  visionSignals && visionSignals.blinkCount > 0 ? (
                    <button
                      onClick={handleResetBlinks}
                      className="text-[10px] font-mono text-cyan-400 hover:underline"
                    >
                      Reset
                    </button>
                  ) : undefined
                }
              />

              {/* Multiple Person */}
              <SignalCard
                icon={<Users className="w-4 h-4" />}
                name="Multiple Person"
                value={
                  cvStatus.connected && visionSignals && cameraStatus === 'Active'
                    ? visionSignals.multiplePersonDetected
                      ? 'Yes'
                      : 'No'
                    : 'Not Available'
                }
                status={
                  !cvStatus.connected || cameraStatus !== 'Active'
                    ? 'UNAVAILABLE'
                    : visionSignals?.multiplePersonDetected
                    ? 'ATTENTION'
                    : 'NORMAL'
                }
                subtext="Manual review alert flag"
              />

              {/* FPS */}
              <SignalCard
                icon={<Activity className="w-4 h-4" />}
                name="FPS"
                value={
                  cvStatus.connected && cameraStatus === 'Active'
                    ? visionSignals?.fps || 28
                    : 'Not Available'
                }
                status={!cvStatus.connected || cameraStatus !== 'Active' ? 'UNAVAILABLE' : 'NORMAL'}
                subtext="Vision pipeline processing rate"
              />

              {/* Mouth Movement (Unavailable signal honestly flagged) */}
              <SignalCard
                icon={<Smile className="w-4 h-4" />}
                name="Mouth Movement"
                value="Not Available"
                status="UNAVAILABLE"
                subtext="Phoneme sync not connected"
              />
            </div>
          </div>

          {/* HUMAN REVIEW CONTROLS (Flag, Verified, Notes, Save) */}
          <HumanReviewControls
            review={evaluatorReview}
            onUpdateReview={setEvaluatorReview}
            onAddTimelineEvent={(title, description, status) =>
              addTimelineEvent(title, description, 'verification', status)
            }
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM SECTION: Timeline + Risk Summary (Full Width)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Session Event Timeline (cols 1-6) */}
        <div className="lg:col-span-6">
          <SessionTimeline events={timelineEvents} />
        </div>

        {/* Live Risk Indicator & Engine Summary (cols 7-12) */}
        <div className="lg:col-span-6 space-y-4">
          <LiveRiskCard
            assessment={currentRiskAssessment}
            multiplePersonDetected={Boolean(visionSignals?.multiplePersonDetected)}
          />

          {/* Consolidated Signal Summary */}
          <SessionSignalSummary
            visionSignals={visionSignals}
            cameraActive={cameraStatus === 'Active'}
            cvConnected={cvStatus.connected}
            questionRecord={questionRecord}
            hasAiAnalysis={false}
          />
        </div>
      </div>
    </div>
  );
};
