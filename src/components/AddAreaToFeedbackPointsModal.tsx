import React, { useState } from 'react';
import { X, Check, MapPin, QrCode, Info } from 'lucide-react';
import { Measure, Endpoint, Location } from '../types';

interface AddAreaToFeedbackPointsModalProps {
  measure: Measure;
  endpoints: Endpoint[];
  locations: Location[];
  onClose: () => void;
  onApply: (endpointIds: string[]) => void;
}

// Lightweight, non-blocking flow for adding one area to one or more Feedback
// Points. No approval, no configuration vocabulary — just a choice of where.
export const AddAreaToFeedbackPointsModal: React.FC<AddAreaToFeedbackPointsModalProps> = ({
  measure,
  endpoints,
  locations,
  onClose,
  onApply,
}) => {
  const alreadyTracking = endpoints
    .filter((ep) => ep.activeMeasureIds.includes(measure.id))
    .map((ep) => ep.id);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (alreadyTracking.includes(id)) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canApply = selectedIds.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 sm:p-7 animate-in fade-in slide-in-from-bottom-3 sm:zoom-in-95">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Where would you like to track this?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-bold text-slate-800">{measure.name}</span> — you can
              change this anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {endpoints.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-6 text-center">
              You have no Feedback Points yet. Create one first to start tracking this area.
            </div>
          ) : (
            endpoints.map((ep) => {
              const loc = locations.find((l) => l.id === ep.locationId);
              const isAlready = alreadyTracking.includes(ep.id);
              const isSelected = selectedIds.includes(ep.id);
              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => toggle(ep.id)}
                  disabled={isAlready}
                  className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isAlready
                      ? 'bg-slate-50 border-slate-200 opacity-70 cursor-default'
                      : isSelected
                      ? 'bg-emerald-50/70 border-emerald-400'
                      : 'bg-white border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {ep.humanName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                        {loc?.name || 'Location'}
                      </div>
                    </div>
                  </div>
                  {isAlready ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 shrink-0">
                      Already tracking
                    </span>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-700 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p>Fedoo will use the appropriate customer questions. Your customer links stay the same.</p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            disabled={!canApply}
            onClick={() => onApply(selectedIds)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              canApply
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canApply
              ? `Add to ${selectedIds.length} ${
                  selectedIds.length === 1 ? 'Feedback Point' : 'Feedback Points'
                }`
              : 'Add to Feedback Points'}
          </button>
        </div>
      </div>
    </div>
  );
};
