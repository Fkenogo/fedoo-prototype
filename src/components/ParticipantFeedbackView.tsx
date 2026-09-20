import React, { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  Send,
  RotateCcw,
  AlertCircle,
  Info,
  Globe,
  X,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import {
  Endpoint,
  Location,
  Organisation,
  Measure,
  FeedbackAnswer,
  FeedbackSession,
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
  // Organisation-side preview: shows a clearly separate banner and never
  // persists a response. The participant UI beneath is otherwise the same.
  previewMode?: boolean;
  // Founder-review overrides (prototype tooling only; never production).
  overrideStatus?: 'active' | 'paused' | null;
  unavailable?: boolean;
  channel?: 'qr' | 'link' | 'whatsapp' | 'sms';
}

type Phase = 'entry' | 'questions' | 'comment' | 'done';

function durationEstimate(count: number): string {
  if (count <= 3) return 'About 30 seconds';
  if (count <= 5) return 'About 45 seconds';
  return 'About 1 minute';
}

// Maps the Organisation's configured customer languages to the prototype's
// supported variants. [PROTOTYPE ONLY] Product Truth supplies approved
// language variants; unsupported languages are simply not offered here.
function supportedLanguages(organisation?: Organisation, fallback?: string): ('en' | 'fr')[] {
  const configured: string[] =
    organisation?.feedbackLanguages ?? organisation?.onboardingData?.feedbackLanguages ?? [];
  const mapped: ('en' | 'fr')[] = [];
  configured.forEach((label) => {
    const l = label.toLowerCase();
    if (l.startsWith('english') && !mapped.includes('en')) mapped.push('en');
    if ((l.startsWith('french') || l.startsWith('fran')) && !mapped.includes('fr')) mapped.push('fr');
  });
  if (mapped.length > 0) return mapped;
  return fallback === 'fr' ? ['fr'] : ['en'];
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
  viewMode = 'standalone',
  previewMode = false,
  overrideStatus = null,
  unavailable = false,
  channel = 'qr',
}) => {
  const [phase, setPhase] = useState<Phase>('entry');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; scoreIndex: number }>>({});
  const [optionalComment, setOptionalComment] = useState('');
  const [language, setLanguage] = useState<'en' | 'fr'>(primaryLanguage);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const submittedRef = useRef(false);

  const resolvedOrgName = organisation?.name || organisationName || 'Service Provider';
  const resolvedLocName = location?.name || locationName || 'Location';
  const handleExit = onExit || onClose || (() => {});
  const handleSubmitSession = onRecordSession || onSubmitFeedback || (() => {});

  const languages = useMemo(
    () => supportedLanguages(organisation, primaryLanguage),
    [organisation, primaryLanguage]
  );
  const showLanguageSelector = languages.length > 1;

  // [PROTOTYPE ASSUMPTION — Product Truth realignment]: the browser never
  // defines scales or questions. Production resolves the governed Effective
  // Session Composition from the Endpoint. This simulates that from local
  // fixtures only.
  const activeMeasures = measures.filter((m) => endpoint.activeMeasureIds.includes(m.id));

  const effectiveStatus = overrideStatus ?? endpoint.status;
  const isPaused = effectiveStatus === 'paused';
  const hasNoQuestions = activeMeasures.length === 0;

  const currentMeasure = activeMeasures[currentQuestionIndex];
  const totalQuestions = activeMeasures.length;

  const scaleOptions = currentMeasure
    ? SCALE_DEFINITIONS[currentMeasure.scaleFamily] || SCALE_DEFINITIONS.quality
    : [];

  const currentAnswer = currentMeasure ? answers[currentMeasure.id] : undefined;

  const selectOption = (value: string, scoreIndex: number) => {
    if (!currentMeasure) return;
    setAnswers((prev) => ({ ...prev, [currentMeasure.id]: { value, scoreIndex } }));
  };

  const goNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setPhase('comment');
    }
  };

  const goBack = () => {
    if (phase === 'comment') {
      setPhase('questions');
      setCurrentQuestionIndex(totalQuestions - 1);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    } else {
      setPhase('entry');
    }
  };

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    if (!previewMode) {
      const formattedAnswers: FeedbackAnswer[] = Object.keys(answers).map((mId) => {
        const m = measures.find((item) => item.id === mId);
        const data = answers[mId];
        return {
          measureId: mId,
          questionText: m?.name || 'Service rating',
          selectedValue: data.value,
          scoreIndex: data.scoreIndex,
        };
      });

      handleSubmitSession({
        id: `sess-${Date.now().toString().slice(-4)}`,
        endpointId: endpoint.id,
        locationId: endpoint.locationId,
        timestamp: 'Just now',
        channel,
        optionalComment: optionalComment.trim() || undefined,
        answers: formattedAnswers,
      });
    }

    setPhase('done');
    window.scrollTo({ top: 0 });
  };

  const restartPreview = () => {
    submittedRef.current = false;
    setPhase('entry');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setOptionalComment('');
    window.scrollTo({ top: 0 });
  };

  // -------------------------------------------------------------------------
  // Organisation / Location context header
  // -------------------------------------------------------------------------
  const contextHeader = (
    <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0">
        {resolvedOrgName.charAt(0)}
      </div>
      <div className="min-w-0">
        <div className="font-bold text-slate-900 text-sm truncate">{resolvedOrgName}</div>
        <div className="text-[11px] text-slate-500 truncate">{resolvedLocName}</div>
      </div>
    </div>
  );

  const footer = (
    <div className="px-5 py-3 text-center text-[10px] text-slate-400">
      Powered by Fedoo
    </div>
  );

  // -------------------------------------------------------------------------
  // States that stop the flow
  // -------------------------------------------------------------------------
  const renderBlocked = () => {
    if (unavailable) {
      return (
        <StateMessage
          icon={<Link2 className="w-8 h-8" />}
          title="This feedback link isn't available"
          body="Please check the link or ask the business for a current feedback option."
        />
      );
    }
    if (isPaused) {
      return (
        <StateMessage
          icon={<AlertCircle className="w-8 h-8" />}
          title="Feedback is not available right now"
          body="This feedback link is currently paused. Please try again later."
        />
      );
    }
    if (hasNoQuestions) {
      return (
        <StateMessage
          icon={<AlertCircle className="w-8 h-8" />}
          title="Feedback isn't available right now"
          body="Please try again later."
        />
      );
    }
    return null;
  };

  const blocked = renderBlocked();

  // -------------------------------------------------------------------------
  // Entry
  // -------------------------------------------------------------------------
  const renderEntry = () => (
    <div className="px-5 py-8 space-y-6 animate-in fade-in">
      <div className="space-y-3">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          How was your experience at {resolvedLocName}?
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Share a few quick answers to help the team understand your experience.
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
          {durationEstimate(totalQuestions)}
        </div>
      </div>

      {showLanguageSelector && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <Globe className="w-3.5 h-3.5" />
            <span>Language</span>
          </div>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  language === lang
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                }`}
              >
                {lang === 'en' ? 'English' : 'Français'}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setPhase('questions')}
        className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md transition-colors"
      >
        Start feedback
      </button>

      <div className="space-y-2 pt-1">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          No sign-in required. Your answers are used to help this business understand the service
          experience.
        </p>
        <button
          onClick={() => setShowPrivacy(true)}
          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Learn about feedback &amp; privacy</span>
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Questions
  // -------------------------------------------------------------------------
  const renderQuestion = () => {
    if (!currentMeasure) return null;
    const hasFr = Boolean(currentMeasure.standardQuestionFr);
    const questionText =
      language === 'fr' && hasFr
        ? currentMeasure.standardQuestionFr!
        : currentMeasure.standardQuestion;
    const frFallback = language === 'fr' && !hasFr;
    const progressPct = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    return (
      <div className="px-5 py-6 space-y-6 animate-in fade-in" key={currentMeasure.id}>
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            {currentQuestionIndex > 0 && (
              <button
                onClick={goBack}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>
          <div
            className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={totalQuestions}
            aria-valuenow={currentQuestionIndex + 1}
            aria-label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
          >
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-black text-slate-900 leading-snug">{questionText}</h2>

        {frFallback && previewMode && (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
            Preview note: no French fixture for this prototype question — showing English.
          </p>
        )}

        {/* Options */}
        <div className="space-y-2.5">
          {scaleOptions.map((opt) => {
            const isSelected = currentAnswer?.value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectOption(opt.value, opt.scoreIndex)}
                aria-pressed={isSelected}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all flex items-center justify-between gap-3 min-h-[56px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-700/40 ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-600/60 hover:bg-slate-50 active:scale-[0.99]'
                }`}
              >
                <span className="leading-snug">{opt.value}</span>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white text-emerald-800' : 'border border-slate-300'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Continue / skip */}
        <div className="space-y-3 pt-1">
          <button
            onClick={goNext}
            disabled={!currentAnswer}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-colors ${
              currentAnswer
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Continue' : 'Continue'}
          </button>
          <div className="text-center">
            <button
              onClick={goNext}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline"
            >
              Skip this question
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // Optional comment
  // -------------------------------------------------------------------------
  const answeredCount = Object.keys(answers).length;

  const renderComment = () => (
    <div className="px-5 py-6 space-y-6 animate-in fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 leading-snug">
          Anything else you'd like to share?
        </h2>
        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Optional</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Add a comment if there is something else you would like the team to know.
        </p>
      </div>

      <textarea
        rows={4}
        value={optionalComment}
        onChange={(e) => setOptionalComment(e.target.value)}
        placeholder="Add an optional comment"
        className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
      />
      <p className="text-[11px] text-slate-400 -mt-3">
        Please avoid including sensitive personal information.
      </p>

      <div className="space-y-3">
        <p className="text-[11px] text-slate-500 text-center">
          You've answered {answeredCount} {answeredCount === 1 ? 'question' : 'questions'}.
        </p>
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Submit feedback</span>
        </button>
        <div className="text-center">
          <button
            onClick={goBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Completion
  // -------------------------------------------------------------------------
  const renderDone = () => (
    <div className="px-5 py-12 text-center space-y-5 animate-in fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
      </div>

      {previewMode ? (
        <>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Preview complete</h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              This was a preview of the customer experience. No response was recorded.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={restartPreview}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart preview</span>
            </button>
            <button
              onClick={handleExit}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold"
            >
              Close preview
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Thank you</h2>
          <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Your feedback has been shared with {resolvedOrgName}.
          </p>
          <p className="text-xs text-slate-400">You can close this page now.</p>
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------------------
  // Body
  // -------------------------------------------------------------------------
  const renderBody = () => {
    if (blocked) return blocked;
    if (phase === 'entry') return renderEntry();
    if (phase === 'questions') return renderQuestion();
    if (phase === 'comment') return renderComment();
    return renderDone();
  };

  const innerApp = (
    <div
      className={`bg-white w-full max-w-md mx-auto flex flex-col overflow-hidden ${
        viewMode === 'phone'
          ? 'min-h-[580px]'
          : 'min-h-[100dvh] sm:min-h-0 sm:my-8 sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-xl'
      }`}
    >
      {previewMode && (
        <div className="bg-amber-500 text-amber-950 text-center text-[11px] font-bold py-2 px-4">
          Preview mode — responses are not recorded
        </div>
      )}

      {contextHeader}

      <div className="flex-1">{renderBody()}</div>

      {footer}
    </div>
  );

  const privacySheet = showPrivacy && (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/50 flex items-end sm:items-center justify-center"
      onClick={() => setShowPrivacy(false)}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            About this feedback
          </h2>
          <button
            onClick={() => setShowPrivacy(false)}
            className="text-slate-400 hover:text-slate-700 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <li>• Giving feedback is optional.</li>
          <li>• You do not need to create an account.</li>
          <li>• Your answers are shared with the Organisation using this Feedback Point.</li>
          <li>• Do not include sensitive personal information in the optional comment.</li>
        </ul>
        <button
          onClick={() => setShowPrivacy(false)}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );

  if (viewMode === 'phone') {
    return (
      <div className="min-h-screen bg-slate-100 py-6 px-4 flex flex-col items-center justify-center">
        <div className="w-[380px] max-w-full p-3 bg-slate-900 rounded-[48px] shadow-2xl border-4 border-slate-800">
          <div className="w-32 h-4 bg-slate-900 mx-auto rounded-b-xl mb-1" />
          <div className="rounded-[36px] overflow-hidden bg-white">{innerApp}</div>
        </div>
        {privacySheet}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {innerApp}
      {privacySheet}
    </div>
  );
};

const StateMessage: React.FC<{ icon: React.ReactNode; title: string; body: string }> = ({
  icon,
  title,
  body,
}) => (
  <div className="text-center py-16 px-6 space-y-4">
    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
      {icon}
    </div>
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">{body}</p>
  </div>
);
