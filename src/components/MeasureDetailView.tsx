import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  HelpCircle, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { Measure, ServiceSignal, Location, FeedbackSession } from '../types';

interface MeasureDetailViewProps {
  measure: Measure;
  currentScope: string;
  scopeLocationName: string;
  locations: Location[];
  signals: Record<string, ServiceSignal>;
  recentSessions: FeedbackSession[];
  onBack: () => void;
  onSelectLocation: (locId: string) => void;
}

export const MeasureDetailView: React.FC<MeasureDetailViewProps> = ({
  measure,
  currentScope,
  scopeLocationName,
  locations,
  signals,
  recentSessions,
  onBack,
  onSelectLocation,
}) => {
  // Get active signal for this scope
  const signalKey = `${measure.id}_${currentScope}`;
  const fallbackKey = `${measure.id}_all`;
  const signal = signals[signalKey] || signals[fallbackKey];

  const favourable = signal?.favourablePercentage;
  const evidence = signal?.evidenceLevel || 'none';
  const movement = signal?.movement;
  const distribution = signal?.distribution || [];
  const historySeries = signal?.historySeries || [];

  // Filter recent comments that rated this measure
  const commentsForMeasure = recentSessions
    .filter((s) => s.answers.some((a) => a.measureId === measure.id) && s.optionalComment)
    .map((s) => ({
      session: s,
      answer: s.answers.find((a) => a.measureId === measure.id)!,
      location: locations.find((l) => l.id === s.locationId),
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to What We Track</span>
        </button>

        <div className="text-xs font-semibold text-slate-500">
          Scope: <span className="font-bold text-slate-900">{scopeLocationName}</span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                {measure.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {measure.scaleFamily} scale
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {measure.name}
            </h1>

            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {measure.shortDescription}
            </p>
          </div>

          {/* Metric Summary Badge */}
          <div className="flex items-center gap-6 bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shrink-0">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                {favourable !== null && favourable !== undefined ? `${favourable}%` : '—'}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Favourable Ratings
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200" />

            <div className="space-y-1">
              {/* Evidence badge */}
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                evidence === 'sufficient'
                  ? 'bg-emerald-100 text-emerald-900'
                  : evidence === 'limited'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {evidence === 'sufficient'
                  ? 'Reliable picture'
                  : evidence === 'limited'
                  ? 'Early feedback'
                  : 'No evidence yet'}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {signal?.responseCount || 0} customer responses
              </div>
            </div>
          </div>
        </div>

        {/* Needs Review Alert if present */}
        {signal?.needsReview && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900">
                {signal.needsReview.headline}
              </div>
              <div className="text-amber-800/90 mt-0.5 leading-relaxed">
                {signal.needsReview.explanation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Response Distribution & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Breakdown Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Customer Response Breakdown
            </h2>
            <span className="text-xs text-slate-500">
              5-point scale distribution
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {distribution.map((item, idx) => {
              const isFavourable = idx < 2; // top 2 ratings are favourable
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-500 font-mono">
                      {item.percentage}% ({item.count})
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFavourable ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Favourable responses (4 & 5)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Neutral / Critical (1 to 3)</span>
            </span>
          </div>
        </div>

        {/* Location Breakdown if multi-location */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Performance by Location
            </h2>
            <span className="text-xs text-slate-500">
              Cross-location comparison
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {locations.map((loc) => {
              const locSignal = signals[`${measure.id}_${loc.id}`];
              const locFav = locSignal?.favourablePercentage;
              const locResponses = locSignal?.responseCount || 0;

              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation(loc.id)}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-600/40 hover:bg-slate-100/70 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{loc.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {locResponses} responses • {locSignal?.evidenceLevel === 'sufficient' ? 'Reliable' : 'Early data'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">
                      {locFav !== null && locFav !== undefined ? `${locFav}%` : '—'}
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

      {/* How Fedoo Measures This: Plain-language disclosure */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>How Fedoo Measures This</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="font-bold text-slate-900 block">
              Standard Question Asked to Customers
            </span>
            <p className="font-serif italic text-sm text-slate-800">
              "{measure.standardQuestion}"
            </p>
            {measure.standardQuestionFr && (
              <p className="font-serif italic text-xs text-slate-500">
                French: "{measure.standardQuestionFr}"
              </p>
            )}
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="font-bold text-slate-900 block">
              Why Fedoo Uses This Phrasing
            </span>
            <p className="leading-relaxed">
              {measure.rationale || 'Engineered to isolate this specific operational service dimension while minimizing cognitive burden for participants.'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Comments on this Measure */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Customer Notes Relating to {measure.name}
        </h2>

        {commentsForMeasure.length > 0 ? (
          <div className="space-y-3">
            {commentsForMeasure.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {item.location?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-900">
                    Rated: {item.answer.selectedValue}
                  </span>
                </div>
                <p className="text-slate-800 font-medium italic">
                  "{item.session.optionalComment}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-4 text-center">
            No customer comments recorded specifically for this measure in the recent sample.
          </div>
        )}
      </div>
    </div>
  );
};
