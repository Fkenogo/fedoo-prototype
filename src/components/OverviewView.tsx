import React, { useMemo } from 'react';
import {
  QrCode,
  Sparkles,
  ArrowRight,
  MessageSquare,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  Measure,
  ServiceSignal,
  Location,
  Endpoint,
  FeedbackSession,
  NeedsReviewItem,
  AppTab,
} from '../types';
import { AttentionReferencePanel } from './AttentionReferencePanel';
import { summarizeDistribution, comparisonAvailable, resolveRecency } from '../utils/feedbackUtils';

interface OverviewViewProps {
  organisationName?: string;
  currentScope: string;
  scopeLocationName: string;
  locations: Location[];
  measures: Measure[];
  signals: Record<string, ServiceSignal>;
  endpoints: Endpoint[];
  recentSessions: FeedbackSession[];
  needsReviewItems: NeedsReviewItem[];
  onSelectMeasure: (measureId: string) => void;
  onNavigateTab: (tab: AppTab) => void;
  onSelectEndpoint: (endpointId: string) => void;
  onStartSetup: () => void;
  onCreateFeedbackPoint?: () => void;
  onTestAsCustomer?: () => void;
  // REFERENCE ONLY: renders the future-state Attention interaction for
  // prototype review. Default false — never part of the adopted production
  // Overview. Attention semantics remain separately governed.
  showAttentionReference?: boolean;
  // Founder review tooling: force the no-evidence experience state.
  noEvidenceOverride?: boolean;
}

// Read-only period context for this experience-reference stage. The prototype
// fixtures are not period-filtered, so no interactive selector is offered (it
// would imply filtering that does not occur). This is deliberately structured
// as a single source of truth so an authoritative period selector can replace
// it once production read models provide period-specific evidence.
const PERIOD_CONTEXT_LABEL = 'Last 30 days';

// Overview: a calm operating picture of customer feedback. It presents
// factual evidence only — no universal score, no benchmark, no causality, no
// recommendations, no Improving/Declining labels, no Attention status.
export const OverviewView: React.FC<OverviewViewProps> = ({
  organisationName,
  currentScope,
  scopeLocationName,
  locations,
  measures,
  signals,
  endpoints,
  recentSessions,
  needsReviewItems,
  onSelectMeasure,
  onNavigateTab,
  onSelectEndpoint,
  onStartSetup,
  onCreateFeedbackPoint,
  onTestAsCustomer,
  showAttentionReference = false,
  noEvidenceOverride = false,
}) => {
  const periodLabel = PERIOD_CONTEXT_LABEL;

  const filteredEndpoints = currentScope === 'all'
    ? endpoints
    : endpoints.filter((e) => e.locationId === currentScope);

  const filteredSessions = currentScope === 'all'
    ? recentSessions
    : recentSessions.filter((s) => s.locationId === currentScope);

  const filteredNeedsReview = currentScope === 'all'
    ? needsReviewItems
    : needsReviewItems.filter((item) => item.locationId === currentScope);

  const totalResponses = noEvidenceOverride
    ? 0
    : filteredEndpoints.reduce((sum, ep) => sum + ep.totalResponses, 0);
  const activeEndpointsCount = filteredEndpoints.filter((e) => e.status === 'active').length;
  const locationsRepresented = new Set(filteredEndpoints.map((e) => e.locationId)).size;

  // Most recent available fixture timestamp in scope. Only claim "latest" when
  // every candidate timestamp can be reliably ordered; otherwise fall back to
  // a neutral recency line. Never shown when there is no evidence.
  const recency = useMemo(
    () =>
      resolveRecency([
        ...filteredEndpoints.map((e) => e.lastResponseAt),
        ...filteredSessions.map((s) => s.timestamp),
      ]),
    [filteredEndpoints, filteredSessions]
  );

  const activeMeasureIds = Array.from(new Set(filteredEndpoints.flatMap((e) => e.activeMeasureIds)));
  const activeMeasures = measures.filter((m) => activeMeasureIds.includes(m.id));

  const signalFor = (measureId: string) =>
    signals[`${measureId}_${currentScope}`] || signals[`${measureId}_all`];

  const measured = useMemo(
    () =>
      activeMeasures.map((measure) => {
        const signal = signalFor(measure.id);
        const summary = summarizeDistribution(measure, noEvidenceOverride ? undefined : signal);
        const available = !noEvidenceOverride && comparisonAvailable(signal);
        return { measure, signal, summary, available };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeMeasures, signals, currentScope, noEvidenceOverride]
  );

  const withComparison = measured.filter((m) => m.available && m.summary.total > 0);

  // No-evidence override must be internally consistent: no comments shown.
  const commentSessions = noEvidenceOverride
    ? []
    : filteredSessions.filter((s) => s.optionalComment);

  // EMPTY: no Feedback Points at all → first setup CTA (unchanged intent).
  if (endpoints.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Start hearing from your customers
          </h2>
          <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed mb-8">
            You don't have any Feedback Points set up yet. Create your first Feedback Point to
            generate a QR code and start collecting customer feedback.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() =>
                onCreateFeedbackPoint ? onCreateFeedbackPoint() : onNavigateTab('feedback-points')
              }
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Create first Feedback Point</span>
            </button>
            <button
              onClick={onStartSetup}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run guided setup</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* A. SCOPE + PERIOD */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
            <div className="flex items-center gap-2 mt-1 text-sm">
              {organisationName && (
                <>
                  <span className="font-bold text-slate-900">{organisationName}</span>
                  <span className="text-slate-300">·</span>
                </>
              )}
              <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                {scopeLocationName}
              </span>
            </div>
          </div>

          {/* Period context (read-only at this stage — not a filter control) */}
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">{periodLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* REFERENCE ONLY — Attention (default off, separately governed). */}
      {showAttentionReference && (
        <AttentionReferencePanel items={filteredNeedsReview} onSelectMeasure={onSelectMeasure} />
      )}

      {/* B. FEEDBACK ACTIVITY (or no-feedback state) */}
      {totalResponses === 0 ? (
        <section className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Waiting for your first feedback
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            Your Feedback Points are ready. Share the QR code or customer link to start hearing
            from customers.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigateTab('feedback-points')}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>View Feedback Points</span>
            </button>
            {onTestAsCustomer && (
              <button
                onClick={onTestAsCustomer}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
              >
                Test as customer
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">Customer feedback</h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {totalResponses}
            </span>
            <span className="text-sm text-slate-600 font-medium">
              {totalResponses === 1 ? 'response' : 'responses'}
            </span>
            <span className="text-xs text-slate-400">
              across {activeEndpointsCount} active Feedback Point
              {activeEndpointsCount === 1 ? '' : 's'} · {periodLabel}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>
              {locationsRepresented} Location{locationsRepresented === 1 ? '' : 's'} represented
            </span>
            {recency.kind === 'latest' && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Latest feedback {recency.label}
              </span>
            )}
            {recency.kind === 'recent' && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Recent feedback received
              </span>
            )}
          </div>
        </section>
      )}

      {/* C. CUSTOMER EXPERIENCE AREAS */}
      {totalResponses > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Customer experience</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                What customers have told you about the areas you're tracking.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('what-we-track')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 shrink-0"
            >
              <span>What We Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {measured.map(({ measure, signal, summary, available }) => {
              const hasEvidence = summary.total > 0;
              const delta = signal?.movement?.deltaPoints;

              return (
                <div
                  key={measure.id}
                  onClick={() => onSelectMeasure(measure.id)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-600/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                      {measure.name}
                    </h3>

                    {hasEvidence ? (
                      <>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {summary.favourablePct}%
                          </span>
                          <span className="text-xs text-slate-500 font-medium">favourable</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {summary.total} response{summary.total === 1 ? '' : 's'}
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 text-sm font-semibold text-slate-500">
                        No feedback yet
                      </div>
                    )}
                  </div>

                  {hasEvidence && (
                    <div className="space-y-2">
                      {/* Distribution bar */}
                      <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-100">
                        <div
                          className="h-full bg-emerald-600"
                          style={{ width: `${summary.favourablePct}%` }}
                        />
                        <div
                          className="h-full bg-slate-300"
                          style={{ width: `${summary.middlePct}%` }}
                        />
                        <div
                          className="h-full bg-slate-400"
                          style={{ width: `${summary.unfavourablePct}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        Favourable {summary.favourablePct}% · Middle {summary.middlePct}% ·
                        Unfavourable {summary.unfavourablePct}%
                      </div>

                      {/* Movement — factual raw pp only, when valid */}
                      {available && delta !== undefined ? (
                        <div className="text-[11px] font-semibold text-slate-700">
                          {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}pp vs previous period
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          Not enough feedback to compare periods yet
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <span className="text-xs font-bold text-emerald-800 group-hover:text-emerald-950 flex items-center gap-0.5">
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* D. RECENT MOVEMENT (only where comparison is valid) */}
      {totalResponses > 0 && withComparison.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent movement</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Change from the previous comparable period, where a comparison is available.
            </p>
          </div>
          <div className="space-y-2">
            {withComparison.map(({ measure, signal }) => {
              const delta = signal?.movement?.deltaPoints ?? 0;
              return (
                <button
                  key={measure.id}
                  onClick={() => onSelectMeasure(measure.id)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-emerald-600/40 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-slate-800">{measure.name}</span>
                  <span className="text-xs font-bold text-slate-700 shrink-0">
                    {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}pp vs previous period
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* E + F: RECENT COMMENTS + FEEDBACK POINT COLLECTION STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Recent comments</h2>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>View all activity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {commentSessions.slice(0, 4).map((session) => {
              const loc = locations.find((l) => l.id === session.locationId);
              const ep = endpoints.find((e) => e.id === session.endpointId);
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-800">
                      {loc?.name}
                      {ep ? ` · ${ep.humanName}` : ''}
                    </span>
                    <span className="text-[11px]">{session.timestamp}</span>
                  </div>
                  <p className="text-slate-800 font-medium italic leading-relaxed">
                    "{session.optionalComment}"
                  </p>
                </div>
              );
            })}

            {commentSessions.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                {noEvidenceOverride
                  ? 'No customer comments yet.'
                  : 'No customer comments yet in this scope.'}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Feedback Points</h2>
            <p className="text-xs text-slate-500 mb-4">Where feedback is being collected.</p>

            <div className="space-y-2.5">
              {filteredEndpoints.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => onSelectEndpoint(ep.id)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs text-slate-900 truncate">{ep.humanName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {ep.status === 'paused'
                        ? 'Paused'
                        : noEvidenceOverride
                        ? 'No responses yet'
                        : `${ep.totalResponses} response${ep.totalResponses === 1 ? '' : 's'}`}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      ep.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ep.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('feedback-points')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Manage Feedback Points</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
