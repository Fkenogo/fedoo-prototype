import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  Clock, 
  Sparkles,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Measure, ServiceSignal } from '../types';

interface WhatWeTrackViewProps {
  measures: Measure[];
  signals: Record<string, ServiceSignal>;
  currentScope: string;
  scopeLocationName: string;
  onSelectMeasure: (measureId: string) => void;
}

export const WhatWeTrackView: React.FC<WhatWeTrackViewProps> = ({
  measures,
  signals,
  currentScope,
  scopeLocationName,
  onSelectMeasure,
}) => {
  const [expandedMeasureId, setExpandedMeasureId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedMeasureId(expandedMeasureId === id ? null : id);
  };

  // Group measures by availability and category
  const filteredMeasures = measures.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableMeasures = filteredMeasures.filter((m) => m.availability === 'available');
  const otherMeasures = filteredMeasures.filter((m) => m.availability !== 'available');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            What We Track
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Service measures available to understand customer sentiment across {scopeLocationName}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search measures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
          />
        </div>
      </div>

      {/* Available Measures Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Available Service Measures ({availableMeasures.length})
          </h2>
          <p className="text-xs text-slate-500">
            Standard measures validated for customer service environments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableMeasures.map((measure) => {
            const isExpanded = expandedMeasureId === measure.id;
            const signalKey = `${measure.id}_${currentScope}`;
            const fallbackKey = `${measure.id}_all`;
            const signal = signals[signalKey] || signals[fallbackKey];
            const favourable = signal?.favourablePercentage;

            return (
              <div
                key={measure.id}
                onClick={() => onSelectMeasure(measure.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-600/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {measure.category}
                      </span>
                      {measure.isRecommended && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                          Recommended
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                      Available now
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                    {measure.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {measure.shortDescription}
                  </p>

                  {/* Expandable "How Fedoo measures this" */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={(e) => toggleExpand(e, measure.id)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5 text-emerald-700" />
                      <span>How Fedoo measures this</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 animate-in fade-in">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                          Standard Customer Question
                        </div>
                        <p className="font-serif italic text-slate-800 text-xs">
                          "{measure.standardQuestion}"
                        </p>
                        <div className="text-[11px] text-slate-500 pt-1">
                          Scale: 5-point {measure.scaleFamily} • Response burden: {measure.typicalBurden}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-slate-900 text-lg">
                      {favourable !== null && favourable !== undefined ? `${favourable}%` : '—'}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5 font-medium">
                      favourable ({signal?.responseCount || 0} responses)
                    </span>
                  </div>

                  <span className="font-bold text-emerald-800 group-hover:text-emerald-950 flex items-center gap-0.5">
                    <span>View Detail</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Progressive Discovery: Coming Soon & Contextual Measures */}
      {otherMeasures.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Additional Platform Measures
            </h2>
            <p className="text-xs text-slate-500">
              Specialized measures or those in preview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherMeasures.map((measure) => (
              <div
                key={measure.id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 opacity-80"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {measure.category}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    measure.availability === 'coming_soon'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {measure.availability === 'coming_soon' ? 'Coming Soon' : 'Not relevant in this context'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">
                  {measure.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {measure.shortDescription}
                </p>

                <p className="text-[11px] text-slate-600 font-serif italic mt-2">
                  "{measure.standardQuestion}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
