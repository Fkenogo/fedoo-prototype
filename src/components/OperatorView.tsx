import React, { useState } from 'react';
import {
  ShieldCheck,
  Layers,
  CheckCircle2,
  Info,
  Globe,
  Lock,
  History,
  LayoutTemplate,
  Activity,
  FileClock,
  CircleDashed,
} from 'lucide-react';
import { Measure } from '../types';

interface OperatorViewProps {
  measures: Measure[];
  onReturnToApp: () => void;
}

type OpsSection =
  | 'instrument'
  | 'lifecycle'
  | 'templates'
  | 'diagnostics';

const SECTION_LABELS: Record<OpsSection, string> = {
  instrument: 'Instrument & Equivalence',
  lifecycle: 'Lifecycle & Provenance',
  templates: 'Templates & Configuration',
  diagnostics: 'Diagnostics & Audit',
};

// Product Truth curation capabilities the control-plane must make manageable.
// Prototype illustrates the experience only — it invents no permissions or
// backend behaviour. Capabilities with no governed backend are marked accordingly.
const CURATION_CAPABILITIES = [
  'Measures & operational readiness',
  'Standard Questions (English v1 governed)',
  'Instrument versions',
  'Scale families & versions',
  'Language versions (French deferred)',
  'Equivalence / comparability authority',
  'Context / sector applicability',
  'Question Set templates & pools',
  'Configuration support (rotation, eligibility, custom-question entitlement)',
  'Version history & provenance',
  'Draft / review / publish states',
  'Operational diagnostics & audit',
];

export const OperatorView: React.FC<OperatorViewProps> = ({
  measures,
  onReturnToApp,
}) => {
  const [selectedMeasure, setSelectedMeasure] = useState<Measure>(measures[0]);
  const [activeSection, setActiveSection] = useState<OpsSection>('instrument');

  const frIllustration = selectedMeasure.standardQuestionFr;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Product Operations Shell Top Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">Fedoo Product Operations</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Control-plane experience reference — prototype
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                How authorised Fedoo operators curate governed capabilities. Experience illustration only — no permissions or backend behaviour invented.
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
            <strong className="text-white">Product Truth separation:</strong> Organisations experience human service concepts
            (“Speed of Service”); Product Operations governs the underlying Measures, Instruments, scales, languages,
            equivalence and lifecycle. This prototype shows the operating experience — publish actions, audit writes and
            unavailable capabilities are marked and disabled.
          </div>
        </div>

        {/* Curation capability map */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {CURATION_CAPABILITIES.map((cap) => (
            <span
              key={cap}
              className="text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Main Operations Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Governed Measure Catalogue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-slate-900">Governed Measure Catalogue</h2>
            <span className="text-xs font-semibold text-slate-500">{measures.length} in prototype subset</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Prototype subset for experience illustration. Production catalogue is the governed authority (EA-01).
          </p>

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
                    {m.category} • {m.scaleFamily} scale • {m.availability === 'available' ? 'Available' : m.availability === 'coming_soon' ? 'Draft preview' : 'Context-gated'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Operations Detail */}
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
                  Governed Measure (prototype subset)
                </span>
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Product Operations sections">
              {(Object.keys(SECTION_LABELS) as OpsSection[]).map((s) => (
                <button
                  key={s}
                  role="tab"
                  aria-selected={activeSection === s}
                  onClick={() => setActiveSection(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    activeSection === s
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {SECTION_LABELS[s]}
                </button>
              ))}
            </div>

            {activeSection === 'instrument' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Governed English formulation ({selectedMeasure.version}):
                  </label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900">
                    &ldquo;{selectedMeasure.standardQuestion}&rdquo;
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Production wording, order, scale and direction are fail-loud governed (EA-02). Wording drift or
                    option reorder is a new version, never a silent edit.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    French formulation — deferred (prototype illustration only)
                  </label>
                  {frIllustration ? (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 font-medium text-slate-800 italic">
                      &ldquo;{frIllustration}&rdquo;
                      <span className="block not-italic text-[11px] text-amber-900 mt-1 font-semibold">
                        Not approved. Translation is not equivalence — no French measurement Instrument or
                        cross-language comparability is authorised in current Product Truth.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                      No French text in this prototype fixture — correctly absent where no approved Instrument exists.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Scale family ({selectedMeasure.scaleFamily}, v1)</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      5-point discrete ordinal items. Favourable = points 4 and 5 on Higher-favourable families only.
                      Prototype illustration — production scale identity is versioned.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Comparability authority</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Same Measure + same instrument version + same scale + same compatibility class only.
                      No unconditional cross-location comparability; no statistical-validity guarantees are made here.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Service rationale (curated)</span>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedMeasure.rationale || 'Curated rationale recorded at publish time (prototype text).'}
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'lifecycle' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <History className="w-4 h-4 text-slate-500" />
                  <span className="font-bold">Lifecycle & version history (prototype illustration)</span>
                </div>
                <ol className="space-y-2">
                  {[
                    { state: 'Published', detail: `${selectedMeasure.version} — current governed version (prototype fixture). Historic sessions pin this version.` },
                    { state: 'Review', detail: 'Candidate wording / scale changes examined before publish. No in-place mutation of published versions.' },
                    { state: 'Draft', detail: 'Work-in-progress content (e.g. “coming soon” measures in this prototype). Never served to participants.' },
                    { state: 'Superseded / Retired', detail: 'Replaced versions stay readable for history; retired content starts no new sessions.' },
                  ].map((row) => (
                    <li key={row.state} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <CircleDashed className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">{row.state} — </span>
                        <span className="text-slate-600">{row.detail}</span>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="text-[11px] text-slate-500">
                  Versioning is governed Product Truth (EA-02/EA-03). Nothing here is &ldquo;immutable v1.0&rdquo; —
                  versions supersede; lineage is preserved.
                </p>
                <button
                  disabled
                  title="Publish is disabled in the prototype"
                  className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Publish new version (not available in prototype)</span>
                </button>
              </div>
            )}

            {activeSection === 'templates' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <LayoutTemplate className="w-4 h-4 text-slate-500" />
                  <span className="font-bold">Question Set templates, pools & configuration support</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Templates & pools</span>
                    <p className="text-[11px] text-slate-500">
                      Production assembles sessions from governed templates/pools with rotation, anchors and
                      eligibility. This prototype fixes one illustration set per feedback point.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Applicability</span>
                    <p className="text-[11px] text-slate-500">
                      Context / sector applicability gates which Measures resolve for an organisation. Participants
                      never author canonical wording, scales, compatibility or Question Set semantics.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Custom questions</span>
                    <p className="text-[11px] text-slate-500">
                      At most one active organisation custom question subject to entitlement; never auto-promoted to a
                      Measure or signal; optional comment stays separate. Not operable in this prototype.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Exposure guidance</span>
                    <p className="text-[11px] text-slate-500">
                      Quick / Standard / Extended exposure bands guide session length; pools may exceed a single
                      session. Prototype burden labels are illustrative.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'diagnostics' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span className="font-bold">Operational diagnostics & audit (prototype illustration)</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileClock className="w-4 h-4 text-slate-400" />
                    <span>Illustrative audit trail: who curated what, when, from which version to which — forthcoming in production.</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] text-slate-500 space-y-1">
                    <li>Evidence freshness, scope and period shown on every production signal (not in this prototype).</li>
                    <li>Series breaks (instrument / language / rule / scope changes) start new series with an attributable reason.</li>
                    <li>No ranked cross-location product; no cross-organisation comparison; no opaque scores.</li>
                  </ul>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Diagnostics detail (evidence-class enforcement, fail-closed reads) — not available in prototype.</span>
                </div>
              </div>
            )}

            {/* Governed State Lock — realigned */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Curated under Fedoo Product Operations (prototype experience only)</span>
              </div>
              <span>Versioned lifecycle — supersede, never silent-edit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
