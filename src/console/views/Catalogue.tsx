import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, BookOpen, Check, Lock } from 'lucide-react';
import { useConsole } from '../store';
import { absTime, relTime } from '../derive';
import { CANONICAL_ROWS } from '../canonicalCatalogue';
import { CATALOGUE_COUNTS, CATALOGUE_FINDINGS, CatalogueConstruct } from '../model';
import {
  Btn, Card, CardHeader, Chip, CommandDialog, CommandSpec, cx, EmptyState, Eyebrow, Field, GatedAction, HealthChip, Mono, Notice, NotAuthorised,
  PageHeader, ScopeChip, SearchBox, Segmented, Select,
} from '../ui';

const VIEWS = [
  { id: 'overview', label: 'Overview' }, { id: 'readiness', label: 'Readiness' }, { id: 'lineage', label: 'Lineage & integrity' },
  { id: 'constructs', label: 'Publishable constructs' }, { id: 'retired', label: 'Retired history' }, { id: 'diagnostics', label: 'Diagnostics' },
];
const fakeId = (id: string) => `00000000-0000-4000-8000-${id.replace(/\D/g, '').padStart(12, '0')}`;
const constructKey = (k: string) => k.toLowerCase().replace(/ /g, '_');

const bySector = CANONICAL_ROWS.reduce<Record<string, number>>((a, r) => { if (r[4]) a[r[4]] = (a[r[4]] ?? 0) + 1; return a; }, {});
const cat = { core: CANONICAL_ROWS.filter((r) => r[3] === 'core').length, extended: CANONICAL_ROWS.filter((r) => r[3] === 'extended').length, sector: CANONICAL_ROWS.filter((r) => r[3] === 'sector').length };
const selectable = CANONICAL_ROWS.filter((r) => r[7]).length;
const conditional = CANONICAL_ROWS.filter((r) => !r[7] && r[8] === 'conditional').length;
const partial = CANONICAL_ROWS.filter((r) => r[5] === 'INSTRUMENT-PARTIAL').length;

const Count: React.FC<{ label: string; c: { draft: number; active: number; retired: number } }> = ({ label, c }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-700">{label}</span>
    <span className="flex gap-1.5 text-[10px] font-bold tabular-nums"><Chip tone="amber">{c.draft} draft</Chip><Chip tone="emerald">{c.active} active</Chip><Chip tone="slate">{c.retired} retired</Chip></span>
  </div>
);

const Overview: React.FC<{ go: (v: string) => void }> = ({ go }) => (
  <div className="space-y-4">
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800">
        <div className="flex items-center gap-2 mb-1"><Lock className="w-3.5 h-3.5 text-cyan-300" /><span className="text-[10px] uppercase tracking-wider font-bold text-cyan-300">Repository-governed · read-only here</span></div>
        <h3 className="text-sm font-bold">Canonical catalogue</h3>
        <div className="flex items-end gap-2 mt-3"><span className="text-5xl font-bold tabular-nums leading-none">{CANONICAL_ROWS.length}</span><span className="text-xs text-slate-400 mb-1">canonical Measures</span></div>
        <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-bold">
          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{cat.core} core</span><span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{cat.extended} extended</span><span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{cat.sector} sector</span>
        </div>
        <div className="mt-4 space-y-1.5">{Object.entries(bySector).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
          <div key={s} className="flex items-center gap-2 text-[10px] text-slate-300"><span className="w-24 capitalize">{s}</span><span className="flex-1 h-1.5 rounded-full bg-slate-800"><span className="block h-full rounded-full bg-cyan-400/80" style={{ width: `${(n / 6) * 100}%` }} /></span><span className="w-4 tabular-nums">{n}</span></div>))}</div>
        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">Measure meaning, Standard Questions, scales, eligibility and calculation rules live in the repository and change only through the Product change path. Operators cannot edit them in this console.</p>
      </section>
      <section className="rounded-2xl bg-white border-2 border-cyan-200 p-5">
        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /><span className="text-[10px] uppercase tracking-wider font-bold text-cyan-800">Runtime-authored · operator-controlled lifecycle</span></div>
        <h3 className="text-sm font-bold text-slate-900">Disposable runtime constructs</h3>
        <p className="text-[11px] text-slate-500 mt-1 mb-2">The only operator commands are <strong>Publish</strong> (draft → active) and <strong>Retire</strong> (draft or active → retired). Lifecycle is forward-only; nothing is deleted or un-retired.</p>
        <Count label="Question Set versions" c={CATALOGUE_COUNTS.questionSetVersions} /><Count label="Assembly Template versions" c={CATALOGUE_COUNTS.assemblyTemplateVersions} />
        <Count label="Response Scale versions" c={CATALOGUE_COUNTS.responseScaleVersions} /><Count label="Sufficiency Rules" c={CATALOGUE_COUNTS.sufficiencyRules} />
        <button onClick={() => go('constructs')} className="mt-3 text-[11px] font-semibold text-cyan-800 flex items-center gap-1">Review publishable constructs<ArrowRight className="w-3 h-3" /></button>
      </section>
    </div>
    <Card>
      <CardHeader title="Runtime projection vs repository" hint="Computed on read; never stored." right={<HealthChip state="failed_observed" label="1 integrity finding" />} />
      <div className="grid sm:grid-cols-4 gap-4">
        <Field label="Runtime Measures">{CATALOGUE_COUNTS.runtimeMeasures.active} active of {CANONICAL_ROWS.length} canonical</Field>
        <Field label="Standard Questions">{CATALOGUE_COUNTS.standardQuestions.active} active · {CATALOGUE_COUNTS.standardQuestions.draft} draft</Field>
        <Field label="Session-presentable">{selectable} Measures</Field>
        <Field label="Language">English only</Field>
      </div>
      <button onClick={() => go('diagnostics')} className="mt-3 text-[11px] font-semibold text-cyan-800 flex items-center gap-1">Open diagnostics<ArrowRight className="w-3 h-3" /></button>
    </Card>
  </div>
);

const Readiness: React.FC = () => {
  const [q, setQ] = useState(''); const [sel, setSel] = useState('all'); const [cg, setCg] = useState('all'); const [n, setN] = useState(20);
  const t = q.trim().toLowerCase();
  const rows = useMemo(() => CANONICAL_ROWS.filter((r) => (!t || `${r[2]} ${r[0]} ${r[4]}`.toLowerCase().includes(t)) && (cg === 'all' || r[3] === cg) &&
    (sel === 'all' || (sel === 'yes' ? r[7] : sel === 'conditional' ? !r[7] && r[8] === 'conditional' : !r[7] && r[8] === 'no'))), [t, sel, cg]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><Eyebrow>Session-presentable</Eyebrow><div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">{selectable}</div><div className="text-[10px] text-slate-400 mt-1">Instrument ready for a live session</div></Card>
        <Card><Eyebrow>Conditional</Eyebrow><div className="text-2xl font-bold text-amber-600 tabular-nums mt-1">{conditional}</div><div className="text-[10px] text-slate-400 mt-1">Presentable only when its rule is met</div></Card>
        <Card><Eyebrow>Instrument incomplete</Eyebrow><div className="text-2xl font-bold text-slate-500 tabular-nums mt-1">{CANONICAL_ROWS.length - selectable - conditional}</div><div className="text-[10px] text-slate-400 mt-1">No usable Instrument yet — still canonical</div></Card>
      </div>
      <Notice tone="neutral">Three separate dimensions. <strong>A · Governed question eligibility</strong>: all {CANONICAL_ROWS.length} rows are canonical governed Measures — none is “unavailable to customers” by catalogue status. <strong>B · Instrument / session readiness</strong>: {selectable} session-presentable, {conditional} conditional, {CANONICAL_ROWS.length - selectable - conditional} instrument-incomplete (no usable Question Version yet). <strong>C · Analytical calculation readiness</strong>: whether a Measure has a governed result band / calculation mapping is decided per Feedback Point diagnostic (see “Analytical readiness gap”), never by this list. {partial} Measures carry an <Mono>INSTRUMENT-PARTIAL</Mono> repository state and all {partial} are still session-presentable — partial definition never implies unselectability.</Notice>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setN(20); }} placeholder="Search Measure, product id or sector" className="lg:flex-1" />
        <Select label="Category" value={cg} onChange={setCg} options={[{ id: 'all', label: 'All' }, { id: 'core', label: 'Core' }, { id: 'extended', label: 'Extended' }, { id: 'sector', label: 'Sector' }]} />
        <Select label="Session readiness" value={sel} onChange={setSel} options={[{ id: 'all', label: 'All' }, { id: 'yes', label: 'Session-presentable' }, { id: 'conditional', label: 'Conditional' }, { id: 'no', label: 'Instrument incomplete' }]} />
      </div>
      <div className="text-[11px] text-slate-500 px-1">{rows.length} of {CANONICAL_ROWS.length} canonical Measures</div>
      <ul className="space-y-2">{rows.slice(0, n).map((r) => (
        <li key={r[0]} className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:flex-1 min-w-0"><div className="text-xs font-bold text-slate-900">{r[2]}</div><div className="text-[10px] text-slate-400 flex gap-2"><Mono>{r[0]}</Mono><span className="capitalize">{r[3]}{r[4] ? ` · ${r[4]}` : ''}</span></div></div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <Chip tone={r[5] === 'DEFINED' ? 'slate' : 'amber'}>{r[5] === 'DEFINED' ? 'Defined' : 'Instrument partial'}</Chip>
            {r[7] ? <Chip tone="emerald" icon={<Check className="w-3 h-3" />}>Session-presentable</Chip> : r[8] === 'conditional' ? <Chip tone="amber">Conditional</Chip> : <Chip tone="slate">Instrument incomplete</Chip>}
            <Chip tone="slate">{r[9]} scale</Chip>
          </div>
        </li>))}</ul>
      {rows.length > n && <div className="text-center"><Btn onClick={() => setN(n + 20)}>Show more</Btn></div>}
      {!rows.length && <EmptyState icon={<BookOpen className="w-4 h-4" />} title="No Measure matches" />}
    </div>
  );
};

const GOVERNANCE = [
  { c: 'Canonical Measure', src: 'repository', ref: 'canonical_measures.json', lifecycle: 'draft → active → retired (runtime row)', can: 'Read · diagnostics · publish / retire runtime row. Meaning is repository-only.' },
  { c: 'Standard Question & Version', src: 'repository', ref: 'canonical_instruments.json', lifecycle: 'draft → active → retired; forward-only', can: 'Read · diagnostics · publish / retire. Wording is repository-only.' },
  { c: 'Response Scale & Version', src: 'repository', ref: 'canonical_instruments.json scales', lifecycle: 'draft → active → retired; options immutable', can: 'Read · publish / retire.' },
  { c: 'Question Set & Version', src: 'runtime', ref: 'OCA §22 governed', lifecycle: 'draft → active → retired; immutable once active', can: 'Read · publish / retire.' },
  { c: 'Assembly Template & Version', src: 'runtime', ref: 'QSAM-001 governs', lifecycle: 'draft → active → retired; immutable', can: 'Read · publish / retire.' },
  { c: 'Sufficiency Rule', src: 'runtime', ref: 'MEA §73', lifecycle: 'draft → active → retired', can: 'Read · publish / retire. No thresholds exist or are added.' },
  { c: 'Eligibility & recommendations', src: 'repository', ref: 'eligibility.py · recommendations.py', lifecycle: 'repository history', can: 'Read only. Recommendations are advisory.' },
  { c: 'Calculation rules', src: 'repository', ref: 'calculation_rules.py + scales', lifecycle: 'registry rule version', can: 'Read only. No formula editor.' },
];
const Lineage: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader title="From Product definition to a live Feedback Point" hint="Where meaning lives, and where lifecycle lives." />
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Repository', `${CANONICAL_ROWS.length} Measures · ${CANONICAL_ROWS.length} Instruments`, 'bg-slate-900 text-white border-slate-900'],
          ['Runtime projection', `${CATALOGUE_COUNTS.runtimeMeasures.active} active Measures`, 'bg-white border-cyan-300'],
          ['Session-presentable', `${selectable} Measures with a usable Instrument`, 'bg-white border-slate-200'],
          ['Effective configurations', '16 configured Feedback Points', 'bg-white border-slate-200']].map(([t, s, c], i) => (
          <li key={t} className={cx('rounded-xl border p-3 relative', c)}><div className="text-[10px] uppercase tracking-wider font-bold opacity-70">Step {i + 1}</div><div className="text-xs font-bold mt-0.5">{t}</div><div className="text-[11px] opacity-80 mt-0.5">{s}</div></li>))}
      </ol>
    </Card>
    <Card>
      <CardHeader title="Source of truth by construct" hint="Never blurred: the repository owns meaning; the runtime owns lifecycle." />
      <ul className="divide-y divide-slate-100">{GOVERNANCE.map((g) => (
        <li key={g.c} className="py-3 grid md:grid-cols-[1.2fr_1fr_1.6fr] gap-x-4 gap-y-1">
          <div><div className="text-xs font-bold text-slate-900">{g.c}</div><div className="mt-1"><Chip tone={g.src === 'repository' ? 'slate' : 'cyan'} icon={g.src === 'repository' ? <Lock className="w-3 h-3" /> : undefined}>{g.src === 'repository' ? 'Repository SSOT' : 'Runtime-authored'}</Chip></div></div>
          <div className="text-[11px] text-slate-500"><Mono>{g.ref}</Mono><div className="mt-1">{g.lifecycle}</div></div>
          <div className="text-[11px] text-slate-700">{g.can}</div>
        </li>))}</ul>
    </Card>
  </div>
);

const ConstructRow: React.FC<{ c: CatalogueConstruct; onCommand: (c: CatalogueConstruct, a: 'publish' | 'retire') => void }> = ({ c, onCommand }) => {
  const { can } = useConsole();
  const gatesOk = c.gates.every((g) => g.satisfied);
  const action = c.status === 'draft' ? 'publish' : 'retire';
  const perm = action === 'publish' ? 'platform.catalogue.publish' : 'platform.catalogue.retire';
  const blocked = action === 'retire' && c.retirementBlockers.length > 0;
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap"><Chip tone="cyan">{c.kind}</Chip><Chip tone={c.status === 'draft' ? 'amber' : c.status === 'active' ? 'emerald' : 'slate'}>{c.status}</Chip></div>
          <div className="text-sm font-bold text-slate-900 mt-1.5">{c.name}</div>
          <div className="text-[11px] text-slate-500">{c.usedBy} · updated {relTime(c.updated)}</div>
        </div>
        {c.status !== 'retired' && (
          <div className="shrink-0">
            <GatedAction held={can(perm)} permission={perm}>
              <Btn variant={action === 'publish' ? 'primary' : 'secondary'} disabled={action === 'publish' ? !gatesOk : blocked} onClick={() => onCommand(c, action)}>{action === 'publish' ? 'Publish…' : 'Retire…'}</Btn>
            </GatedAction>
          </div>)}
      </div>
      {c.status === 'draft' && c.gates.length > 0 && (
        <ul className="mt-3 space-y-1">{c.gates.map((g) => <li key={g.name} className="text-[11px] flex gap-1.5"><span className={g.satisfied ? 'text-emerald-600' : 'text-rose-600'}>{g.satisfied ? '✓' : '✕'}</span><span className="text-slate-700">{g.name}<span className="text-slate-400"> — {g.detail}</span></span></li>)}</ul>)}
      {c.status === 'active' && blocked && <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-3">Retire unavailable: {c.retirementBlockers.map((b) => `${b.count} ${b.reference.replace(/_/g, ' ')}`).join(', ')}. Database triggers remain the authority.</p>}
    </li>
  );
};

const Constructs: React.FC<{ status: 'live' | 'retired' }> = ({ status }) => {
  const { constructs, catalogueCommand } = useConsole();
  const [spec, setSpec] = useState<CommandSpec | null>(null);
  const list = constructs.filter((c) => (status === 'retired' ? c.status === 'retired' : c.status !== 'retired'));
  const onCommand = (c: CatalogueConstruct, a: 'publish' | 'retire') => setSpec({
    title: `${a === 'publish' ? 'Publish' : 'Retire'} ${c.kind}`, verb: a === 'publish' ? 'Publish' : 'Retire', tone: a === 'retire' ? 'danger' : 'default',
    permission: a === 'publish' ? 'platform.catalogue.publish' : 'platform.catalogue.retire', expected: `Status: ${c.status}`, phrase: `${a === 'publish' ? 'PUBLISH' : 'RETIRE'} ${constructKey(c.kind)} ${fakeId(c.id)}`,
    summary: <><strong>{c.name}</strong>. {a === 'publish' ? 'Moves the construct from draft to active.' : 'Retired is terminal for this construct.'}</>,
    consequences: a === 'publish' ? ['Runs the existing owning service transition; nothing is reimplemented.', 'Recorded in the same transaction as the audit event.'] : ['Forward-only: a retired construct cannot be un-retired.', 'Nothing is deleted; history remains.'],
    onConfirm: (r) => catalogueCommand(c.id, a, r),
  });
  return (
    <>
      {status === 'live' && <div className="mb-4"><Notice tone="neutral">Only runtime-authored constructs appear here. The canonical 88 Measures are repository-governed and are never publishable from this console. No governed review state or second-person approval exists; “review” is the read-only validation view.</Notice></div>}
      {list.length ? <ul className="space-y-3">{list.map((c) => <ConstructRow key={c.id} c={c} onCommand={onCommand} />)}</ul> : <EmptyState title="Nothing here" />}
      {status === 'retired' && list.length > 0 && <p className="text-[10px] text-slate-400 mt-3">Retired constructs are history only. Last changed {absTime(list[0].updated)}.</p>}
      {spec && <CommandDialog spec={spec} onClose={() => setSpec(null)} />}
    </>
  );
};

const Diagnostics: React.FC = () => {
  const { can } = useConsole();
  if (!can('platform.catalogue.validation.read')) return <NotAuthorised what="Catalogue diagnostics" permissions={['platform.catalogue.validation.read']} />;
  return (
    <ul className="space-y-3">{CATALOGUE_FINDINGS.map((f) => (
      <li key={f.code} className={cx('rounded-2xl border p-4', f.blocking ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200')}>
        <div className="flex items-center gap-2 flex-wrap">{f.blocking ? <Chip tone="rose" icon={<AlertTriangle className="w-3 h-3" />}>Integrity failure</Chip> : <Chip tone="slate">{f.category}</Chip>}<Mono>{f.code}</Mono></div>
        <p className="text-xs text-slate-700 mt-2 leading-relaxed">{f.detail}</p>
        <div className="text-[10px] text-slate-400 mt-1">Construct: {f.construct.replace(/_/g, ' ')}</div>
      </li>))}</ul>
  );
};

export const CatalogueView: React.FC = () => {
  const { route, go } = useConsole();
  const view = route.query.get('view') ?? 'overview';
  const set = (v: string) => go(`/console/catalogue?view=${v}`);
  return (
    <>
      <PageHeader title="Product / Catalogue" scope={<ScopeChip kind="platform" />}
        subtitle="Fedoo’s product control plane. The canonical catalogue is repository-governed and read-only; operators control only the lifecycle of runtime constructs, deliberately and with their own permission." />
      <div className="mb-5"><Segmented label="Catalogue section" value={view} onChange={set} options={VIEWS} /></div>
      {view === 'overview' && <Overview go={set} />}
      {view === 'readiness' && <Readiness />}
      {view === 'lineage' && <Lineage />}
      {view === 'constructs' && <Constructs status="live" />}
      {view === 'retired' && <Constructs status="retired" />}
      {view === 'diagnostics' && <Diagnostics />}
    </>
  );
};
