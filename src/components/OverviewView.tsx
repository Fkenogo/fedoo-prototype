import React from 'react';
import { 
  Minus, 
  ArrowRight, 
  QrCode, 
  Sparkles
} from 'lucide-react';
import { 
  Measure, 
  ServiceSignal, 
  Location, 
  Endpoint, 
  FeedbackSession, 
  NeedsReviewItem,
  AppTab
} from '../types';
import { AttentionReferencePanel } from './AttentionReferencePanel';

interface OverviewViewProps {
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
  // Opens the Pass 2 guided First Feedback Point flow. When omitted, the
  // empty-state primary CTA falls back to the Feedback Points tab.
  onCreateFeedbackPoint?: () => void;
  // REFERENCE ONLY: renders the future-state Attention interaction for
  // prototype review. Default false — never part of the adopted production
  // Overview. Enabled exclusively via prototype review tooling.
  showAttentionReference?: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
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
  showAttentionReference = false,
}) => {
  // Filter endpoints and sessions to the current scope
  const filteredEndpoints = currentScope === 'all' 
    ? endpoints 
    : endpoints.filter((e) => e.locationId === currentScope);

  const filteredSessions = currentScope === 'all'
    ? recentSessions
    : recentSessions.filter((s) => s.locationId === currentScope);

  const filteredNeedsReview = currentScope === 'all'
    ? needsReviewItems
    : needsReviewItems.filter((item) => item.locationId === currentScope);

  const totalResponses = filteredEndpoints.reduce((sum, ep) => sum + ep.totalResponses, 0);
  const activeEndpointsCount = filteredEndpoints.filter((e) => e.status === 'active').length;

  // Active measures tracked in this scope
  const activeMeasureIds = Array.from(
    new Set(filteredEndpoints.flatMap((e) => e.activeMeasureIds))
  );
  const activeMeasures = measures.filter((m) => activeMeasureIds.includes(m.id));

  // EMPTY STATE: If no feedback points or responses exist
  if (endpoints.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Start Hearing from Your Customers
          </h2>
          <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed mb-8">
            You don't have any feedback points set up yet. Create your first feedback point to generate a QR code and start collecting customer feedback.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() =>
                onCreateFeedbackPoint
                  ? onCreateFeedbackPoint()
                  : onNavigateTab('feedback-points')
              }
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Create First Feedback Point</span>
            </button>
            <button
              onClick={onStartSetup}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Guided Setup</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. CURRENT SERVICE PICTURE: Headline Banner */}
      <section aria-labelledby="service-picture-heading" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Service Picture • {scopeLocationName}
              </span>
            </div>

            <h1 id="service-picture-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalResponses === 0 ? (
                'Waiting for your first responses'
              ) : (
                'Customer feedback for this scope'
              )}
            </h1>

            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              {totalResponses === 0 ? (
                'Your feedback points are active. Place table stands or share your direct link to start collecting ratings.'
              ) : (
                `Based on ${totalResponses} customer responses across ${activeEndpointsCount} feedback points in this scope and period. Figures are factual counts; this heading makes no analytical claim.`
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shrink-0">
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {totalResponses}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Total Responses
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-2xl font-black text-emerald-700 leading-none">
                {activeEndpointsCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Active Points
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ATTENTION REFERENCE (REFERENCE ONLY — excluded from adopted default).
          Rendered exclusively via prototype review tooling (showAttentionReference).
          Future-state Attention interaction; non-authoritative; requires a later
          Founder/Product decision with governed Attention semantics before any
          production inclusion. */}
      {showAttentionReference && (
        <AttentionReferencePanel
          items={filteredNeedsReview}
          onSelectMeasure={onSelectMeasure}
        />
      )}

      {/* 3. WHAT WE TRACK: Individual Measure Cards */}
      <section aria-labelledby="measures-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="measures-heading" className="text-base font-bold text-slate-900">
              What We're Tracking
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual service aspects measured across customer feedback points
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('what-we-track')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Manage Measures</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMeasures.map((measure) => {
            const signalKey = `${measure.id}_${currentScope}`;
            const fallbackKey = `${measure.id}_all`;
            const signal = signals[signalKey] || signals[fallbackKey];

            const favourable = signal?.favourablePercentage;
            const evidence = signal?.evidenceLevel || 'none';
            const movement = signal?.movement;

            return (
              <div
                key={measure.id}
                onClick={() => onSelectMeasure(measure.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-600/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {measure.category}
                    </span>
                    {/* Evidence facts (governed): exact counts, no quality score */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      evidence === 'sufficient'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : evidence === 'limited'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {signal?.responseCount || 0} responses
                      {evidence === 'none' ? ' • no evidence' : ''}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                    {measure.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {measure.shortDescription}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {favourable !== null && favourable !== undefined ? (
                          `${favourable}%`
                        ) : (
                          <span className="text-slate-400 text-lg font-bold">—</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Favourable ratings ({signal?.responseCount || 0} responses)
                      </div>
                    </div>

                    {/* Factual period movement (governed): raw pp delta only.
                        Prototype simulation — comparison requires N>=10 in BOTH
                        periods; otherwise "comparison unavailable". No
                        Improving/Declining/Stable or material-movement labels. */}
                    {movement && movement.direction !== 'unavailable' && movement.deltaPoints !== undefined && (
                      <div
                        title={movement.comparedToLabel ? `${movement.comparedToLabel}. Comparison requires N≥10 in both periods (prototype simulation).` : 'Prototype simulation — comparison requires N≥10 in both periods.'}
                        className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>
                          {movement.deltaPoints > 0 ? `+${movement.deltaPoints}` : movement.deltaPoints}pp
                        </span>
                      </div>
                    )}
                    {movement && movement.direction !== 'unavailable' && movement.deltaPoints === undefined && (
                      <div className="text-[10px] font-semibold text-slate-400">
                        comparison unavailable
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. RECENT ACTIVITY & COLLECTION HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Feedback Notes Stream */}
        <section aria-labelledby="recent-feedback-heading" className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id="recent-feedback-heading" className="text-base font-bold text-slate-900">
                Recent Customer Comments
              </h2>
              <p className="text-xs text-slate-500">
                Direct thoughts shared by customers on their visits
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>View All Activity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {filteredSessions.filter((s) => s.optionalComment).slice(0, 3).map((session) => {
              const loc = locations.find((l) => l.id === session.locationId);
              const ep = endpoints.find((e) => e.id === session.endpointId);
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{loc?.name}</span>
                      <span>•</span>
                      <span>{ep?.humanName}</span>
                    </div>
                    <span className="text-[11px]">{session.timestamp}</span>
                  </div>
                  <p className="text-slate-800 font-medium italic leading-relaxed">
                    "{session.optionalComment}"
                  </p>
                </div>
              );
            })}

            {filteredSessions.filter((s) => s.optionalComment).length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No customer comments received yet for this scope.
              </div>
            )}
          </div>
        </section>

        {/* Feedback Points Collection Summary */}
        <section aria-labelledby="feedback-points-heading" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 id="feedback-points-heading" className="text-base font-bold text-slate-900 mb-1">
              Feedback Points
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Where customers can scan and share their thoughts
            </p>

            <div className="space-y-2.5">
              {filteredEndpoints.slice(0, 3).map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => onSelectEndpoint(ep.id)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {ep.humanName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {ep.totalResponses} responses • {ep.activeMeasureIds.length} questions
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    ep.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
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
