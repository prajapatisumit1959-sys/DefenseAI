import React, { useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Layers,
  Code2,
  AlertCircle,
} from 'lucide-react';
import { ResumeData } from '../../types/candidate';

interface ResumeSectionProps {
  resume: ResumeData;
  onUpdateResume: (updated: ResumeData) => void;
}

export const ResumeSection: React.FC<ResumeSectionProps> = ({
  resume,
  onUpdateResume,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateResume({
        ...resume,
        fileName: file.name,
        fileSizeBytes: file.size,
        uploadedAt: 'Just now',
        analysisStatus: 'Not Started',
      });
    }
  };

  const handleRemoveFile = () => {
    onUpdateResume({
      ...resume,
      fileName: undefined,
      fileSizeBytes: undefined,
      uploadedAt: undefined,
      analysisStatus: 'Not Started',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-5 hover:border-slate-700/80 transition-all">
      {/* Header with Title and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Resume Information
            </h3>
            <p className="text-xs text-slate-400">
              Verified candidate dossier credentials and uploaded document file
            </p>
          </div>
        </div>

        {/* Required Status Label */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Resume Analysis: {resume.analysisStatus}</span>
          </span>
        </div>
      </div>

      {/* Structured Resume Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Education & Experience */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/70 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Education</span>
          </div>
          <p className="text-slate-200 font-medium">{resume.education}</p>
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-slate-400 text-[11px]">
            <span>Experience:</span>
            <span className="text-white font-mono font-medium">{resume.experienceYears}</span>
          </div>
        </div>

        {/* Key Projects */}
        <div className="md:col-span-2 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/70 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Projects Highlighted on Resume</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-0.5">
            {resume.projects.map((proj, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/70 text-slate-300 text-[11px]"
              >
                {proj}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Badges */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Extracted Resume Skills</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {resume.skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-md bg-cyan-950/30 text-cyan-300 border border-cyan-800/40 text-xs font-mono"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Uploaded File Area */}
      <div className="pt-3 border-t border-slate-800/80">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="resume-file-upload"
        />

        {resume.fileName ? (
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-700/50 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate block">
                    {resume.fileName}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.2 rounded shrink-0">
                    Selected File
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>{formatFileSize(resume.fileSizeBytes)}</span>
                  <span>·</span>
                  <span>{resume.uploadedAt || 'Ready for stage'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                title="Remove resume"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-900 mx-auto flex items-center justify-center text-slate-400 border border-slate-800">
              <Upload className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200">
                No resume document currently attached
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supported formats: .pdf, .doc, .docx (Max 15MB)
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Resume</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
