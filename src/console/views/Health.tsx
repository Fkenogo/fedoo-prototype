import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { useConsole } from '../store';
import {
  absTime, countStates, feedbackPointFacts, fixedFacts, HEALTH_SECTION_META, HEALTH_SECTION_ORDER, HealthFact, HealthSectionKey, humanize,
  inventoryFacts, relTime, rollup,
} from '../derive';
import { HealthState } from '../model';
import { Card, CardHeader, Chip, cx, Eyebrow, Field, HealthChip, Mono, Notice, PageHeader, ScopeChip, Segmented, Select } from '../ui';

interface Section { key: HealthSectionKey; facts: HealthFact[]; state: HealthState; applicable: boolean }

function buildSections(scopeOrgId: string | undefined, orgs: ReturnType<typeof useConsole>['orgs'], fps: ReturnType<typeof useConsole>['fps']): Section[] {
  const scoped = scopeOrgId ? fps.filter((f) => f.orgId === scopeOrgId) : fps;
  const per = scoped.flatMap(feedbackPointFacts);
  const fixed = fixedFacts();
  const inv = inventoryFacts(orgs, scopeOrgId);
  return HEALTH_SECTION_ORDER.map((key) => {
    let facts: HealthFact[] = [];
    const meta = HEALTH_SECTION_META[key];
    if (meta.scope === 'platform' && scopeOrgId) return { key, facts: [], state: 'not_applicable' as HealthState, applicable: false };
    if (meta.scope === 'product') {
      const own = per.filter((f) => f.path === key);
      if (scopeOrgId) facts = own;
      else {
        // Platform scope returns aggregates without Organisation or Feedback Point identity.
        const by = new Map<string, HealthFact[]>();
        own.forEach((f) => by.set(f.condition, [...(by.get(f.condition) ?? []), f]));
        facts = [...by.entries()].map(([condition, list]) => ({
          ...list[0], condition, orgId: undefined, fpId: undefined, reason: undefined, state: rollup(list.map((x) => x.state)),
          counts: countStates(list.map((x) => x.state)), note: `${list.length} Feedback Points evaluated`,
        }));
      }
      facts = [...facts, ...(fixed[key] ?? [])];
    } else if (meta.scope === 'inventory') facts = [...(inv[key] ?? []), ...(fixed[key] ?? [])];
    else facts = fixed[key] ?? [];
    return { key, facts, state: facts.length ? rollup(facts.map((f) => f.state)) : 'not_observed', applicable: true };
  });
}

const FactRow: React.FC<{ f: HealthFact; scoped: boolean }> = ({ f, scoped }) => {
  const { fps, go } = useConsole();
  const fp = f.fpId ? fps.find((x) => x.id === f.fpId) : undefined;
  return (
    <li className="py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
        <div className="sm:w-60 shrink-0">
          <div className="text-xs font-semibold text-slate-800">{humanize(f.condition)}</div>
          {fp && <button onClick={() => go(`/console/feedback/${fp.id}`)} className="text-[10px] font-semibold text-cyan-800 hover:underline">{fp.name} <ArrowRight className="inline w-3 h-3" /></button>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {f.counts ? Object.entries(f.counts).map(([s, n]) => <span key={s} className="inline-flex items-center gap-1"><HealthChip state={s as HealthState} /><span className="text-[10px] font-bold text-slate-500 tabular-nums">×{n}</span></span>) : <HealthChip state={f.state} />}
          {f.classification && <Chip tone="slate">{humanize(f.classification)}</Chip>}
        </div>
      </div>
      {(f.reason || f.note) && <p className="text-[11px] text-slate-500 mt-1 sm:ml-[16.5rem] leading-snug">{f.reason && <>Reason <Mono>{f.reason}</Mono> </>}{f.note}</p>}
      <details className="sm:ml-[16.5rem] mt-1">
        <summary className="text-[10px] font-semibold text-slate-400 cursor-pointer select-none">Source and freshness</summary>
        <div className="mt-1.5 grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 rounded-xl border border-slate-200 p-2.5">
          <Field label="Source">{f.source}</Field><Field label="Observability">{humanize(f.observability)}</Field>
          <Field label="Observed">{absTime(f.observedAt)}</Field><Field label="Source event">{f.sourceEventAt ? `${relTime(f.sourceEventAt)}` : '—'}</Field>
          <Field label="Staleness threshold">Unavailable (none governed)</Field><Field label="Scope">{scoped ? 'Organisation target' : 'Platform aggregate'}</Field>
        </div>
      </details>
    </li>
  );
};

const PATH_FLOW: HealthSectionKey[] = ['participant_access', 'feedback_operations', 'product_acceptance', 'evidence', 'results', 'signals'];

export const HealthPanel: React.FC<{ scopeOrgId?: string }> = ({ scopeOrgId }) => {
  const { orgs, fps, go } = useConsole();
  const sections = useMemo(() => buildSections(scopeOrgId, orgs, fps), [scopeOrgId, orgs, fps]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(sections.filter((s) => !['healthy_observed', 'not_applicable'].includes(s.state) && HEALTH_SECTION_META[s.key].scope === 'product').map((s) => s.key)));
  const toggle = (k: string) => setOpen((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const scoped = !!scopeOrgId;
  const evaluated = scoped ? fps.filter((f) => f.orgId === scopeOrgId).length : fps.length;
  const tile = (s: Section) => {
    const meta = HEALTH_SECTION_META[s.key];
    const counts = countStates(s.facts.flatMap((f) => (f.counts ? Object.entries(f.counts).flatMap(([st, n]) => Array(n).fill(st) as HealthState[]) : [f.state])));
    return (
      <button key={s.key} onClick={() => toggle(s.key)} aria-expanded={open.has(s.key)} className={cx('text-left rounded-2xl border bg-white p-3.5 transition-colors hover:border-cyan-500/60 h-full', open.has(s.key) ? 'border-cyan-500' : 'border-slate-200')}>
        <div className="flex items-start justify-between gap-2"><div className="text-xs font-bold text-slate-900">{meta.label}</div>{open.has(s.key) ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}</div>
        <p className="text-[10px] text-slate-500 leading-snug mt-1 min-h-[2.4em]">{meta.customer}</p>
        <div className="mt-2"><HealthChip state={s.state} /></div>
        <div className="text-[10px] text-slate-400 mt-1.5">{Object.entries(counts).map(([st, n]) => `${n} ${st.replace('_observed', '').replace('_', ' ')}`).join(' · ') || '—'}</div>
      </button>
    );
  };
  const by = (k: HealthSectionKey) => sections.find((s) => s.key === k)!;
  const group = (title: string, hint: string, keys: HealthSectionKey[], flow?: boolean) => (
    <div className="mb-5">
      <div className="mb-2"><Eyebrow>{title}</Eyebrow><p className="text-[11px] text-slate-500">{hint}</p></div>
      <div className={cx('grid gap-3', flow ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-3')}>{keys.map((k) => tile(by(k)))}</div>
    </div>
  );
  return (
    <div>
      <Notice tone="info" title="Observations, not scores">Missing telemetry is shown as <strong>not observed</strong>, never healthy. A missing failure record never proves nothing failed. No uptime, SLA, response-time target or error budget is implied.</Notice>
      <div className="text-[11px] text-slate-500 my-3">Feedback Points evaluated {evaluated} of {evaluated} · window 168 h · observed {absTime('2026-10-02T09:14:00Z')}</div>
      {!scoped && (
        <Card tone="muted" className="mb-5">
          <CardHeader title="Who is affected?" />
          <p className="text-[11px] text-slate-600 leading-relaxed">The platform-wide read returns aggregates only — it names no Organisation or Feedback Point. To see who is affected, select an Organisation target above, or open <button onClick={() => go('/console/attention')} className="font-semibold text-cyan-800 underline">Needs Attention</button>, which names the Organisation and the source fact.</p>
        </Card>
      )}
      {group('Customer-facing product path', 'Read in the order a participant’s feedback travels.', PATH_FLOW, true)}
      {group('Inventories · no health judgement', 'Pending admission and zero CU are by-design states, so they are counts, not failures.', ['organisation_readiness', 'commercial_capacity', 'access'])}
      {!scoped ? group('Platform', 'Visible only to a platform-target grant.', ['catalogue', 'runtime_dependencies']) : (
        <Notice tone="neutral">Catalogue and runtime-dependency facts are platform-scope and are not shown under an Organisation target.</Notice>)}
      <div className="space-y-3 mt-5">
        {sections.filter((s) => open.has(s.key) && s.applicable).map((s) => (
          <Card key={s.key}>
            <CardHeader title={HEALTH_SECTION_META[s.key].label} hint={HEALTH_SECTION_META[s.key].customer} right={<HealthChip state={s.state} />} />
            <ul className="divide-y divide-slate-100">{s.facts.map((f, i) => <FactRow key={`${f.condition}-${f.fpId ?? i}`} f={f} scoped={scoped} />)}</ul>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const HealthView: React.FC = () => {
  const { orgs, route, go } = useConsole();
  const orgId = route.query.get('org') ?? '';
  const scope = orgId ? 'organisation' : 'platform';
  const set = (s: string, id?: string) => go(s === 'platform' ? '/console/health' : `/console/health?org=${id ?? orgs[0].id}`);
  const org = orgs.find((o) => o.id === orgId);
  return (
    <>
      <PageHeader title="Platform Health" scope={scope === 'platform' ? <ScopeChip kind="platform" /> : <ScopeChip kind="organisation" name={org?.name} />}
        subtitle="Product-path-first and factual. Each fact names its source, observation time and observability. Choose a platform aggregate or one Organisation target — one grant never implies the other." />
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Segmented label="Health scope" value={scope} onChange={(s) => set(s)} options={[{ id: 'platform', label: 'Platform-wide (aggregate)' }, { id: 'organisation', label: 'Organisation target' }]} />
        {scope === 'organisation' && <Select label="Organisation" value={orgId} onChange={(id) => set('organisation', id)} options={orgs.map((o) => ({ id: o.id, label: o.name }))} />}
      </div>
      <HealthPanel key={orgId || 'platform'} scopeOrgId={orgId || undefined} />
    </>
  );
};
