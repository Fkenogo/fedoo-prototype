import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  MessageSquare,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { Endpoint, Location, Measure, FeedbackAnswer, FeedbackSession } from '../types';
import { SCALE_DEFINITIONS } from '../data/mockData';

interface ParticipantSimulatorProps {
  endpoint: Endpoint;
  location: Location;
  measures: Measure[];
  onClose: () => void;
  onSubmitFeedback: (session: FeedbackSession) => void;
  organisationName: string;
}

export const ParticipantSimulator: React.FC<ParticipantSimulatorProps> = ({
  endpoint,
  location,
  measures,
  onClose,
  onSubmitFeedback,
  organisationName,
}) => {
  // Only ask questions for the measures active on this endpoint
  const activeMeasures = measures.filter((m) => endpoint.activeMeasureIds.includes(m.id));

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; scoreIndex: number }>>({});
  const [optionalComment, setOptionalComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Total steps: activeMeasures.length + 1 (optional comment & review)
  const currentMeasure = activeMeasures[currentStepIndex];
  const isCommentStep = currentStepIndex === activeMeasures.length;

  const currentScaleOptions = currentMeasure ? SCALE_DEFINITIONS[currentMeasure.scaleFamily] : [];

  const handleSelectOption = (value: string, scoreIndex: number) => {
    if (!currentMeasure) return;

    setAnswers((prev) => ({
      ...prev,
      [currentMeasure.id]: { value, scoreIndex },
    }));

    // Automatically advance to next question smoothly after a brief pause
    setTimeout(() => {
      if (currentStepIndex < activeMeasures.length) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }, 180);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedAnswers: FeedbackAnswer[] = activeMeasures.map((m) => {
      const ans = answers[m.id] || { value: 'Good', scoreIndex: 4 };
      return {
        measureId: m.id,
        questionText: m.standardQuestion,
        selectedValue: ans.value,
        scoreIndex: ans.scoreIndex,
      };
    });

    const session: FeedbackSession = {
      id: `sess-${Date.now().toString().slice(-4)}`,
      endpointId: endpoint.id,
      locationId: location.id,
      timestamp: 'Just now',
      answers: formattedAnswers,
      optionalComment: optionalComment.trim() || undefined,
      channel: 'qr',
    };

    onSubmitFeedback(session);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Container simulating a mobile phone viewport */}
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] border-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col min-h-[620px] max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Phone Top Notch / Speaker bar */}
        <div className="bg-slate-900 pt-3 pb-2 px-6 flex justify-between items-center text-slate-400 text-[10px]">
          <span className="font-semibold text-slate-300">9:41</span>
          <div className="w-16 h-3.5 bg-slate-950 rounded-full" />
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-slate-400" />
            <div className="w-3.5 h-2 rounded-xs border border-slate-400" />
          </div>
        </div>

        {/* Customer Header */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
              F
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{organisationName}</div>
              <div className="text-[10px] text-slate-500">{location.name}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
            title="Exit simulator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle Progress Bar */}
        {!isSubmitted && (
          <div className="h-1 w-full bg-slate-100">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / (activeMeasures.length + 1)) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Feedback Body */}
        <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
          {!isSubmitted ? (
            !isCommentStep && currentMeasure ? (
              /* Single Question View */
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span>Question {currentStepIndex + 1} of {activeMeasures.length}</span>
                    <span className="text-emerald-700 font-medium">Quick ~30s</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {currentMeasure.standardQuestion}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tap your honest rating below:
                  </p>
                </div>

                {/* 5-Point Tactile Scale Options */}
                <div className="space-y-2 pt-1">
                  {currentScaleOptions.map((opt) => {
                    const isSelected = answers[currentMeasure.id]?.value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOption(opt.value, opt.scoreIndex)}
                        className={`w-full py-3 px-4 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between active:scale-98 ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                        }`}
                      >
                        <span>{opt.value}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-white bg-emerald-500' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Back / Skip buttons */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  {currentStepIndex > 0 ? (
                    <button
                      onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                  ) : <div />}

                  <button
                    onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                    className="text-slate-400 hover:text-slate-700 font-medium text-[11px]"
                  >
                    Skip question
                  </button>
                </div>
              </div>
            ) : (
              /* Optional Short Comment Step */
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                    Almost Done
                  </div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    Anything specific you'd like the team to know?
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Optional note about your visit today.
                  </p>
                </div>

                <textarea
                  rows={3}
                  placeholder="e.g. Great coffee, loved the music, wait was slightly long..."
                  value={optionalComment}
                  onChange={(e) => setOptionalComment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                  <span>Doorway: <strong>{endpoint.humanName}</strong></span>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Submit Feedback</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center"
                  >
                    Review questions
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Gracious Completion Screen */
            <div className="text-center py-8 space-y-4 my-auto animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Thank you!</h3>
                <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Your feedback has been recorded and immediately translated into service signals for <strong>{organisationName}</strong>.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-400">
                  Fedoo Service Feedback Infrastructure
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Phone Bottom Home Bar */}
        <div className="bg-white py-2 flex justify-center">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
