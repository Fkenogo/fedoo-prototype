import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { Endpoint, Measure } from '../types';

interface ChangeWhatWeTrackViewProps {
  endpoint: Endpoint;
  allMeasures: Measure[];
  onCancel: () => void;
  onSaveConfiguration: (newMeasureIds: string[], reasonNote: string) => void;
}

export const ChangeWhatWeTrackView: React.FC<ChangeWhatWeTrackViewProps> = ({
  endpoint,
  allMeasures,
  onCancel,
  onSaveConfiguration,
}) => {
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<string[]>(
    endpoint.activeMeasureIds
  );
  const [reasonNote, setReasonNote] = useState('');
  const [currentStep, setCurrentStep] = useState<'select' | 'review'>('select');

  // Filter available measures (excluding those marked not relevant)
  const availableMeasures = allMeasures.filter(
    (m) => m.availability === 'available'
  );

  const toggleMeasure = (id: string) => {
    if (selectedMeasureIds.includes(id)) {
      // Must keep at least 1 measure
      if (selectedMeasureIds.length === 1) return;
      setSelectedMeasureIds(selectedMeasureIds.filter((mId) => mId !== id));
    } else {
      setSelectedMeasureIds([...selectedMeasureIds, id]);
    }
  };

  const getBurdenLevel = (count: number) => {
    if (count <= 3) return { label: 'Quick (~20s)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (count <= 5) return { label: 'Standard (~35s)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Extended (~50s+)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const burden = getBurdenLevel(selectedMeasureIds.length);

  const handlePublish = () => {
    const finalReason = reasonNote.trim() || `Updated questions to track ${selectedMeasureIds.length} areas`;
    onSaveConfiguration(selectedMeasureIds, finalReason);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel without saving</span>
        </button>

        <div className="text-xs font-semibold text-slate-500">
          Configuring: <span className="font-bold text-slate-900">{endpoint.humanName}</span>
        </div>
      </div>

      {/* Main Flow Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Change What We Track
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Choose the Measures you want visibility on for this feedback point. Fedoo resolves the governed Instruments and assembles the Question Set — you never author canonical wording, scales, or compatibility.
          </p>
        </div>

        {/* Live Participant Burden Indicator */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Customer Completion Burden</span>
            </div>
            <p className="text-xs text-slate-500">
              {selectedMeasureIds.length} questions selected • Recommended: 3 to 5 questions for high response rates.
            </p>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 self-start sm:self-auto ${burden.color}`}>
            {burden.label}
          </div>
        </div>

        {/* STEP 1: Select Measures */}
        {currentStep === 'select' ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Service Measures
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableMeasures.map((measure) => {
                  const isSelected = selectedMeasureIds.includes(measure.id);
                  return (
                    <div
                      key={measure.id}
                      onClick={() => toggleMeasure(measure.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-xs text-slate-900">
                            {measure.name}
                          </h3>
                          {measure.isRecommended && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              Core
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {measure.shortDescription}
                        </p>
                        <p className="text-[11px] text-slate-600 font-serif italic mt-1.5">
                          "{measure.standardQuestion}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Proceed Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() => setCurrentStep('review')}
                disabled={selectedMeasureIds.length === 0}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
              >
                <span>Continue to Review ({selectedMeasureIds.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Review & Publish with QR Reassurance */
          <div className="space-y-6">
            {/* Critical Reassurance Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-emerald-950">
              <QrCode className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-emerald-900 mb-1">
                  Your QR Code & Direct Link Stay the Same
                </h3>
                <p className="text-emerald-900/80 leading-relaxed">
                  Physical acrylic stands, stickers, and flyers already in your venue do not need reprinting. Publishing creates or supersedes the governed configuration — future sessions use the new effective configuration, while past sessions retain their frozen lineage.
                </p>
              </div>
            </div>

            {/* Questions to be published */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Updated Customer Questions ({selectedMeasureIds.length})
              </h2>

              <div className="space-y-2">
                {selectedMeasureIds.map((id, index) => {
                  const m = allMeasures.find((item) => item.id === id);
                  if (!m) return null;
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-900">{m.name}</span>
                        <span className="text-slate-400 font-serif italic text-[11px] hidden sm:inline">
                          — "{m.standardQuestion}"
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        {m.scaleFamily}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Reason Note for History */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Update Reason / Note (Recorded in history)
              </label>
              <input
                type="text"
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder="e.g. Swapped dessert question for service speed during summer rush"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {/* Publish Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('select')}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                ← Back to Selection
              </button>

              <button
                onClick={handlePublish}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Publish Configuration</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
