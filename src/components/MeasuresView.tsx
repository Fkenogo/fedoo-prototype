import React, { useState } from 'react';
import { 
  Target, 
  Search, 
  Check, 
  Plus, 
  HelpCircle, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { Measure, BurdenLevel } from '../types';

interface MeasuresViewProps {
  allMeasures: Measure[];
  activeMeasureIds: string[];
  onToggleMeasureActive: (measureId: string) => void;
  onSelectMeasureDetail: (measureId: string) => void;
}

export const MeasuresView: React.FC<MeasuresViewProps> = ({
  allMeasures,
  activeMeasureIds,
  onToggleMeasureActive,
  onSelectMeasureDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customIntentModalOpen, setCustomIntentModalOpen] = useState(false);
  const [intentInput, setIntentInput] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customQuestionText, setCustomQuestionText] = useState('');

  // Calculate participant burden
  const activeCount = activeMeasureIds.length;
  const burdenLevel: BurdenLevel = activeCount <= 3 ? 'quick' : activeCount <= 6 ? 'standard' : 'extended';

  const categories = [
    'all',
    'Core Experience',
    'Service Delivery',
    'People & Courtesy',
    'Environment & Space',
    'Loyalty & Return',
  ];

  const filteredMeasures = allMeasures.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.standardQuestion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Smart suggestions for intent helper
  const matchedGovernedMeasures = allMeasures.filter((m) => {
    if (!intentInput.trim()) return false;
    const query = intentInput.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.shortDescription.toLowerCase().includes(query) ||
      (query.includes('wait') && m.id === 'speed_of_service') ||
      (query.includes('time') && m.id === 'speed_of_service') ||
      (query.includes('slow') && m.id === 'speed_of_service') ||
      (query.includes('fast') && m.id === 'speed_of_service') ||
      (query.includes('food') && m.id === 'food_beverage_quality') ||
      (query.includes('drink') && m.id === 'food_beverage_quality') ||
      (query.includes('coffee') && m.id === 'food_beverage_quality') ||
      (query.includes('taste') && m.id === 'food_beverage_quality') ||
      (query.includes('polite') && m.id === 'staff_courtesy') ||
      (query.includes('waiter') && m.id === 'staff_courtesy') ||
      (query.includes('clean') && m.id === 'cleanliness_comfort') ||
      (query.includes('toilet') && m.id === 'cleanliness_comfort') ||
      (query.includes('return') && m.id === 'likelihood_to_return') ||
      (query.includes('again') && m.id === 'likelihood_to_return') ||
      (query.includes('price') && m.id === 'value_for_experience') ||
      (query.includes('cost') && m.id === 'value_for_experience')
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Burden Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-700" />
              Governed Measure Library
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              What do you want visibility on?
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Select the Measures you want visibility on (configuration intent). Fedoo resolves the governed Instruments and assembles the Question Set — comparability requires the same Measure, instrument version, scale and compatibility class.
            </p>
          </div>

          {/* Participant Burden Indicator */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 text-xs min-w-[220px]">
            <div className="flex items-center justify-between font-semibold text-slate-700 mb-1.5">
              <span>Customer Feedback Burden</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                burdenLevel === 'quick' ? 'bg-emerald-100 text-emerald-800' :
                burdenLevel === 'standard' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {burdenLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeCount} measures selected • ~{activeCount <= 3 ? '20' : activeCount <= 5 ? '35' : '60'} seconds to complete</span>
            </div>
          </div>
        </div>

        {/* Selected Measures Summary Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-slate-700">Currently active:</span>
            {activeMeasureIds.map((id) => {
              const m = allMeasures.find((item) => item.id === id);
              if (!m) return null;
              return (
                <span
                  key={id}
                  onClick={() => onSelectMeasureDetail(id)}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-[11px]"
                >
                  <Check className="w-3 h-3 text-emerald-700" />
                  {m.name}
                </span>
              );
            })}
          </div>

          <button
            onClick={() => {
              setCustomIntentModalOpen(true);
              setIntentInput('');
              setShowCustomForm(false);
            }}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Need to measure something else?</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service dimensions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Measures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeasures.map((measure) => {
          const isActive = activeMeasureIds.includes(measure.id);

          return (
            <div
              key={measure.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-emerald-300 ring-1 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                    {measure.category}
                  </span>

                  {measure.isCore && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Core Measure
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{measure.name}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {measure.shortDescription}
                </p>

                {/* Governed Question Preview Box */}
                <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Governed Customer Question:
                  </span>
                  <p className="text-slate-800 font-medium italic">
                    "{measure.standardQuestion}"
                  </p>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Scale: {measure.scaleFamily}</span>
                    <span className="text-slate-400">{measure.version}</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  <strong className="text-slate-700">Context:</strong> {measure.contextNotes}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectMeasureDetail(measure.id)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Inspect details
                </button>

                <button
                  onClick={() => onToggleMeasureActive(measure.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-700 hover:bg-rose-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tracking Active</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Track this</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Governed Custom Question Intent Helper */}
      {customIntentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                  Controlled Instrument Extension
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  What are you trying to understand?
                </h3>
              </div>
              <button
                onClick={() => setCustomIntentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Fedoo curates governed Measures with versioned Instruments. Tell us what you want to learn, and we’ll check if an existing Measure already addresses it — custom questions never auto-create Measures or comparability.
            </p>

            {/* Input Box */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Describe your service inquiry:
              </label>
              <input
                type="text"
                placeholder="e.g. How long people wait, coffee taste, restroom cleanliness..."
                value={intentInput}
                onChange={(e) => {
                  setIntentInput(e.target.value);
                  setShowCustomForm(false);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            {/* Matches Found */}
            {matchedGovernedMeasures.length > 0 && (
              <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Governed Measures matching your need:</span>
                </div>
                <div className="space-y-2">
                  {matchedGovernedMeasures.slice(0, 2).map((m) => (
                    <div
                      key={m.id}
                      className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">"{m.standardQuestion}"</p>
                      </div>
                      <button
                        onClick={() => {
                          if (!activeMeasureIds.includes(m.id)) {
                            onToggleMeasureActive(m.id);
                          }
                          setCustomIntentModalOpen(false);
                        }}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0 ml-2"
                      >
                        {activeMeasureIds.includes(m.id) ? 'Already Tracking' : 'Track This'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback to custom if no match or user explicitly insists */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              {!showCustomForm ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    My inquiry is uniquely specific and outside the library
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Custom questions enter no governed denominator, signal or history and carry no cross-location comparability. Production allows at most one active custom question subject to entitlement; optional comment stays separate.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Controlled Question Prompt:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. How satisfied were you with the WiFi connectivity today?"
                      value={customQuestionText}
                      onChange={(e) => setCustomQuestionText(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setCustomIntentModalOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setCustomIntentModalOpen(false);
                        alert(`Custom question registered: "${customQuestionText}". Attached to organisation endpoint configuration.`);
                      }}
                      disabled={!customQuestionText.trim()}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
                    >
                      Submit for Internal Audit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
