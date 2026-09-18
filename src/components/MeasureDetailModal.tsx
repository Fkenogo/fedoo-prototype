import React from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  Clock, 
  Info, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  QrCode
} from 'lucide-react';
import { Measure, Location, Endpoint, ServiceSignal } from '../types';

interface MeasureDetailModalProps {
  measure: Measure;
  locations: Location[];
  endpoints: Endpoint[];
  signals: Record<string, ServiceSignal>;
  onClose: () => void;
  onOpenParticipantView: () => void;
  onNavigateToEndpoint: (endpointId: string) => void;
}

export const MeasureDetailModal: React.FC<MeasureDetailModalProps> = ({
  measure,
  locations,
  endpoints,
  signals,
  onClose,
  onOpenParticipantView,
  onNavigateToEndpoint,
}) => {
  const [showMeasurementMethodology, setShowMeasurementMethodology] = React.useState(false);
  const [selectedLocationTab, setSelectedLocationTab] = React.useState<'all' | string>('all');

  const signalKey = `${measure.id}_${selectedLocationTab}`;
  const signal = signals[signalKey] || signals[`${measure.id}_all`];
  const change = signal?.periodChange;

  // Find endpoints collecting this measure
  const activeEndpoints = endpoints.filter((ep) => ep.activeMeasureIds.includes(measure.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {measure.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Fedoo Governed Measure
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{measure.name}</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">{measure.shortDescription}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Location Scope Selector Tabs for this Measure */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Scope:
            </span>
            <button
              onClick={() => setSelectedLocationTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLocationTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Locations (Consolidated)
            </button>
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocationTab(loc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedLocationTab === loc.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>

          {/* Attention Banner if flagged */}
          {signal?.attentionFlag && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-amber-950">Evidence Notice</div>
                <p className="text-amber-900 mt-0.5 leading-relaxed">
                  {signal.attentionFlag.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Core Metric & Evidence Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <div className="text-xs font-medium text-slate-500">Latest Signal State</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {signal?.favourablePercentage}%
              </div>
              <div className="text-xs text-slate-600 mt-1">Favourable Responses</div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <div className="text-xs font-medium text-slate-500">Evidence Volume</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {signal?.responseCount}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {signal?.sufficiencyState === 'healthy' ? (
                  <span className="text-emerald-700 font-medium">✓ Sufficient for reliable analysis</span>
                ) : (
                  <span className="text-amber-700 font-medium">⚠ Early signal volume accumulating</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <div className="text-xs font-medium text-slate-500">Period Movement</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-3xl font-extrabold text-slate-900">
                  {change ? (change.deltaPoints > 0 ? `+${change.deltaPoints}` : change.deltaPoints) : '0'}
                </div>
                <span className="text-xs text-slate-500">pts</span>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {change?.comparePeriodLabel || 'Compared to previous cycle'}
              </div>
            </div>
          </div>

          {/* Response Distribution: 5-Point Ordered Scale */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Full Response Distribution</h3>
                <p className="text-xs text-slate-500">
                  Exact distribution across the governed 5-point scale.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                Scale: {measure.scaleFamily.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2.5">
              {signal?.distribution.map((item, index) => {
                const isFavourable = index < 2; // Top 2 points are favourable
                return (
                  <div key={item.label} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold ${isFavourable ? 'text-slate-800' : 'text-slate-600'}`}>
                        {item.label}
                      </span>
                      <span className="text-slate-500 font-medium">
                        <strong className="text-slate-800">{item.count}</strong> responses ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(item.percentage, 1)}%` }}
                        className={`h-full rounded-full transition-all ${
                          index === 0
                            ? 'bg-emerald-600'
                            : index === 1
                            ? 'bg-emerald-500'
                            : index === 2
                            ? 'bg-slate-400'
                            : index === 3
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Evolution through time */}
          {signal?.historySeries && signal.historySeries.length > 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Signal History</h3>
              <p className="text-xs text-slate-500 mb-4">
                How customer sentiment has tracked over successive measurement windows.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {signal.historySeries.map((point) => (
                  <div key={point.period} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="text-slate-500 font-medium text-[11px]">{point.period}</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {point.favourablePercentage}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {point.responses} responses
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-Location Comparison (When looking at consolidated view) */}
          {selectedLocationTab === 'all' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Cross-Location Breakdown</h3>
              <p className="text-xs text-slate-500 mb-4">
                Compare how this Measure behaves across physical locations while respecting evidence sufficiency.
              </p>

              <div className="divide-y divide-slate-100">
                {locations.map((loc) => {
                  const locSignal = signals[`${measure.id}_${loc.id}`];
                  return (
                    <div key={loc.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{loc.name}</div>
                        <div className="text-slate-500 text-[11px]">{loc.addressOrDetail}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-slate-900 text-sm">
                            {locSignal ? `${locSignal.favourablePercentage}%` : '—'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {locSignal?.responseCount || loc.totalResponses} responses
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            loc.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {loc.status === 'active' ? 'Healthy volume' : 'Early signal'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Doorways Collecting this Measure */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Doorways</h3>
                <p className="text-xs text-slate-500">
                  {activeEndpoints.length} persistent endpoints currently present this Measure to customers.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                Doorway URL/QR codes remain persistent if measures change
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeEndpoints.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => onNavigateToEndpoint(ep.id)}
                  className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                    <div>
                      <span className="font-semibold text-slate-800">{ep.humanName}</span>
                      <div className="text-[10px] text-slate-500">{ep.totalResponses} responses recorded</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                </div>
              ))}
            </div>
          </div>

          {/* Progressive Disclosure: How this is measured */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowMeasurementMethodology(!showMeasurementMethodology)}
              className="w-full px-5 py-3.5 bg-white hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>How Fedoo Governs This Measure (Standard Instrument)</span>
              </div>
              <span className="text-slate-400 font-normal">
                {showMeasurementMethodology ? 'Hide methodology' : 'Show methodology'}
              </span>
            </button>

            {showMeasurementMethodology && (
              <div className="p-5 bg-slate-50/70 border-t border-slate-200 text-xs space-y-4">
                <div>
                  <div className="font-semibold text-slate-700">Approved Standard Question (EN v1):</div>
                  <div className="mt-1 p-2.5 bg-white rounded-lg border border-slate-200 font-medium text-slate-900">
                    "{measure.standardQuestion}"
                  </div>
                </div>

                {measure.standardQuestionFr && (
                  <div>
                    <div className="font-semibold text-slate-700">French text (prototype illustration — deferred, no equivalence approved):</div>
                    <div className="mt-1 p-2.5 bg-white rounded-lg border border-slate-200 font-medium text-slate-800 italic">
                      "{measure.standardQuestionFr}"
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="font-semibold text-slate-700">Scale Family:</span>
                    <p className="text-slate-600 mt-0.5">{measure.scaleFamily} (5-point unipolar/bipolar ordered)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Comparability (prototype illustration):</span>
                    <p className="text-slate-600 mt-0.5">
                      {measure.comparableAcrossLocations ? 'Same instrument version, scale and compatibility class required — no unconditional cross-location comparability' : 'Organisation internal only in this illustration'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 leading-relaxed">
                  <strong>Measurement Governance Rule:</strong> Organisations choose Measures for visibility (configuration intent); Fedoo resolves governed Instruments and assembles the Question Set. Comparability requires the same Measure, instrument version, scale and compatibility class.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onOpenParticipantView}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>See how customer sees this question</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
