import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  AlignLeft,
  Tag,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { InterviewQuestionItem } from '../../types/candidate';

interface InterviewAnswerSectionProps {
  questions: InterviewQuestionItem[];
  onUpdateQuestions: (updated: InterviewQuestionItem[]) => void;
}

export const InterviewAnswerSection: React.FC<InterviewAnswerSectionProps> = ({
  questions,
  onUpdateQuestions,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswerText, setNewAnswerText] = useState('');
  const [newCategory, setNewCategory] = useState<
    'Technical' | 'Architecture' | 'Behavioral' | 'Problem Solving'
  >('Technical');
  const [newResponseTime, setNewResponseTime] = useState<number>(45);

  const handleAnswerChange = (id: string, text: string) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, answerText: text } : q));
    onUpdateQuestions(updated);
  };

  const handleResponseTimeChange = (id: string, seconds: number) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, responseTimeSeconds: seconds } : q
    );
    onUpdateQuestions(updated);
  };

  const handleCategoryChange = (
    id: string,
    category: 'Technical' | 'Architecture' | 'Behavioral' | 'Problem Solving'
  ) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, category } : q));
    onUpdateQuestions(updated);
  };

  const handleDeleteQuestion = (id: string) => {
    const remaining = questions.filter((q) => q.id !== id);
    // Re-index question numbers
    const reindexed = remaining.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    onUpdateQuestions(reindexed);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQuestion: InterviewQuestionItem = {
      id: `q-${Date.now()}`,
      questionNumber: questions.length + 1,
      questionText: newQuestionText.trim(),
      answerText: newAnswerText.trim(),
      category: newCategory,
      responseTimeSeconds: newResponseTime || 45,
    };

    onUpdateQuestions([...questions, newQuestion]);
    setNewQuestionText('');
    setNewAnswerText('');
    setShowAddForm(false);
  };

  const calculateMetrics = (text: string) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { chars, words };
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-6 hover:border-slate-700/80 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Interview Responses
              </h3>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.2 rounded">
                {questions.length} Staged Answers
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review transcripts, verify response duration metadata, and adjust question sets for analysis
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Interview Question</span>
        </button>
      </div>

      {/* Add New Question Form (collapsible) */}
      {showAddForm && (
        <form
          onSubmit={handleAddQuestion}
          className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-mono">
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              New Interview Question Block (Q{questions.length + 1})
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] text-slate-300 font-medium">Question Prompt:</label>
              <input
                type="text"
                required
                placeholder="e.g. Describe your experience with TypeScript generics..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium">Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/60"
              >
                <option value="Technical">Technical</option>
                <option value="Architecture">Architecture</option>
                <option value="Problem Solving">Problem Solving</option>
                <option value="Behavioral">Behavioral</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300 font-medium">Candidate Answer Transcript:</label>
            <textarea
              rows={3}
              placeholder="Candidate verbal response transcript or notes..."
              value={newAnswerText}
              onChange={(e) => setNewAnswerText(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-400 font-mono text-[11px]">Est. Response Time (sec):</label>
              <input
                type="number"
                min={5}
                max={600}
                value={newResponseTime}
                onChange={(e) => setNewResponseTime(Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-colors"
            >
              Add Question
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q) => {
          const { chars, words } = calculateMetrics(q.answerText);

          return (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 transition-all space-y-3"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                    Q{q.questionNumber}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    {q.questionText}
                  </h4>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <select
                    value={q.category}
                    onChange={(e) => handleCategoryChange(q.id, e.target.value as any)}
                    className="px-2 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300 rounded focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Problem Solving">Problem Solving</option>
                    <option value="Behavioral">Behavioral</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                    title="Remove question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Answer Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Candidate Response Transcript (Editable):</span>
                  <span>Recruiter verified</span>
                </div>
                <textarea
                  rows={3}
                  value={q.answerText}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Enter candidate answer..."
                  className="w-full p-3 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 leading-relaxed font-normal"
                />
              </div>

              {/* Answer Metadata Row */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Response Time:</span>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={q.responseTimeSeconds || 40}
                      onChange={(e) =>
                        handleResponseTimeChange(q.id, Number(e.target.value))
                      }
                      className="w-12 px-1.5 py-0.5 text-center bg-slate-900 border border-slate-700 rounded text-cyan-300 text-[11px] focus:outline-none focus:border-cyan-500/60"
                    />
                    <span>sec</span>
                  </div>

                  <span className="text-slate-700 hidden sm:inline">·</span>

                  <div className="flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Length: <strong className="text-slate-300 font-medium">{chars}</strong> chars (
                      <strong className="text-slate-300 font-medium">{words}</strong> words)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <Tag className="w-3 h-3 text-cyan-500" />
                  <span>Category: {q.category}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
