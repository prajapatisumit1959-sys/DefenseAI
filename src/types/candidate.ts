export interface ResumeProject {
  title: string;
  description?: string;
}

export interface ResumeData {
  skills: string[];
  experienceYears: number | string;
  education: string;
  projects: string[];
  fileName?: string;
  fileSizeBytes?: number;
  uploadedAt?: string;
  analysisStatus: 'Not Started' | 'In Queue' | 'Analyzed';
}

export interface InterviewQuestionItem {
  id: string;
  questionNumber: number;
  questionText: string;
  answerText: string;
  category: 'Technical' | 'Architecture' | 'Behavioral' | 'Problem Solving';
  responseTimeSeconds?: number; // e.g. 42
  notes?: string;
}

export interface CandidateProfile {
  id: string; // e.g. "DEF-2026-001"
  name: string;
  role: string;
  experienceYears: string;
  location: string;
  interviewStatus: 'Completed' | 'In Progress' | 'Scheduled' | 'Pending Review';
  avatarInitials: string;
  email: string;
  resume: ResumeData;
  questions: InterviewQuestionItem[];
}

export interface AnalysisInputStatus {
  resumeAvailable: boolean;
  resumeDetails: string;
  responsesCount: number;
  behavioralSignalsConnected: boolean;
  cameraAnalysisConnected: boolean;
  aiEngineConnected: boolean;
}

export type PipelineStepStatus = 'completed' | 'in_progress' | 'pending';

export interface AnalysisPipelineStep {
  id: string;
  label: string;
  status: PipelineStepStatus;
  description: string;
}
