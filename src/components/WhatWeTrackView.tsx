import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  MapPin,
  QrCode,
} from 'lucide-react';
import { Measure, ServiceSignal, Endpoint, Location, Organisation } from '../types';
import { resolveRecommendationProfile } from '../data/recommendationProfiles';

interface WhatWeTrackViewProps {
  organisation: Organisation;
  measures: Measure[];
  signals: Record<string, ServiceSignal>;
  endpoints: Endpoint[];
  locations: Location[];
  currentScope: string;
  scopeLocationName: string;
  onSelectMeasure: (measureId: string) => void;
  onAddAreaToFeedbackPoints: (measureId: string) => void;
  onViewActivity: () => void;
}

// [PROTOTYPE ASSUMPTION ANNOTATION — Product Truth realignment]:
// This is the Organisation's business-facing view of what it is listening for.
// Coverage, recommendations and evidence are prototype illustrations; the
// governed catalogue, applicability and recommendation mappings are supplied
// by Product Truth. No configuration lineage or instrument vocabulary is shown.
export const WhatWeTrackView: React.FC<WhatWeTrackViewProps> = ({
  organisation,
  measures,
  signals,
  endpoints,
  locations,
  currentScope,
  scopeLocationName,
  onSelectMeasure,
  onAddAreaToFeedbackPoints,
  onViewActivity,
}) => {
  const [showBrowseMore, setShowBrowseMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const measureById = useMemo(() => {
    const map = new Map<string, Measure>();
    measures.forEach((m) => map.set(m.id, m));
    return map;
  }, [measures]);

  const profile = useMemo(() => resolveRecommendationProfile(organisation), [organisation]);

  // Scope: at Organisation scope consider every Feedback Point; at Location
  // scope consider only that Location's Feedback Points.
  const scopedEndpoints = useMemo(
    () =>
      currentScope === 'all'
        ? endpoints
        : endpoints.filter((e) => e.locationId === currentScope),
    [endpoints, currentScope]
  );

  // Areas currently tracked by at least one Feedback Point in scope.
  const trackedMeasureIds = useMemo(() => {
    const ids = new Set<string>();
    scopedEndpoints.forEach((ep) => ep.activeMeasureIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [scopedEndpoints]);

  const trackedAreas = trackedMeasureIds
    .map((id) => measureById.get(id))
    .filter((m): m is Measure => Boolean(m));

  // Recommendations: profile suggestions not already tracked in scope.
  const recommendationAreas = useMemo(() => {
    const seen = new Set<string>();
    return [...profile.recommended, ...profile.alsoRelevant]
      .filter((area) => {
        if (trackedMeasureIds.includes(area.measureId)) return false;
        if (seen.has(area.measureId)) return false;
        if (!measureById.has(area.measureId)) return false;
        seen.add(area.measureId);
        return true;
      })
      .slice(0, 6);
  }, [profile, trackedMeasureIds, measureById]);

  // Browse-more groups: profile groupings, plus any remaining available areas.
  const browseGroups = useMemo(() => {
    const placed = new Set<string>();
    const groups: { id: string; label: string; measures: Measure[] }[] = [];

    profile.browseGroups.forEach((g) => {
      const groupMeasures: Measure[] = [];
      g.measureIds.forEach((id) => {
        const m = measureById.get(id);
        if (!m) return;
        if (m.availability === 'not_relevant') return;
        if (placed.has(m.id)) return;
        placed.add(m.id);
        groupMeasures.push(m);
      });
      if (groupMeasures.length > 0) {
        groups.push({ id: g.id, label: g.label, measures: groupMeasures });
      }
    });

    const rest = measures.filter(
      (m) => m.availability === 'available' && !placed.has(m.id)
    );
    if (rest.length > 0) {
      groups.push({ id: 'more', label: 'More areas', measures: rest });
    }
    return groups;
  }, [profile, measures, measureById]);

  const filteredBrowseGroups = browseGroups
    .map((g) => ({
      ...g,
      measures: g.measures.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((g) => g.measures.length > 0);

  const evidenceFor = (measureId: string) =>
    signals[`${measureId}_${currentScope}`] || signals[`${measureId}_all`];

  const endpointsUsing = (measureId: string) =>
    scopedEndpoints.filter((ep) => ep.activeMeasureIds.includes(measureId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">What We Track</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          The areas of customer experience your Organisation is currently listening to.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Viewing {scopeLocationName}
        </p>
      </div>

      {/* Currently tracking */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-bold text-slate-900">
            Currently tracking ({trackedAreas.length})
          </h2>
        </div>

        {trackedAreas.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Nothing tracked here yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Once a Feedback Point tracks an area, it will appear here with where it is being
              used.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trackedAreas.map((measure) => {
              const using = endpointsUsing(measure.id);
              const signal = evidenceFor(measure.id);
              const responses = signal?.responseCount || 0;
              const favourable = signal?.favourablePercentage;

              return (
                <div
                  key={measure.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-600/50 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{measure.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {measure.shortDescription}
                    </p>

                    <div className="mt-3 space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Used at
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {using.map((ep) => (
                          <span
                            key={ep.id}
                            className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            {ep.humanName}
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400 pt-0.5">
                        {using.length} {using.length === 1 ? 'Feedback Point' : 'Feedback Points'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-[11px]">
                      {responses > 0 && favourable !== undefined ? (
                        <span className="text-slate-700 font-semibold">
                          {favourable}% favourable · {responses} responses
                        </span>
                      ) : (
                        <span className="text-slate-400">No feedback yet</span>
                      )}
                    </div>
                    <button
                      onClick={() => onSelectMeasure(measure.id)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 shrink-0"
                    >
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended for your business */}
      {recommendationAreas.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">Recommended for your business</h2>
          </div>
          <p className="text-xs text-slate-500 -mt-2 max-w-2xl">
            Other areas Fedoo thinks may be useful based on your business and service context.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendationAreas.map((area) => {
              const measure = measureById.get(area.measureId);
              if (!measure) return null;
              return (
                <div
                  key={area.measureId}
                  className="bg-emerald-50/40 rounded-2xl border border-emerald-200/70 p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{measure.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {area.reason || measure.shortDescription}
                    </p>
                  </div>
                  <button
                    onClick={() => onAddAreaToFeedbackPoints(measure.id)}
                    className="self-start px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Consider tracking</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Browse the wider library */}
      <section className="space-y-4 pt-2">
        <button
          onClick={() => setShowBrowseMore((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Browse more areas</span>
          {showBrowseMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showBrowseMore && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {filteredBrowseGroups.map((group) => (
              <div key={group.id} className="space-y-2">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {group.label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.measures.map((measure) => {
                    const isTracked = trackedMeasureIds.includes(measure.id);
                    return (
                      <div
                        key={measure.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900">{measure.name}</div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {measure.shortDescription}
                          </p>
                        </div>
                        {isTracked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Tracking
                          </span>
                        ) : (
                          <button
                            onClick={() => onAddAreaToFeedbackPoints(measure.id)}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 shrink-0"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredBrowseGroups.length === 0 && (
              <div className="text-xs text-slate-500 italic py-4">
                No areas match your search.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer link to activity */}
      <div className="pt-2">
        <button
          onClick={onViewActivity}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>View customer activity</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
