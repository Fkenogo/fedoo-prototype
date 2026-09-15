import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  Send, 
  RotateCcw,
  AlertCircle,
  Building2,
  Heart
} from 'lucide-react';
import { 
  Endpoint, 
  Location, 
  Organisation, 
  Measure, 
  FeedbackAnswer, 
  FeedbackSession 
} from '../types';
import { SCALE_DEFINITIONS } from '../data/mockData';

interface ParticipantFeedbackViewProps {
  endpoint: Endpoint;
  location?: Location;
  locationName?: string;
  organisation?: Organisation;
  organisationName?: string;
  measures: Measure[];
  primaryLanguage?: 'en' | 'fr';
  onRecordSession?: (session: FeedbackSession) => void;
  onSubmitFeedback?: (session: FeedbackSession) => void;
  onExit?: () => void;
  onClose?: () => void;
  viewMode?: 'standalone' | 'phone';
}

export const ParticipantFeedbackView: React.FC<ParticipantFeedbackViewProps> = ({
  endpoint,
  location,
  locationName,
  organisation,
  organisationName,
  measures,
  primaryLanguage = 'en',
  onRecordSession,
  onSubmitFeedback,
  onExit,
  onClose,
  viewMode = 'phone',
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; scoreIndex: number }>>({});
  const [optionalComment, setOptionalComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resolvedOrgName = organisation?.name || organisationName || 'Service Provider';
  const resolvedLocName = location?.name || locationName || 'Venue';
  const handleExit = onExit || onClose || (() => {});
  const handleSubmitSession = onRecordSession || onSubmitFeedback || (() => {});

  // Active measures configured for this feedback point
  const activeMeasures = measures.filter((m) =>
    endpoint.activeMeasureIds.includes(m.id)
  );

  const isPaused = endpoint.status === 'paused';

  const currentMeasure = activeMeasures[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === activeMeasures.length - 1;

  // Get scale options for current measure
  const scaleOptions = currentMeasure
    ? SCALE_DEFINITIONS[currentMeasure.scaleFamily] || SCALE_DEFINITIONS.quality
    : [];

  const handleSelectOption = (value: string, scoreIndex: number) => {
    if (!currentMeasure) return;

    setAnswers((prev) => ({
      ...prev,
      [currentMeasure.id]: { value, scoreIndex },
    }));

    // Auto-advance after brief selection feedback
    setTimeout(() => {
      if (currentQuestionIndex < activeMeasures.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 280);
  };

  const handleFinalSubmit = () => {
    const formattedAnswers: FeedbackAnswer[] = Object.entries(answers).map(
      ([mId, data]: [string, { value: string; scoreIndex: number }]) => {
        const m = measures.find((item) => item.id === mId);
        return {
          measureId: mId,
          questionText: m?.name || 'Service rating',
          selectedValue: data.value,
          scoreIndex: data.scoreIndex,
        };
      }
    );

    const newSession: FeedbackSession = {
      id: `sess-${Date.now().toString().slice(-4)}`,
      endpointId: endpoint.id,
      locationId: endpoint.locationId,
      timestamp: 'Just now',
      channel: 'qr',
      optionalComment: optionalComment.trim() || undefined,
      answers: formattedAnswers,
    };

    handleSubmitSession(newSession);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setOptionalComment('');
    setIsSubmitted(false);
  };

  // Content render
  const renderContent = () => {
    // 1. Paused state
    if (isPaused) {
      return (
        <div className="text-center py-16 px-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Feedback Temporarily Paused
          </h2>
          <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            This feedback point is currently inactive while our team updates service settings. Thank you for your visit to {resolvedOrgName}!
          </p>
        </div>
      );
    }

    // 2. Completed / Thank You state
    if (isSubmitted) {
      return (
        <div className="text-center py-16 px-6 space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Thank You for Your Feedback
            </h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your ratings and thoughts go directly to our service team at {resolvedLocName}.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Submit Another Response (Test Mode)</span>
            </button>
          </div>
        </div>
      );
    }

    // 3. Optional Comment / Review step (after answering all questions)
    if (currentQuestionIndex >= activeMeasures.length) {
      return (
        <div className="py-8 px-6 space-y-6 max-w-md mx-auto animate-in fade-in">
          <div className="space-y-1 text-center">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Almost Done
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Any comments or details?
            </h2>
            <p className="text-xs text-slate-500">
              Optional • Tell our team what went well or what could be improved.
            </p>
          </div>

          <textarea
            rows={4}
            value={optionalComment}
            onChange={(e) => setOptionalComment(e.target.value)}
            placeholder="e.g. Our barista Sarah was wonderful! Coffee was hot and fresh."
            className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
          />

          <div className="space-y-3">
            <button
              onClick={handleFinalSubmit}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>

            <button
              onClick={() => setCurrentQuestionIndex(activeMeasures.length - 1)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Back to previous question
            </button>
          </div>
        </div>
      );
    }

    // 4. Active Question Step
    const questionText = primaryLanguage === 'fr' && currentMeasure.standardQuestionFr
      ? currentMeasure.standardQuestionFr
      : currentMeasure.standardQuestion;

    const currentAnswer = answers[currentMeasure.id];

    return (
      <div className="py-8 px-6 space-y-6 max-w-md mx-auto animate-in fade-in">
        {/* Step Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Question {currentQuestionIndex + 1} of {activeMeasures.length}</span>
            <span className="text-emerald-700 font-bold">{currentMeasure.name}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / activeMeasures.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Heading */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
            {questionText}
          </h2>
          <p className="text-xs text-slate-500">
            Please tap the choice that best matches your experience.
          </p>
        </div>

        {/* 5-Point Rating Options */}
        <div className="space-y-2.5">
          {scaleOptions.map((opt) => {
            const isSelected = currentAnswer?.value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelectOption(opt.value, opt.scoreIndex)}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all flex items-center justify-between min-h-[52px] ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm scale-[1.01]'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-600/60 hover:bg-slate-50 active:scale-[0.99]'
                }`}
              >
                <span>{opt.value}</span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  isSelected ? 'bg-white text-emerald-800 font-black' : 'text-slate-300'
                }`}>
                  {isSelected ? '✓' : opt.scoreIndex}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Skip or Navigation */}
        <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
          {currentQuestionIndex > 0 ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="flex items-center gap-1 hover:text-slate-700 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : <div />}

          <button
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            className="hover:text-slate-700 font-semibold"
          >
            Skip this question →
          </button>
        </div>
      </div>
    );
  };

  // Shell Layout
  const innerApp = (
    <div className="bg-white min-h-[580px] flex flex-col justify-between rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-lg w-full mx-auto">
      {/* Participant Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center">
            {resolvedOrgName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs">
              {resolvedOrgName}
            </div>
            <div className="text-[11px] text-slate-500">
              {resolvedLocName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
            Fedoo
          </span>
          {onExit || onClose ? (
            <button
              onClick={handleExit}
              className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50"
              title="Return to Dashboard"
            >
              Exit
            </button>
          ) : null}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1">
        {renderContent()}
      </div>

      {/* Participant Footer */}
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-center text-[10px] text-slate-400">
        Private customer feedback • Powered by Fedoo
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 flex flex-col items-center justify-center">
      {/* View Mode Wrapper */}
      {viewMode === 'phone' ? (
        <div className="w-[380px] p-3 bg-slate-900 rounded-[48px] shadow-2xl border-4 border-slate-800">
          <div className="w-32 h-4 bg-slate-900 mx-auto rounded-b-xl mb-1" />
          <div className="rounded-[36px] overflow-hidden bg-white">
            {innerApp}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl">
          {innerApp}
        </div>
      )}
    </div>
  );
};
