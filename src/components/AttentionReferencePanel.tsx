// ============================================================================
// ATTENTION REFERENCE PANEL — REFERENCE ONLY (UNRESOLVED ASSUMPTION)
// ============================================================================
// Future-state / non-authoritative prototype interaction for organisation-
// visible Attention. NOT part of the adopted bounded production Overview:
// current Product Truth does not authorise production Attention semantics,
// and production inclusion requires a later Founder/Product decision with
// governed Attention semantics (thresholds, classes, visibility vs delivery).
// Rendered only when explicitly enabled via prototype review tooling; never
// part of the production-adoption default Organisation shell.
// ============================================================================

import React from 'react';
import { AlertTriangle, MapPin, ChevronRight } from 'lucide-react';
import { NeedsReviewItem } from '../types';

interface AttentionReferencePanelProps {
  items: NeedsReviewItem[];
  onSelectMeasure: (measureId: string) => void;
}

export const AttentionReferencePanel: React.FC<AttentionReferencePanelProps> = ({
  items,
  onSelectMeasure,
}) => {
  return (
    <section aria-labelledby="attention-reference-heading" className="space-y-4 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 id="attention-reference-heading" className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${items.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          <span>Attention reference (future-state prototype)</span>
          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
            REFERENCE — non-authoritative, not for production adoption
          </span>
          {items.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              {items.length}
            </span>
          )}
        </h2>
      </div>
      <p className="text-[11px] text-slate-500">
        Preserved interaction design for future Attention work only. Production review/attention
        requires governed thresholds and is never derived client-side. Absence of flags is not an
        analytical conclusion.
      </p>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectMeasure(item.measureId)}
              className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-200/80 text-amber-950">
                    {item.measureName}
                  </span>
                  <span className="text-xs text-amber-900 font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.locationName}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {item.headline}
                </h3>
                <p className="text-xs text-slate-700 max-w-3xl leading-relaxed">
                  {item.explanation}
                </p>
                <div className="text-[11px] text-amber-900/80 font-medium">
                  {item.evidenceNote}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-amber-900 group-hover:text-amber-950">
                <span>View Breakdown</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs text-slate-600">
          <span className="font-bold text-slate-900">No items flagged in this simulation. </span>
          Absence of flags is not an analytical conclusion and does not mean service is clear or stable.
        </div>
      )}
    </section>
  );
};
