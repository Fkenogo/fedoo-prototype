import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Info,
  Plus,
  QrCode,
  ChevronRight,
} from 'lucide-react';
import { Measure, ServiceSignal, Location, FeedbackSession, Endpoint } from '../types';
import { summarizeDistribution, comparisonAvailable } from '../utils/feedbackUtils';

interface MeasureDetailViewProps {
  measure: Measure;
  currentScope: string;
  scopeLocationName: string;
  locations: Location[];
  endpoints: Endpoint[];
  signals: Record<string, ServiceSignal>;
  recentSessions: FeedbackSession[];
  onBack: () => void;
  onAddToAnotherFeedbackPoint: (measureId: string) => void;
  onStopTrackingAt: (endpointId: string, measureId: string) => void;
  onOpenFeedbackPoint: (endpointId: string) => void;
}

// Business-facing area detail. The Organisation sees what an area helps them
// understand, where it is being listened for, a representative (read-only)
// customer question, and factual evidence. No editable question, no scale,
// no configuration lineage.
export const MeasureDetailView: React.FC<MeasureDetailViewProps> = ({
  measure,
  currentScope,
  scopeLocationName,
  locations,
  endpoints,
  signals,
  recentSessions,
  onBack,
  onAddToAnotherFeedbackPoint,
  onStopTrackingAt,
  onOpenFeedbackPoint,
}) => {
  const [stoppingEndpointId, setStoppingEndpointId] = useState<string | null>(null);

  const signalKey = `${measure.id}_${currentScope}`;
  const fallbackKey = `${measure.id}_all`;
  const signal = signals[signalKey] || signals[fallbackKey];

  const responses = signal?.responseCount || 0;
  const favourable = signal?.favourablePercentage;
  const distribution = signal?.distribution || [];
  const summary = summarizeDistribution(measure, signal);
  const canCompare = comparisonAvailable(signal);
  const delta = signal?.movement?.deltaPoints;
  const [showCalculation, setShowCalculation] = useState(false);

  const trackingEndpoints = endpoints.filter((ep) =>
    ep.activeMeasureIds.includes(measure.id)
  );
  const notTrackingEndpoints = endpoints.filter(
    (ep) => !ep.activeMeasureIds.includes(measure.id)
  );

  const commentsForMeasure = recentSessions
    .filter((s) => s.answers.some((a) => a.measureId === measure.id) && s.optionalComment)
    .slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to What We Track</span>
        </button>
        <div className="text-xs font-semibold text-slate-500">
          Viewing <span className="font-bold text-slate-900">{scopeLocationName}</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
          {measure.category}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {measure.name}
        </h1>

        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            What this helps you understand
          </h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
            {measure.shortDescription}
          </p>
        </div>
      </div>

      {/* Where you're tracking it */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Where you're tracking it</h2>

        {trackingEndpoints.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            This area is not currently tracked at any Feedback Point.
          </p>
        ) : (
          <div className="space-y-2">
            {trackingEndpoints.map((ep) => {
              const loc = locations.find((l) => l.id === ep.locationId);
              const isStopping = stoppingEndpointId === ep.id;
              return (
                <div
                  key={ep.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => onOpenFeedbackPoint(ep.id)}
                      className="text-left min-w-0"
                    >
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        {ep.humanName}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                        {loc?.name || 'Location'}
                      </div>
                    </button>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        ep.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {ep.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  {!isStopping ? (
                    <button
                      onClick={() => setStoppingEndpointId(ep.id)}
                      className="text-[11px] font-bold text-slate-500 hover:text-rose-700"
                    >
                      Stop tracking at {ep.humanName}
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5">
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Stop tracking <span className="font-semibold">{measure.name}</span> at{' '}
                        <span className="font-semibold">{ep.humanName}</span>? Existing feedback
                        remains part of your history. New customer sessions at this Feedback Point
                        will no longer include this area.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onStopTrackingAt(ep.id, measure.id);
                            setStoppingEndpointId(null);
                          }}
                          className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-[11px] font-bold"
                        >
                          Stop tracking
                        </button>
                        <button
                          onClick={() => setStoppingEndpointId(null)}
                          className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Keep tracking
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {notTrackingEndpoints.length > 0 && (
          <p className="text-[11px] text-slate-400 pt-1">
            Not used at:{' '}
            {notTrackingEndpoints.map((ep) => ep.humanName).join(', ')}
          </p>
        )}

        <button
          onClick={() => onAddToAnotherFeedbackPoint(measure.id)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to another Feedback Point</span>
        </button>
      </div>

      {/* Customer question (representative, read-only) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">Customer question</h2>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <p className="font-serif italic text-sm text-slate-800">
            "{measure.standardQuestion}"
          </p>
        </div>
        <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          Fedoo asks customers an appropriate question for this area. You don't need to write or
          edit the wording.
        </p>
      </div>

      {/* Recent evidence */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recent evidence</h2>

        {responses > 0 ? (
          <>
            <div className="flex items-center gap-6 bg-slate-50 border border-slate-200/80 p-5 rounded-2xl">
              <div>
                <div className="text-3xl font-black text-slate-900 leading-tight">
                  {favourable !== undefined ? `${favourable}%` : '—'}
                </div>
                <div className="text-xs text-slate-500 font-medium">Favourable</div>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-xs text-slate-500">
                <div className="font-bold text-slate-900">
                  {responses} response{responses === 1 ? '' : 's'}
                </div>
                <div className="mt-0.5">
                  {canCompare && delta !== undefined
                    ? `${delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}pp vs previous period`
                    : 'Not enough feedback to compare periods yet'}
                </div>
              </div>
            </div>

            {summary.total > 0 && (
              <div className="text-xs text-slate-600">
                Favourable {summary.favourablePct}% · Middle {summary.middlePct}% · Unfavourable{' '}
                {summary.unfavourablePct}%
              </div>
            )}

            {distribution.length > 0 && (
              <div className="space-y-3 pt-1">
                {distribution.map((item, idx) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-500 font-mono">
                        {item.percentage}% ({item.count})
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${idx < 2 ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        style={{ width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Read-only calculation explanation */}
            <div className="pt-1">
              <button
                onClick={() => setShowCalculation((v) => !v)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>How this is calculated</span>
              </button>
              {showCalculation && (
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Customers answer a five-point question. Ratings of 4 and 5 count as favourable,
                  3 as middle, and 1 and 2 as unfavourable. Fedoo applies the appropriate question
                  and scale for this area.
                </p>
              )}
            </div>

            {commentsForMeasure.length > 0 && (
              <div className="space-y-2 pt-1">
                {commentsForMeasure.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <p className="text-slate-800 font-medium italic">"{s.optionalComment}"</p>
                    <div className="text-[10px] text-slate-400 mt-1">{s.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <QrCode className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-900">No feedback yet</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Once customers respond at a Feedback Point tracking this area, factual evidence will
              appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
