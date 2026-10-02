import React, { useMemo, useState } from 'react';
import { BellRing, Check } from 'lucide-react';
import { useConsole } from '../store';
import { AttentionCondition, CONDITIONS, DEFERRED_ATTENTION_SOURCES } from '../model';
import { Card, CardHeader, Chip, cx, Disclosure, EmptyState, Eyebrow, Notice, PageHeader, ScopeChip, Segmented, Select, SEVERITY_META } from '../ui';
import { AttentionCard } from './shared';

const DOMAIN_LABEL: Record<string, string> = { organisation_operations: 'Organisations', commercial: 'Commercial', feedback_operations: 'Feedback Operations', product_catalogue: 'Product / Catalogue' };

export const AttentionView: React.FC = () => {
  const { attention, orgById, fps } = useConsole();
  const [group, setGroup] = useState('source');
  const [sev, setSev] = useState('all');
  const [domain, setDomain] = useState('all');
  const [cond, setCond] = useState<string>('all');
  const items = useMemo(() => attention.filter((i) => {
    const m = CONDITIONS[i.condition];
    return (sev === 'all' || m.severity === sev) && (domain === 'all' || m.domain === domain) && (cond === 'all' || i.condition === cond);
  }), [attention, sev, domain, cond]);
  const sevCounts = (['alert', 'action_required', 'informational', 'unassigned'] as const).map((s) => ({ s, n: attention.filter((i) => CONDITIONS[i.condition].severity === s).length }));
  const groups = useMemo(() => {
    const m = new Map<string, { title: string; sub?: React.ReactNode; items: typeof items }>();
    items.forEach((i) => {
      const k = group === 'source' ? i.condition : group === 'organisation' ? (i.orgId ?? 'platform') : CONDITIONS[i.condition].domain;
      const title = group === 'source' ? CONDITIONS[i.condition].label : group === 'organisation' ? (i.orgId ? orgById(i.orgId)?.name ?? '' : 'Platform') : DOMAIN_LABEL[CONDITIONS[i.condition].domain];
      const sub = group === 'source' ? <span>{CONDITIONS[i.condition].sourceFact}</span> : undefined;
      if (!m.has(k)) m.set(k, { title, sub, items: [] });
      m.get(k)!.items.push(i);
    });
    return [...m.values()];
  }, [items, group, orgById]);
  return (
    <>
      <PageHeader title="Needs Attention" scope={<ScopeChip kind="platform" />}
        subtitle="A work queue derived from current authoritative state. An item exists exactly while its source condition holds and disappears the moment the condition changes. There is no acknowledgement, incident record, priority score or SLA." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {sevCounts.map(({ s, n }) => (
          <button key={s} onClick={() => setSev(sev === s ? 'all' : s)} className={cx('text-left rounded-2xl border bg-white p-3.5 hover:border-cyan-500/60', sev === s ? 'border-cyan-500' : 'border-slate-200')}>
            <Chip tone={SEVERITY_META[s].tone}>{SEVERITY_META[s].label}</Chip>
            <div className={cx('text-2xl font-bold tabular-nums mt-1.5', n ? 'text-slate-900' : 'text-slate-300')}>{n}</div>
            <div className="text-[10px] text-slate-400">governed class</div>
          </button>
        ))}
      </div>
      <Notice tone="neutral">“No governed severity” is deliberate: where FOA-001 names no class for a condition (zero CU, analytical gap, lineage integrity), Fedoo shows the fact rather than inventing a priority.</Notice>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 my-4 flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <Segmented label="Group by" value={group} onChange={setGroup} options={[{ id: 'source', label: 'By source' }, { id: 'organisation', label: 'By Organisation' }, { id: 'domain', label: 'By domain' }]} />
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Select label="Source" value={cond} onChange={setCond} options={[{ id: 'all', label: 'All sources' }, ...(Object.keys(CONDITIONS) as AttentionCondition[]).map((c) => ({ id: c, label: CONDITIONS[c].label }))]} />
          <Select label="Domain" value={domain} onChange={setDomain} options={[{ id: 'all', label: 'All' }, ...Object.entries(DOMAIN_LABEL).map(([id, label]) => ({ id, label }))]} />
        </div>
      </div>

      <div className="text-[11px] text-slate-500 mb-2 px-1">{items.length} open of {attention.length} · coverage: {fps.length} of {fps.length} Feedback Points evaluated · window 168 h</div>
      {groups.length ? (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.title}>
              <div className="flex items-baseline gap-2 mb-2 px-1 flex-wrap"><h2 className="text-sm font-bold text-slate-900">{g.title}</h2><span className="text-[10px] font-bold text-slate-400 tabular-nums">{g.items.length}</span>{g.sub && <span className="text-[11px] text-slate-500">{g.sub}</span>}</div>
              <div className="space-y-3">{g.items.map((i) => <AttentionCard key={i.id} item={i} />)}</div>
            </section>
          ))}
        </div>
      ) : <EmptyState icon={<Check className="w-4 h-4" />} title="Nothing in the queue" body="No implemented source currently reports a condition. That is not a health claim: sources not implemented (below) cannot report at all." />}

      <Card className="mt-8" tone="muted">
        <CardHeader title="Implemented sources" icon={<BellRing className="w-4 h-4" />} hint="Seven conditions can create an item today." />
        <div className="flex flex-wrap gap-1.5">{(Object.keys(CONDITIONS) as AttentionCondition[]).map((c) => <Chip key={c} tone={SEVERITY_META[CONDITIONS[c].severity].tone}>{CONDITIONS[c].label}</Chip>)}</div>
        <Disclosure label="Sources deliberately not implemented" count={Object.keys(DEFERRED_ATTENTION_SOURCES).length}>
          <ul className="space-y-2">{Object.entries(DEFERRED_ATTENTION_SOURCES).map(([k, v]) => <li key={k}><div className="text-xs font-semibold text-slate-800">{k}</div><div className="text-[11px] text-slate-500">{v}</div></li>)}</ul>
        </Disclosure>
        <p className="text-[10px] text-slate-400 mt-3"><Eyebrow>Not Product Attention</Eyebrow>Customer Product Attention (WP-05) is separate domain state over Signal lineage. It is not an operational queue and is not read here.</p>
      </Card>
    </>
  );
};
