import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  QrCode, 
  SlidersHorizontal, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Location, Endpoint, Measure, ServiceSignal, FeedbackSession, NeedsReviewItem } from '../types';

interface LocationDetailViewProps {
  location: Location;
  endpoints: Endpoint[];
  measures: Measure[];
  signals: Record<string, ServiceSignal>;
  recentSessions: FeedbackSession[];
  needsReviewItems: NeedsReviewItem[];
  onBack: () => void;
  onSelectEndpoint: (epId: string) => void;
  onSelectMeasure: (mId: string) => void;
}

export const LocationDetailView: React.FC<LocationDetailViewProps> = ({
  location,
  endpoints,
  measures,
  signals,
  recentSessions,
  needsReviewItems,
  onBack,
  onSelectEndpoint,
  onSelectMeasure,
}) => {
  const locEndpoints = endpoints.filter((e) => e.locationId === location.id);
  const locSessions = recentSessions.filter((s) => s.locationId === location.id);
  const locNeedsReview = needsReviewItems.filter((item) => item.locationId === location.id);

  // Active measures tracked at this location
  const activeMeasureIds = Array.from(
    new Set(locEndpoints.flatMap((e) => e.activeMeasureIds))
  );
  const activeMeasures = measures.filter((m) => activeMeasureIds.includes(m.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Locations</span>
        </button>
      </div>

      {/* Location Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${location.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {location.type === 'physical' ? 'Physical Venue' : 'Service Unit'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {location.name}
            </h1>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{location.addressOrDetail}</span>
              {location.managerName && (
                <>
                  <span>•</span>
                  <span>Manager: <strong>{location.managerName}</strong></span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shrink-0">
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {location.totalResponses}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Total Responses
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-2xl font-black text-emerald-700 leading-none">
                {locEndpoints.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Feedback Points
              </div>
            </div>
          </div>
        </div>

        {/* Needs Review Alert for this location */}
        {locNeedsReview.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>1 Area Needs Review at this Location</span>
            </div>
            {locNeedsReview.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectMeasure(item.measureId)}
                className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs cursor-pointer hover:bg-white transition-colors"
              >
                <div className="font-bold text-slate-900">{item.headline}</div>
                <div className="text-slate-600 mt-0.5">{item.explanation}</div>
                <div className="text-[11px] text-amber-800 font-semibold mt-1">{item.evidenceNote}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Feedback Points & Measures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Points Active Here */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Feedback Points at this Location
              </h2>
              <p className="text-xs text-slate-500">
                Where customer ratings are actively collected
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {locEndpoints.map((ep) => (
              <div
                key={ep.id}
                onClick={() => onSelectEndpoint(ep.id)}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-600/40 hover:bg-slate-100/70 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                    {ep.humanName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{ep.totalResponses} responses</span>
                    <span>•</span>
                    <span>{ep.activeMeasureIds.length} questions</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ep.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {ep.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What We Track Here */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Experience Picture
              </h2>
              <p className="text-xs text-slate-500">
                Favourable scores for measures tracked at {location.name}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {activeMeasures.map((measure) => {
              const signalKey = `${measure.id}_${location.id}`;
              const fallbackKey = `${measure.id}_all`;
              const signal = signals[signalKey] || signals[fallbackKey];
              const fav = signal?.favourablePercentage;

              return (
                <div
                  key={measure.id}
                  onClick={() => onSelectMeasure(measure.id)}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-600/40 hover:bg-slate-100/70 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {measure.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {signal?.responseCount || 0} responses • {signal?.evidenceLevel === 'sufficient' ? 'Reliable' : 'Early signal'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-slate-900">
                      {fav !== null && fav !== undefined ? `${fav}%` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      favourable
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
