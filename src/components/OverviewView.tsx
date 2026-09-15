import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  QrCode, 
  Sparkles, 
  Sliders, 
  Building2,
  Info,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Measure, Location, Endpoint, ServiceSignal, FeedbackSession } from '../types';

interface OverviewViewProps {
  currentScope: string;
  locations: Location[];
  measures: Measure[];
  endpoints: Endpoint[];
  signals: Record<string, ServiceSignal>;
  recentSessions: FeedbackSession[];
  onSelectMeasure: (measureId: string) => void;
  onNavigateTab: (tab: 'measures' | 'endpoints' | 'locations' | 'activity') => void;
  onOpenParticipantSimulator: (endpointId?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentScope,
  locations,
  measures,
  endpoints,
  signals,
  recentSessions,
  onSelectMeasure,
  onNavigateTab,
  onOpenParticipantSimulator,
}) => {
  const isAllLocations = currentScope === 'all';
  const activeLocation = locations.find((l) => l.id === currentScope);

  // Filter endpoints for current scope
  const scopedEndpoints = isAllLocations
    ? endpoints
    : endpoints.filter((ep) => ep.locationId === currentScope);

  const activeEndpointsCount = scopedEndpoints.filter((ep) => ep.status === 'active').length;
  const totalResponsesInScope = isAllLocations
    ? locations.reduce((acc, l) => acc + l.totalResponses, 0)
    : activeLocation?.totalResponses || 0;

  // Find active measures tracked in this scope
  const activeMeasureIds = Array.from(
    new Set(scopedEndpoints.flatMap((ep) => ep.activeMeasureIds))
  );

  const activeMeasures = measures.filter((m) => activeMeasureIds.includes(m.id));

  // Collect any attention flags across this scope
  const attentionItems: { measure: Measure; signal: ServiceSignal; locationName: string }[] = [];

  activeMeasures.forEach((m) => {
    const key = `${m.id}_${currentScope}`;
    const signal = signals[key] || signals[`${m.id}_all`];
    if (signal?.attentionFlag) {
      attentionItems.push({
        measure: m,
        signal,
        locationName: isAllLocations ? 'Organisation-wide' : activeLocation?.name || 'This Location',
      });
    }
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Scope Framing Hero */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Continuous Service Visibility
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isAllLocations ? 'How customers experience Bubbles Café right now' : `Customer experience at ${activeLocation?.name}`}
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              Fedoo continuously collects short, structured feedback across persistent doorways. 
              Review the independent health of each service dimension below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenParticipantSimulator(scopedEndpoints[0]?.id)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Submit Test Feedback</span>
            </button>
            <button
              onClick={() => onNavigateTab('endpoints')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition-colors"
            >
              <span>Manage Doorways</span>
            </button>
          </div>
        </div>

        {/* Operational Collection Health Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-slate-500 font-medium">Feedback Doorways</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{activeEndpointsCount}</span>
              <span className="text-[11px] font-normal text-emerald-600">Active</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {scopedEndpoints.filter((e) => e.status === 'paused').length > 0 
                ? `${scopedEndpoints.filter((e) => e.status === 'paused').length} paused` 
                : 'All collection points online'}
            </div>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-slate-500 font-medium">Accumulated Evidence</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {totalResponsesInScope} <span className="text-xs font-normal text-slate-500">responses</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Last response 14 mins ago
            </div>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-slate-500 font-medium">Tracked Dimensions</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {activeMeasures.length} <span className="text-xs font-normal text-slate-500">governed</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Quick burden (~30s participant)
            </div>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-slate-500 font-medium">Evidence Sufficiency</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              {totalResponsesInScope >= 50 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Healthy sample</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Early signal</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {totalResponsesInScope >= 50 ? 'Sufficient for reliable trend' : 'Early volume accumulating'}
            </div>
          </div>
        </div>
      </div>

      {/* Attention Required Panel (Evidence-Based, NOT generic advice) */}
      {attentionItems.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-950">
                  Evidence Deserving Management Review ({attentionItems.length})
                </h3>
                <span className="text-[11px] font-medium text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                  Evidence-based trigger
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-1">
                Fedoo surfaces meaningful shifts in customer evidence without generating subjective opinions.
              </p>

              <div className="mt-3 space-y-2">
                {attentionItems.map(({ measure, signal, locationName }) => (
                  <div
                    key={measure.id}
                    onClick={() => onSelectMeasure(measure.id)}
                    className="cursor-pointer bg-white/90 hover:bg-white rounded-xl p-3.5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{measure.name}</span>
                        <span className="text-[11px] text-slate-500">• {locationName}</span>
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                          {signal.scoreLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {signal.attentionFlag?.explanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                        Inspect evidence
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Service Signals Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Service Signals</h2>
            <p className="text-xs text-slate-500">
              Select any measure to inspect its historical evolution, distribution, and location breakdown.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('measures')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Browse Measure Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMeasures.map((measure) => {
            const signalKey = `${measure.id}_${currentScope}`;
            const signal = signals[signalKey] || signals[`${measure.id}_all`];
            const change = signal?.periodChange;

            return (
              <div
                key={measure.id}
                onClick={() => onSelectMeasure(measure.id)}
                className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {measure.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                        {measure.name}
                      </h3>
                    </div>

                    {/* Sufficiency Badge */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        signal?.sufficiencyState === 'healthy'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {signal?.sufficiencyState === 'healthy' ? 'Healthy volume' : 'Early signal'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {measure.shortDescription}
                  </p>

                  {/* Headline Metric */}
                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                        {signal?.favourablePercentage}%
                        <span className="text-xs font-normal text-slate-500 ml-1.5">favourable</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Based on <strong className="font-semibold text-slate-700">{signal?.responseCount}</strong> customer responses
                      </div>
                    </div>

                    {/* Period movement */}
                    {change && (
                      <div
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                          change.direction === 'up'
                            ? 'bg-emerald-50 text-emerald-700'
                            : change.direction === 'down'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {change.direction === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                        {change.direction === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                        {change.direction === 'steady' && <Minus className="w-3.5 h-3.5" />}
                        <span>
                          {change.deltaPoints > 0 ? `+${change.deltaPoints}` : change.deltaPoints} pts
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Response distribution preview bar */}
                  {signal?.distribution && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Distribution (5-point scale)</span>
                        <span>{signal.distribution[0]?.percentage}% top rating</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        {signal.distribution.map((dist, idx) => {
                          // Green to slate to rose color scale
                          const colors = [
                            'bg-emerald-600',
                            'bg-emerald-400',
                            'bg-slate-300',
                            'bg-amber-400',
                            'bg-rose-500',
                          ];
                          return (
                            <div
                              key={dist.label}
                              style={{ width: `${dist.percentage}%` }}
                              className={`${colors[idx] || 'bg-slate-400'} transition-all`}
                              title={`${dist.label}: ${dist.count} (${dist.percentage}%)`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-emerald-700">
                  <span className="text-[11px] font-medium">Inspect history & locations</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Feedback Stream & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Customer Feedback Snippets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Customer Submissions</h2>
              <p className="text-xs text-slate-500">Live evidence stream from active doorways</p>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all sessions
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentSessions.slice(0, 3).map((session) => {
              const loc = locations.find((l) => l.id === session.locationId);
              const overallAns = session.answers.find((a) => a.measureId === 'overall_experience');

              return (
                <div key={session.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{loc?.name}</span>
                      <span className="text-[11px] text-slate-500">• {session.timestamp}</span>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        via {session.channel}
                      </span>
                    </div>

                    {overallAns && (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-100">
                        {overallAns.selectedValue}
                      </span>
                    )}
                  </div>

                  {session.optionalComment ? (
                    <p className="text-xs text-slate-700 italic bg-slate-50/70 p-2.5 rounded-lg border border-slate-100/80">
                      "{session.optionalComment}"
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {session.answers.slice(0, 3).map((ans) => (
                        <span key={ans.measureId} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {ans.selectedValue}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Prototype Guidance Card: The Fedoo Mental Model */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              Governed Experience Architecture
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Evidence Before Judgement
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Notice how Fedoo does not fabricate an opaque single "Fedoo Score", nor does it issue arbitrary advice like "train your staff".
            </p>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Instead, it preserves the integrity of individual Measures, displays volume-backed distributions, and distinguishes early signals from stable patterns.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => onNavigateTab('measures')}
              className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl text-center transition-colors"
            >
              Explore Measure Library
            </button>
            <button
              onClick={() => onOpenParticipantSimulator()}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl text-center transition-colors"
            >
              Simulate Customer Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
