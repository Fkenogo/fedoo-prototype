import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Database, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  FileText, 
  Globe, 
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import { Measure } from '../types';

interface OperatorViewProps {
  measures: Measure[];
  onReturnToApp: () => void;
}

export const OperatorView: React.FC<OperatorViewProps> = ({
  measures,
  onReturnToApp,
}) => {
  const [selectedMeasure, setSelectedMeasure] = useState<Measure>(measures[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Operator Shell Top Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Fedoo Platform Authority</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Internal Governance Shell
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative catalogue of governed Measures, standard instrument formulations & comparability rules.
              </p>
            </div>
          </div>

          <button
            onClick={onReturnToApp}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            ← Return to Organisation View
          </button>
        </div>

        {/* Boundary Notice */}
        <div className="mt-5 p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Product Truth Separation:</strong> Organisations never see this raw catalogue architecture or psychometric machinery. They experience human service concepts ("Speed of Service"), while Fedoo platform authority governs the underlying questions, ordinal scales, and validity over time.
          </div>
        </div>
      </div>

      {/* Main Governance Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Governed Catalogue List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Canonical Measure Catalogue</h2>
            <span className="text-xs font-semibold text-slate-500">{measures.length} registered</span>
          </div>

          <div className="space-y-1.5">
            {measures.map((m) => {
              const isSelected = selectedMeasure.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeasure(m)}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{m.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                      {m.version}
                    </span>
                  </div>
                  <div className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {m.category} • {m.scaleFamily} scale
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Instrument Specification & Governance Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedMeasure.category}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {selectedMeasure.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{selectedMeasure.shortDescription}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Canonical Instrument
                </span>
              </div>
            </div>

            {/* Approved Standard Formulations */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Canonical English Formulation (v1.0):
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900">
                  "{selectedMeasure.standardQuestion}"
                </div>
              </div>

              {selectedMeasure.standardQuestionFr && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Canonical French Formulation (v1.0):
                  </label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 italic">
                    "{selectedMeasure.standardQuestionFr}"
                  </div>
                </div>
              )}
            </div>

            {/* Response Scale Family Specification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Scale Family</span>
                <div className="font-mono text-sm text-slate-900">{selectedMeasure.scaleFamily.toUpperCase()}</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  5-point discrete ordinal response items. Favourable threshold strictly set to points 4 and 5.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Cross-Sector Comparability</span>
                <div className="font-semibold text-slate-900">
                  {selectedMeasure.comparableAcrossLocations ? 'Unconditional Cross-Location' : 'Within-Context Only'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard wording guarantees that mathematical aggregation retains statistical validity.
                </p>
              </div>
            </div>

            {/* Psychometric Rationale */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">Psychometric & Service Rationale</span>
              <p className="text-slate-600 leading-relaxed">
                {selectedMeasure.rationale || 'Engineered to isolate distinct service dimensions with minimum customer cognitive burden.'}
              </p>
            </div>

            {/* Governed State Lock */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked by Fedoo Standards Authority</span>
              </div>
              <span>Immutable v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
