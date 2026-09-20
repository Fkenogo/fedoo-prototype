import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Plus,
  Clock,
  Sparkles,
  QrCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Endpoint, Measure, Organisation } from '../types';
import { resolveRecommendationProfile } from '../data/recommendationProfiles';

interface ChangeWhatWeTrackViewProps {
  endpoint: Endpoint;
  allMeasures: Measure[];
  organisation: Organisation;
  onCancel: () => void;
  onApplyChanges: (newMeasureIds: string[], summary: string) => void;
}

function burdenFor(count: number): { label: string; detail: string } {
  if (count <= 3) return { label: 'Quick', detail: 'About 3–4 questions' };
  if (count <= 5) return { label: 'Standard', detail: 'About 4–6 questions' };
  return { label: 'Extended', detail: 'About 6–8 questions' };
}

// Focused change flow for one Feedback Point. The Organisation adds/removes
// areas it wants visibility on; Fedoo owns how each area is asked. No
// configuration versions, no "publish", no instrument vocabulary.
export const ChangeWhatWeTrackView: React.FC<ChangeWhatWeTrackViewProps> = ({
  endpoint,
  allMeasures,
  organisation,
  onCancel,
  onApplyChanges,
}) => {
  const originalIds = endpoint.activeMeasureIds;
  const [selectedIds, setSelectedIds] = useState<string[]>(originalIds);
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [showBrowseMore, setShowBrowseMore] = useState(false);

  const measureById = useMemo(() => {
    const map = new Map<string, Measure>();
    allMeasures.forEach((m) => map.set(m.id, m));
    return map;
  }, [allMeasures]);

  const profile = useMemo(() => resolveRecommendationProfile(organisation), [organisation]);

  const selectedMeasures = selectedIds
    .map((id) => measureById.get(id))
    .filter((m): m is Measure => Boolean(m));

  const addedIds = selectedIds.filter((id) => !originalIds.includes(id));
  const removedIds = originalIds.filter((id) => !selectedIds.includes(id));
  const keepingIds = selectedIds.filter((id) => originalIds.includes(id));

  const burden = burdenFor(selectedIds.length);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  // Recommended additions: profile suggestions not currently selected.
  const recommendedAdditions = useMemo(() => {
    const seen = new Set<string>();
    return [...profile.recommended, ...profile.alsoRelevant].filter((area) => {
      if (selectedIds.includes(area.measureId)) return false;
      if (seen.has(area.measureId)) return false;
      if (!measureById.has(area.measureId)) return false;
      seen.add(area.measureId);
      return true;
    });
  }, [profile, selectedIds, measureById]);

  // Browse-more groups.
  const browseGroups = useMemo(() => {
    const placed = new Set<string>();
    const groups: { id: string; label: string; measures: Measure[] }[] = [];
    profile.browseGroups.forEach((g) => {
      const groupMeasures: Measure[] = [];
      g.measureIds.forEach((id) => {
        const m = measureById.get(id);
        if (!m || m.availability === 'not_relevant' || placed.has(m.id)) return;
        placed.add(m.id);
        groupMeasures.push(m);
      });
      if (groupMeasures.length > 0) groups.push({ id: g.id, label: g.label, measures: groupMeasures });
    });
    const rest = allMeasures.filter((m) => m.availability === 'available' && !placed.has(m.id));
    if (rest.length > 0) groups.push({ id: 'more', label: 'More areas', measures: rest });
    return groups;
  }, [profile, allMeasures, measureById]);

  const handleApply = () => {
    const parts: string[] = [];
    if (addedIds.length > 0)
      parts.push(`Added ${addedIds.map((id) => measureById.get(id)?.name).filter(Boolean).join(', ')}`);
    if (removedIds.length > 0)
      parts.push(`Removed ${removedIds.map((id) => measureById.get(id)?.name).filter(Boolean).join(', ')}`);
    const summary = parts.length > 0 ? parts.join(' · ') : `Kept ${selectedIds.length} areas`;
    onApplyChanges(selectedIds, summary);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <div className="text-xs font-semibold text-slate-500">
          <span className="font-bold text-slate-900">{endpoint.humanName}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Change what {endpoint.humanName} tracks
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Choose the areas you want visibility on here. Fedoo handles the customer questions.
          </p>
        </div>

        {/* Customer length indicator */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Customer experience</span>
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900">
              {burden.label} · {burden.detail}
            </span>
          </div>
        </div>

        {step === 'select' ? (
          <div className="space-y-6">
            {/* Currently tracking */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Currently tracking
              </h2>
              <div className="space-y-2">
                {selectedMeasures.map((m) => (
                  <AreaRow
                    key={m.id}
                    measure={m}
                    selected
                    onToggle={() => toggle(m.id)}
                  />
                ))}
              </div>
            </section>

            {/* Recommended additions */}
            {recommendedAdditions.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    Recommended additions
                  </h2>
                </div>
                <div className="space-y-2">
                  {recommendedAdditions.map((area) => {
                    const m = measureById.get(area.measureId)!;
                    return (
                      <AreaRow
                        key={m.id}
                        measure={m}
                        reason={area.reason}
                        selected={false}
                        onToggle={() => toggle(m.id)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Browse more */}
            <section className="space-y-3">
              <button
                onClick={() => setShowBrowseMore((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Browse more areas</span>
                {showBrowseMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showBrowseMore && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  {browseGroups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        {group.label}
                      </h3>
                      <div className="space-y-2">
                        {group.measures.map((m) => (
                          <AreaRow
                            key={m.id}
                            measure={m}
                            selected={selectedIds.includes(m.id)}
                            onToggle={() => toggle(m.id)}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('review')}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Review changes ({selectedIds.length})
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Review changes */}
            <div className="space-y-4">
              {addedIds.length > 0 && (
                <ReviewGroup
                  label="Adding"
                  tone="add"
                  measures={addedIds.map((id) => measureById.get(id)!).filter(Boolean)}
                />
              )}
              {removedIds.length > 0 && (
                <ReviewGroup
                  label="Removing"
                  tone="remove"
                  measures={removedIds.map((id) => measureById.get(id)!).filter(Boolean)}
                />
              )}
              {keepingIds.length > 0 && (
                <ReviewGroup
                  label="Keeping"
                  tone="keep"
                  measures={keepingIds.map((id) => measureById.get(id)!).filter(Boolean)}
                />
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">Customer experience</div>
              <div className="text-slate-600 mt-0.5">
                {burden.label} · {burden.detail}
              </div>
            </div>

            {/* Reassurance */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950">
              <QrCode className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Your QR code and customer link will stay the same. Previous feedback remains in
                your history.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setStep('select')}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Apply changes</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AreaRow: React.FC<{
  measure: Measure;
  selected: boolean;
  reason?: string;
  onToggle: () => void;
  compact?: boolean;
}> = ({ measure, selected, reason, onToggle, compact }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-full text-left p-4 rounded-2xl border flex items-start justify-between gap-3 transition-colors ${
      selected
        ? 'bg-emerald-50/70 border-emerald-400'
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}
  >
    <div className="min-w-0 space-y-1">
      <div className="text-sm font-bold text-slate-900">{measure.name}</div>
      {!compact && (
        <p className="text-[11px] text-slate-500 leading-relaxed">{measure.shortDescription}</p>
      )}
      {reason && <p className="text-[11px] text-emerald-800 leading-relaxed">{reason}</p>}
    </div>
    <div
      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
        selected ? 'bg-emerald-700 text-white' : 'border border-slate-300'
      }`}
    >
      {selected && <Check className="w-3.5 h-3.5" />}
    </div>
  </button>
);

const ReviewGroup: React.FC<{
  label: string;
  tone: 'add' | 'remove' | 'keep';
  measures: Measure[];
}> = ({ label, tone, measures }) => {
  const toneClass =
    tone === 'add'
      ? 'text-emerald-800'
      : tone === 'remove'
      ? 'text-rose-700'
      : 'text-slate-500';
  const prefix = tone === 'add' ? '+' : tone === 'remove' ? '−' : '·';
  return (
    <div className="space-y-2">
      <h3 className={`text-[11px] font-bold uppercase tracking-wide ${toneClass}`}>{label}</h3>
      <div className="space-y-1.5">
        {measures.map((m) => (
          <div key={m.id} className="flex items-center gap-2 text-sm text-slate-800">
            <span className={`font-bold ${toneClass}`}>{prefix}</span>
            <span className="font-medium">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
