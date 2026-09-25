import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  FlaskConical,
  Languages as LanguagesIcon,
  Compass,
  GitBranch,
  History as HistoryIcon,
  Stethoscope,
  Search,
  ChevronRight,
  Lock,
  Plus,
  CheckCircle2,
  CircleDashed,
  ArrowRight,
} from 'lucide-react';
import {
  ProductOpsModel,
  OpsMeasure,
  OpsDraft,
  OpsSection,
  LifecycleState,
  Readiness,
} from './opsTypes';
import { CANONICAL_MEASURE_COUNT } from '../../data/productOpsData';

export type { OpsSection } from './opsTypes';

export interface OpsSectionProps {
  model: ProductOpsModel;
  canPublish?: boolean;
  canMutate?: boolean;
  roleRestrictionMessage?: string;
  onNavigate: (section: OpsSection) => void;
  onCreateDraft: (draft: OpsDraft) => void;
  onAdvanceDraft: (id: string) => void;
  onUpdateDraftBody: (id: string, body: string) => void;
  onToggleDiagnostic: (id: string) => void;
  onToggleDescriptor: (id: string) => void;
  onToggleRecommendationMeasure: (
    mapId: string,
    measureId: string,
    kind: 'recommended' | 'alsoRelevant'
  ) => void;
}

const lifecycleBadge: Record<LifecycleState, string> = {
  Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Draft: 'bg-amber-50 text-amber-800 border-amber-200',
  Review: 'bg-sky-50 text-sky-800 border-sky-200',
  Retired: 'bg-slate-100 text-slate-600 border-slate-200',
};

const readinessBadge: Record<Readiness, string> = {
  Operational: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Instrument-ready': 'bg-cyan-50 text-cyan-800 border-cyan-200',
  Defined: 'bg-slate-100 text-slate-600 border-slate-200',
  Incomplete: 'bg-rose-50 text-rose-700 border-rose-200',
};

const Badge: React.FC<{ className: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${className}`}>
    {children}
  </span>
);

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------
export const OpsOverview: React.FC<OpsSectionProps> = ({ model, onNavigate }) => {
  const total = model.measures.length;
  const operational = model.measures.filter((m) => m.readiness === 'Operational').length;
  const defined = model.measures.filter((m) => m.readiness === 'Defined').length;
  const incomplete = model.measures.filter((m) => m.readiness === 'Incomplete').length;
  const withoutInstrument = model.measures.filter((m) => !m.instrumentId).length;
  const drafts = model.drafts.filter((d) => d.state !== 'Published').length;
  const openDiagnostics = model.diagnostics.filter((d) => !d.resolved).length;

  const cards = [
    {
      section: 'measure-library' as OpsSection,
      icon: BookOpen,
      title: 'Measure Library',
      primary: `${total} Measures loaded`,
      secondary: `${operational} Operational · ${defined} Defined${
        incomplete > 0 ? ` · ${incomplete} Incomplete` : ''
      }`,
    },
    {
      section: 'instruments' as OpsSection,
      icon: FlaskConical,
      title: 'Instruments',
      primary: `${model.instruments.length} Instruments`,
      secondary: `${withoutInstrument} Measures without an Instrument`,
    },
    {
      section: 'languages' as OpsSection,
      icon: LanguagesIcon,
      title: 'Languages',
      primary: 'English operational',
      secondary: 'French in progress',
    },
    {
      section: 'sector-mapping' as OpsSection,
      icon: Compass,
      title: 'Sector & Context Mapping',
      primary: `${model.recommendations.length} contexts`,
      secondary: 'Beauty, Café, Clinic…',
    },
    {
      section: 'recommendations' as OpsSection,
      icon: GitBranch,
      title: 'Recommendations & Templates',
      primary: `${model.templates.length} templates`,
      secondary: `${drafts} internal drafts`,
    },
    {
      section: 'diagnostics' as OpsSection,
      icon: Stethoscope,
      title: 'Diagnostics',
      primary: `${openDiagnostics} open issues`,
      secondary: 'References, metadata, retired content',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Operations overview</h2>
        <p className="text-xs text-slate-500 mt-1">
          An operational snapshot of the governed catalogue. Factual states only.
        </p>
        <div className="mt-3 inline-flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <span>
            Canonical catalogue: <strong className="font-semibold text-slate-700">{CANONICAL_MEASURE_COUNT} Measures</strong>
          </span>
          <span className="text-slate-300">·</span>
          <span>
            Loaded in this prototype workspace: <strong className="font-semibold text-slate-700">{total}</strong>
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="capability-readiness-heading">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <h3 id="capability-readiness-heading" className="text-sm font-bold text-slate-900">Configuration readiness ≠ analytical readiness</h3>
            <p className="mt-1 text-xs text-slate-500">The V1 catalogue has 88 governed selectable questions globally. Selection does not imply identical downstream analytics.</p>
          </div>
          <Badge className="bg-slate-100 text-slate-700 border-slate-200">Verified capability reference</Badge>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ['Governed Question / Instrument availability', 'AVAILABLE', '88 selectable questions globally; loaded catalogue items are shown above.'],
            ['Configuration / selectability', 'AVAILABLE', 'Five governed questions are selected in an Organisation configuration.'],
            ['Distribution capability', 'AVAILABLE', 'Distribution semantics may exist without governed band or movement semantics.'],
            ['Governed favourable-band semantics', 'AVAILABLE', 'Verified mappings exist for Quality, Satisfaction and Likelihood in the verified engine context. No other mapping is inferred.'],
            ['Comparison capability', 'DEFERRED', 'This catalogue summary has no per-question comparison mapping. Apply only an explicit governed mapping and existing comparison rules.'],
            ['Movement capability', 'DEFERRED', 'This catalogue summary has no per-question movement mapping. A band mapping does not imply movement capability.'],
            ['Language / equivalence capability', 'DEFERRED', 'English Instrument availability is shown per Instrument. French candidate wording does not establish equivalence.'],
          ].map(([label, state, detail]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <b className="text-xs text-slate-800">{label}</b>
                <Badge className={state === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}>{state}</Badge>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-slate-400">Availability and configuration are separate from analytical readiness. Missing mappings are not inferred by this prototype.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.title}
              onClick={() => onNavigate(c.section)}
              className="text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-cyan-500/60 hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-cyan-300 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-900">{c.title}</div>
              <div className="text-xs text-slate-700 mt-1 font-semibold">{c.primary}</div>
              <div className="text-[11px] text-slate-500">{c.secondary}</div>
              <div className="mt-3 text-[11px] font-bold text-cyan-800 flex items-center gap-0.5">
                <span>Open workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Measure Library
// ---------------------------------------------------------------------------
export const MeasureLibrary: React.FC<OpsSectionProps> = ({ model }) => {
  const [search, setSearch] = useState('');
  const [lifecycle, setLifecycle] = useState('all');
  const [readiness, setReadiness] = useState('all');
  const [sector, setSector] = useState('all');
  const [selectedId, setSelectedId] = useState<string>(model.measures[0]?.id || '');

  const filtered = model.measures.filter((m) => {
    if (lifecycle !== 'all' && m.lifecycle !== lifecycle) return false;
    if (readiness !== 'all' && m.readiness !== readiness) return false;
    if (sector !== 'all' && !m.sectors.includes(sector)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.definition.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selected = model.measures.find((m) => m.id === selectedId) || filtered[0] || model.measures[0];
  const instrument = model.instruments.find((i) => i.measureId === selected?.id);
  const measureHistory = model.history.filter((h) => h.object.includes(selected?.name || '___'));

  const sectors = Array.from(new Set(model.measures.flatMap((m) => m.sectors)));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Measure Library</h2>
        <p className="text-xs text-slate-500 mt-1">
          The internal operational catalogue. Not Organisation-facing language.
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Showing {model.measures.length} loaded prototype fixtures · Canonical catalogue:{' '}
          {CANONICAL_MEASURE_COUNT} Measures
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Measures"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-600/30"
          />
        </div>
        <select value={lifecycle} onChange={(e) => setLifecycle(e.target.value)} aria-label="Lifecycle" className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
          <option value="all">All lifecycle</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Retired">Retired</option>
        </select>
        <select value={readiness} onChange={(e) => setReadiness(e.target.value)} aria-label="Readiness" className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
          <option value="all">All readiness</option>
          <option value="Operational">Operational</option>
          <option value="Defined">Defined</option>
          <option value="Incomplete">Incomplete</option>
        </select>
        <select value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Sector" className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
          <option value="all">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
          {filtered.map((m) => {
            const isSel = selected?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  isSel ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold truncate">{m.name}</span>
                  <span className={`text-[10px] font-mono ${isSel ? 'text-cyan-300' : 'text-slate-400'}`}>{m.version}</span>
                </div>
                <div className={`text-[10px] mt-1 ${isSel ? 'text-slate-300' : 'text-slate-500'}`}>
                  {m.domain} · {m.readiness}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-xs text-slate-500 italic p-3">No Measures match these filters.</div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selected && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-extrabold text-slate-900">{selected.name}</h3>
                  <Badge className={lifecycleBadge[selected.lifecycle]}>{selected.lifecycle}</Badge>
                  <Badge className={readinessBadge[selected.readiness]}>{selected.readiness}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">{selected.definition}</p>
              </div>

              <Section title="Operational readiness">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <Fact label="Domain" value={selected.domain} />
                  <Fact label="Instrument coverage" value={instrument ? `${instrument.version} · complete` : 'No instrument yet'} />
                </div>
              </Section>

              <Section title="Applicability">
                <div className="flex flex-wrap gap-1.5">
                  {selected.sectors.map((s) => (
                    <span key={s} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </Section>

              <Section title="Language coverage">
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div>
                    Measure defined:{' '}
                    <strong className="font-semibold">
                      {selected.lifecycle === 'Retired' ? 'Retired' : 'Yes'}
                    </strong>
                  </div>
                  <div>
                    English Instrument:{' '}
                    <strong className="font-semibold">
                      {instrument ? instrument.english : 'Not yet available'}
                    </strong>
                  </div>
                  <div>
                    French Instrument:{' '}
                    <strong className="font-semibold">
                      {instrument ? instrument.french : 'Not yet available'}
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Coverage follows the Instrument. French wording does not by itself establish
                  measurement equivalence.
                </p>
              </Section>

              <Section title="Recommendation usage">
                {selected.recommendedFor.length > 0 ? (
                  <div className="text-xs text-slate-600">
                    Recommended for: {selected.recommendedFor.join(', ')}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">Not currently recommended in any context.</div>
                )}
                {selected.usedInTemplates.length > 0 && (
                  <div className="text-xs text-slate-600 mt-1">
                    Used in templates: {selected.usedInTemplates.join(', ')}
                  </div>
                )}
              </Section>

              {measureHistory.length > 0 && (
                <Section title="History">
                  <ul className="space-y-1.5">
                    {measureHistory.map((h) => (
                      <li key={h.id} className="text-[11px] text-slate-600">
                        <span className="text-slate-400">{h.time}</span> · {h.action} ·{' '}
                        <span className="font-semibold">{h.versionState}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                Reference: <span className="font-mono">{selected.id}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Instruments workspace
// ---------------------------------------------------------------------------
export const InstrumentsWorkspace: React.FC<OpsSectionProps> = ({
  model,
  canPublish = true,
  canMutate = true,
  roleRestrictionMessage = 'Illustrative role restriction — final operator permissions require Product/Security authority.',
  onCreateDraft,
  onAdvanceDraft,
  onUpdateDraftBody,
}) => {
  const [selectedId, setSelectedId] = useState<string>(model.instruments[0]?.id || '');
  const [draftBody, setDraftBody] = useState('');
  const selected = model.instruments.find((i) => i.id === selectedId) || model.instruments[0];
  const measure = model.measures.find((m) => m.id === selected?.measureId);

  const instrumentDrafts = model.drafts.filter(
    (d) => d.objectType === 'Instrument' && d.objectName.includes(measure?.name || '___')
  );

  const handleCreateDraft = () => {
    if (!selected || !measure) return;
    onCreateDraft({
      id: `draft-${Date.now()}`,
      objectType: 'Instrument',
      objectName: `${measure.name} — new draft`,
      state: 'Draft',
      operator: 'You (prototype)',
      updated: 'Just now',
      summary: 'New draft version created from the published Instrument.',
      body: draftBody || selected.standardQuestion,
    });
    setDraftBody('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Instruments</h2>
        <p className="text-xs text-slate-500 mt-1">
          Measure → standard question → variants → scale → eligibility → language → comparability.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs border-separate border-spacing-y-1">
          <thead className="text-[10px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-1">Measure</th>
              <th className="px-3 py-1">Variants</th>
              <th className="px-3 py-1">Scale</th>
              <th className="px-3 py-1">Eligibility</th>
              <th className="px-3 py-1">Languages</th>
              <th className="px-3 py-1">Version</th>
              <th className="px-3 py-1">State</th>
            </tr>
          </thead>
          <tbody>
            {model.instruments.map((inst) => {
              const m = model.measures.find((x) => x.id === inst.measureId);
              const isSel = selected?.id === inst.id;
              return (
                <tr
                  key={inst.id}
                  onClick={() => setSelectedId(inst.id)}
                  className={`cursor-pointer ${isSel ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                >
                  <td className="px-3 py-2 rounded-l-xl font-bold">{m?.name || inst.measureId}</td>
                  <td className="px-3 py-2">{inst.variants.length}</td>
                  <td className="px-3 py-2 capitalize">{inst.scaleFamily}</td>
                  <td className="px-3 py-2">{inst.eligibility}</td>
                  <td className="px-3 py-2">
                    EN {inst.english} · FR {inst.french}
                  </td>
                  <td className="px-3 py-2 font-mono">{inst.version}</td>
                  <td className="px-3 py-2 rounded-r-xl">{inst.state}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              {measure?.name} Instrument <span className="font-mono text-xs text-slate-400">{selected.version}</span>
            </h3>
            <button
              onClick={handleCreateDraft}
              className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create new draft version</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Standard question ({selected.version}, published)
            </div>
            <div className="font-medium text-slate-900">"{selected.standardQuestion}"</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Fact label="Scale family" value={selected.scaleFamily} />
            <Fact label="Eligibility" value={selected.eligibility} />
            <Fact label="English" value={selected.english} />
            <Fact label="French" value={selected.french} />
            <Fact label="Comparability / equivalence" value={selected.equivalence} />
            <Fact label="State" value={selected.state} />
          </div>

          <Section title="Approved variants">
            <ul className="space-y-1.5">
              {selected.variants.map((v) => (
                <li key={v.id} className="text-xs flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <span className="text-slate-800">{v.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{v.language}</span>
                    <Badge
                      className={
                        v.state === 'Published' || v.state === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }
                    >
                      {v.state}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Published content is not edited in place. Changes start a new draft version and are
              published as a new version; historic versions stay readable.
            </span>
          </div>

          {/* Draft lifecycle */}
          <Section title="Draft versions">
            <div className="flex flex-wrap gap-2 mb-3">
              <input
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                placeholder="Draft wording (prototype)"
                className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-600/30"
              />
            </div>
            {instrumentDrafts.length === 0 ? (
              <div className="text-xs text-slate-500 italic">No drafts for this Instrument yet.</div>
            ) : (
              <ul className="space-y-2">
                {instrumentDrafts.map((d) => (
                  <li key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">{d.objectName}</span>
                      <Badge className={lifecycleBadge[d.state as LifecycleState]}>{d.state}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-500">{d.summary}</div>
                    {d.body && (
                      <input
                        defaultValue={d.body}
                        onChange={(e) => onUpdateDraftBody(d.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                      />
                    )}
                    {d.state !== 'Published' && (
                      <>
                      <button
                        disabled={!canMutate || (d.state === 'Review' && !canPublish)}
                        onClick={() => onAdvanceDraft(d.id)}
                        title={!canMutate ? roleRestrictionMessage : d.state === 'Review' && !canPublish ? roleRestrictionMessage : undefined}
                        className="text-[11px] font-bold text-cyan-800 hover:text-cyan-950 flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>{d.state === 'Draft' ? 'Send to Review' : 'Publish new version'}</span>
                      </button>
                      {((!canMutate) || (d.state === 'Review' && !canPublish)) && (
                        <p className="text-[10px] text-amber-800">{roleRestrictionMessage}</p>
                      )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Languages workspace
// ---------------------------------------------------------------------------
export const LanguagesWorkspace: React.FC<OpsSectionProps> = ({ model }) => {
  // Language operability is derived from Instruments, never from Measures alone.
  const englishApproved = model.instruments.filter((i) => i.english === 'Operational').length;
  const frenchApproved = model.instruments.filter((i) => i.french === 'Operational').length;
  const frenchCandidate = model.instruments.filter((i) => i.french === 'Candidate').length;
  const frenchMissing = model.instruments.filter((i) => i.french === 'Missing').length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Languages</h2>
        <p className="text-xs text-slate-500 mt-1">
          Language operability of the governed catalogue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LanguageCard
          name="English"
          state="Operational"
          rows={[
            ['Measures with approved Instruments', String(englishApproved)],
            ['Instruments missing translation', '0'],
            ['Variants pending', '0'],
            ['Comparison / equivalence', 'Source language'],
            ['Last update', 'Today'],
          ]}
        />
        <LanguageCard
          name="French"
          state="In progress"
          rows={[
            ['Measures with approved Instruments', String(frenchApproved)],
            ['Instruments missing translation', String(frenchMissing)],
            ['Variants pending', String(frenchCandidate)],
            ['Comparison / equivalence', 'Not approved'],
            ['Last update', 'Today'],
          ]}
        />
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
        <div className="font-bold">Translation is not equivalence</div>
        <p className="leading-relaxed">
          French wording may be available while cross-language comparison is not yet approved.
          Equivalence is a separate governed decision from translation.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">French workflow</h3>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          {['English source Instrument', 'French candidate', 'Review', 'Approved French Instrument', 'Equivalence status'].map(
            (step, i, arr) => (
              <React.Fragment key={step}>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                  {step}
                </span>
                {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </React.Fragment>
            )
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          Prototype illustration of the workflow only — no French content is approved here.
        </p>
      </div>
    </div>
  );
};

const LanguageCard: React.FC<{ name: string; state: string; rows: [string, string][] }> = ({
  name,
  state,
  rows,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-900">{name}</h3>
      <Badge
        className={
          state === 'Operational'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }
      >
        {state}
      </Badge>
    </div>
    <dl className="space-y-1.5">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-3 text-xs">
          <dt className="text-slate-500">{k}</dt>
          <dd className="font-semibold text-slate-800 text-right">{v}</dd>
        </div>
      ))}
    </dl>
  </div>
);

// ---------------------------------------------------------------------------
// Sector & Context Mapping (+ recommendations, templates, descriptors)
// ---------------------------------------------------------------------------
export const SectorMapping: React.FC<OpsSectionProps> = ({ model, onToggleDescriptor }) => {
  const measureName = (id: string) => model.measures.find((m) => m.id === id)?.name || id;
  const universal = model.measures.filter((m) => m.sectors.includes('Universal'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Sector & Context Mapping</h2>
        <p className="text-xs text-slate-500 mt-1">
          Which Measures are relevant for which business contexts. Universal Measures are shared;
          context adds recommendations without duplicating Measures.
        </p>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">Universal Measures</h3>
        <div className="flex flex-wrap gap-1.5">
          {universal.map((m) => (
            <span key={m.id} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              {m.name}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Context mapping</h3>
        {model.recommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{rec.context}</span>
              <span className="text-[11px] text-slate-500">· {rec.descriptor}</span>
              <Badge className={lifecycleBadge[rec.state]}>{rec.state}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
              <div>
                <div className="font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Recommended
                </div>
                <div className="text-slate-700">{rec.recommended.map(measureName).join(', ')}</div>
              </div>
              <div>
                <div className="font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Additional
                </div>
                <div className="text-slate-700">{rec.alsoRelevant.map(measureName).join(', ')}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Custom descriptors */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Organisation-specific descriptors</h3>
        <p className="text-[11px] text-slate-500">
          Organisations use their own descriptors immediately — this is not an approval queue.
          Recurring terminology is observed here as a taxonomy-refinement signal.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {model.descriptors.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <div className="text-sm font-bold text-slate-900">{d.term}</div>
              <div className="text-[11px] text-slate-500">{d.observed}</div>
              <button
                onClick={() => onToggleDescriptor(d.id)}
                className={`text-[11px] font-bold flex items-center gap-1 ${
                  d.reviewed ? 'text-emerald-700' : 'text-cyan-800 hover:text-cyan-950'
                }`}
              >
                {d.reviewed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Reviewed for catalogue refinement</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>Review for catalogue refinement</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Recommendations & Templates
// ---------------------------------------------------------------------------
export const RecommendationsTemplates: React.FC<OpsSectionProps> = ({
  model,
  onToggleRecommendationMeasure,
}) => {
  const measureName = (id: string) => model.measures.find((m) => m.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Recommendations & Templates</h2>
        <p className="text-xs text-slate-500 mt-1">
          What Fedoo suggests an Organisation starts tracking, and reusable starting
          configurations. Setup guidance only — never result-based business advice.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Recommendation mappings</h3>
        {model.recommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{rec.context}</span>
              <span className="text-[11px] text-slate-500">· {rec.descriptor}</span>
              <Badge className={lifecycleBadge[rec.state]}>{rec.state}</Badge>
            </div>
            <p className="text-[11px] text-slate-500">{rec.reason}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MapList
                title="Recommended starting Measures"
                ids={rec.recommended}
                measureName={measureName}
                onToggle={(id) => onToggleRecommendationMeasure(rec.id, id, 'recommended')}
              />
              <MapList
                title="Also relevant"
                ids={rec.alsoRelevant}
                measureName={measureName}
                onToggle={(id) => onToggleRecommendationMeasure(rec.id, id, 'alsoRelevant')}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Prototype content — not canonical Product Truth recommendations.
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {model.templates.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{t.name}</span>
                <Badge className={lifecycleBadge[t.state]}>{t.state}</Badge>
              </div>
              <div className="text-[11px] text-slate-500">{t.context}</div>
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold">Measure intents:</span>{' '}
                {t.measureIntents.map(measureName).join(', ')}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>{t.burden}</span>
                <span>·</span>
                <span>{t.languages}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const MapList: React.FC<{
  title: string;
  ids: string[];
  measureName: (id: string) => string;
  onToggle: (id: string) => void;
}> = ({ title, ids, measureName, onToggle }) => (
  <div className="space-y-1.5">
    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{title}</div>
    <div className="space-y-1">
      {ids.length === 0 && <div className="text-[11px] text-slate-400 italic">None</div>}
      {ids.map((id) => (
        <div
          key={id}
          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]"
        >
          <span className="text-slate-700">{measureName(id)}</span>
          <button onClick={() => onToggle(id)} className="text-[10px] font-bold text-slate-400 hover:text-rose-600">
            Remove
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Change history
// ---------------------------------------------------------------------------
export const ChangeHistory: React.FC<OpsSectionProps> = ({ model }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-lg font-bold text-slate-900">Change history</h2>
      <p className="text-xs text-slate-500 mt-1">
        Operational traceability of central product changes. Not a security-grade audit guarantee.
      </p>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
      {model.history.map((h) => (
        <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900">{h.object}</div>
            <div className="text-[11px] text-slate-500">{h.action}</div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 shrink-0">
            <span>{h.operator}</span>
            <span className="font-mono">{h.versionState}</span>
            <span className="text-slate-400">{h.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------
export const Diagnostics: React.FC<OpsSectionProps> = ({ model, onToggleDiagnostic }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-lg font-bold text-slate-900">Diagnostics</h2>
      <p className="text-xs text-slate-500 mt-1">
        Operational issues in the catalogue — references, metadata and lifecycle. Not
        customer/business attention semantics.
      </p>
    </div>
    <div className="space-y-2">
      {model.diagnostics.map((d) => (
        <div
          key={d.id}
          className={`bg-white rounded-2xl border p-4 flex items-start justify-between gap-3 ${
            d.resolved ? 'border-slate-200 opacity-70' : 'border-slate-200'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={
                  d.state === 'Missing reference'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : d.state === 'Needs correction'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }
              >
                {d.state}
              </Badge>
              <span className="text-xs font-bold text-slate-900">{d.object}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{d.detail}</div>
          </div>
          <button
            onClick={() => onToggleDiagnostic(d.id)}
            className={`text-[11px] font-bold shrink-0 flex items-center gap-1 ${
              d.resolved ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {d.resolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
            <span>{d.resolved ? 'Resolved' : 'Mark resolved'}</span>
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-1.5">
    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{title}</div>
    {children}
  </div>
);

const Fact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
    <div className="text-[10px] text-slate-500 font-medium">{label}</div>
    <div className="text-xs font-bold text-slate-900 mt-0.5">{value}</div>
  </div>
);
