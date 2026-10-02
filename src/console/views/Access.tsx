import React, { useMemo, useState } from 'react';
import { Eye, Info, Users } from 'lucide-react';
import { useConsole } from '../store';
import { absTime, humanize, relTime } from '../derive';
import { DEFERRED_ACCESS_COMMANDS, Membership } from '../model';
import {
  Btn, Card, CardHeader, Chip, cx, Disclosure, EmptyState, Eyebrow, Field, GatedAction, HealthChip, Mono, Notice, PageHeader, ScopeChip, SearchBox, Select,
} from '../ui';
import { OrgLink } from './shared';

const MemberChip: React.FC<{ s: Membership['status'] }> = ({ s }) =>
  <Chip tone={s === 'active' ? 'emerald' : s === 'suspended' ? 'amber' : 'slate'}>Membership {s}</Chip>;
const BindingChip: React.FC<{ m: Membership }> = ({ m }) =>
  m.bindings.length ? <Chip tone="emerald">{m.bindings.length} identity binding</Chip> : <Chip tone="slate" className="border-dashed">No binding recorded</Chip>;
const AccessChip: React.FC<{ m: Membership }> = ({ m }) =>
  m.effective.state === 'active' ? <Chip tone="emerald">Access active</Chip> : <Chip tone="amber" title={m.effective.reason ?? ''}>Access inactive</Chip>;

const Unavailable: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card tone="muted">
    <CardHeader title={title} icon={<Info className="w-4 h-4" />} />
    <div className="text-[11px] text-slate-600 leading-relaxed">{children}</div>
  </Card>
);

export const AccessView: React.FC = () => {
  const { memberships, orgs, go } = useConsole();
  const [q, setQ] = useState('');
  const [state, setState] = useState('all');
  const [org, setOrg] = useState('all');
  const t = q.trim().toLowerCase();
  const rows = useMemo(() => memberships.filter((m) =>
    (!t || `${m.userName} ${orgs.find((o) => o.id === m.orgId)?.name}`.toLowerCase().includes(t)) &&
    (state === 'all' || m.status === state) && (org === 'all' || m.orgId === org)), [memberships, orgs, t, state, org]);
  return (
    <>
      <PageHeader title="Users & Access" scope={<ScopeChip kind="platform" />}
        subtitle="One row per membership. Provider authentication, Organisation user, identity binding, membership and resolved access are kept as separate facts. Everything here is read-only." />
      <div className="rounded-2xl border border-slate-200 bg-white p-3 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search user or Organisation" className="lg:flex-1" />
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Select label="Membership" value={state} onChange={setState} options={[{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'suspended', label: 'Suspended' }, { id: 'revoked', label: 'Revoked' }]} />
          <Select label="Organisation" value={org} onChange={setOrg} options={[{ id: 'all', label: 'All' }, ...orgs.map((o) => ({ id: o.id, label: o.name }))]} />
        </div>
      </div>
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <div className="text-[11px] text-slate-500 mb-2 px-1">{rows.length} of {memberships.length} memberships</div>
          {rows.length ? (
            <ul className="space-y-3">{rows.map((m) => (
              <li key={m.id} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-cyan-500/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button onClick={() => go(`/console/access/${m.id}`)} className="text-left"><div className="text-sm font-bold text-slate-900 hover:text-cyan-800 hover:underline underline-offset-2">{m.userName}</div></button>
                    <div className="text-[11px] text-slate-500 mt-0.5"><OrgLink id={m.orgId} className="text-[11px]" /></div>
                  </div>
                  <div className="flex flex-wrap gap-1.5"><MemberChip s={m.status} /><BindingChip m={m} /><AccessChip m={m} /></div>
                </div>
                {m.effective.reason && <p className="text-[11px] text-slate-500 mt-2">Resolver: <span className="text-slate-700">{humanize(m.effective.reason)}</span></p>}
                <Disclosure label="Technical assignment (WP-01 foundation)">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <Field label="Role tokens">{m.roles.map((r) => <Mono key={r}>{r}</Mono>)}</Field>
                    <Field label="Scope">{m.scopeLevels.join(', ')} · {m.scopeNames.join(', ')}</Field>
                    <Field label="Evidence class">{m.evidenceClasses.map((r) => <Mono key={r}>{r}</Mono>)}</Field>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Technical tokens only. They are not Product roles and imply no permissions.</p>
                </Disclosure>
              </li>))}</ul>
          ) : <EmptyState icon={<Users className="w-4 h-4" />} title="No membership matches" />}
        </div>
        <div className="space-y-4">
          <Unavailable title="Provider limitation">Fedoo’s authentication adapter exposes only an identity kind and provider subject. <strong>Account state, MFA, email verification, last sign-in and recovery are unavailable</strong> — shown as unavailable, never as failed or healthy.</Unavailable>
          <Card><CardHeader title="Interventions not offered" hint="No governed semantics exist yet, so no control is shown." />
            <ul className="space-y-2.5">{Object.entries(DEFERRED_ACCESS_COMMANDS).map(([k, v]) => <li key={k}><div className="text-xs font-semibold text-slate-800">{k}</div><div className="text-[10px] text-slate-500 leading-snug">{v}</div></li>)}</ul></Card>
        </div>
      </div>
    </>
  );
};

export const AccessDetailView: React.FC<{ id: string }> = ({ id }) => {
  const { memberships, orgById, go, can } = useConsole();
  const m = memberships.find((x) => x.id === id);
  const [reveal, setReveal] = useState(false);
  if (!m) return <EmptyState title="Membership not found" />;
  const o = orgById(m.orgId)!;
  return (
    <>
      <PageHeader back={{ label: 'Users & Access', onClick: () => go('/console/access') }} title={m.userName} scope={<ScopeChip kind="organisation" name={o.name} />}
        subtitle={<span><OrgLink id={o.id} className="text-xs" /> · member since {relTime(m.createdAt)}</span>} />
      <div className="flex flex-wrap gap-1.5 mb-4"><MemberChip s={m.status} /><BindingChip m={m} /><AccessChip m={m} /></div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Effective access" hint="What Fedoo’s existing resolver concludes for customer authority only. Organisation lifecycle and Platform Authority are separate." />
            <div className="flex items-center gap-2 flex-wrap">{m.effective.state === 'active' ? <Chip tone="emerald">Resolves to active authority</Chip> : <Chip tone="amber">Does not resolve</Chip>}{m.effective.reason && <Mono>{m.effective.reason}</Mono>}</div>
            <Disclosure label="Resolver"><div className="text-[11px] text-slate-500">organisation_journey.load_admin_authority → build_admin_context_from_records. The resolver takes the earliest stored role, scope and Evidence Class row.</div></Disclosure>
          </Card>
          <Card>
            <CardHeader title="Identity binding" hint="A binding proves identity only. It confers no membership, role, scope, Evidence Class or authority." />
            {m.bindings.length ? <ul className="divide-y divide-slate-100">{m.bindings.map((b) => (
              <li key={b.id} className="py-2.5 flex items-center justify-between gap-3 flex-wrap">
                <div><div className="text-xs font-semibold text-slate-800">{b.kind}</div><div className="text-[10px] text-slate-400">Bound {relTime(b.createdAt)}</div></div>
                <div className="flex items-center gap-2">
                  {reveal ? <Mono>{b.subject}</Mono> : <span className="text-[11px] text-slate-400">Provider subject withheld</span>}
                </div></li>))}</ul>
              : <p className="text-xs text-slate-600">No binding recorded. The user cannot currently sign in through Fedoo’s adapter.</p>}
            {m.bindings.length > 0 && !reveal && (
              <div className="mt-3"><GatedAction held={can('platform.access.identity.read')} permission="platform.access.identity.read"><Btn onClick={() => setReveal(true)}><Eye className="w-3.5 h-3.5" />Reveal provider subject (audited)</Btn></GatedAction></div>)}
            {reveal && <p className="text-[10px] text-slate-400 mt-2">Disclosure recorded in the audit trail with the membership id.</p>}
          </Card>
          <Card>
            <CardHeader title="Technical assignment" hint="WP-01 foundation fixtures pending role specialisation. No permissions are inferred from a name." />
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Role tokens">{m.roles.map((r) => <Mono key={r}>{r}</Mono>)}</Field>
              <Field label="Scope">{m.scopeLevels.join(', ')}<span className="block text-slate-500">{m.scopeNames.join(', ')}</span><span className="block text-[10px] text-emerald-700 mt-0.5">Tenant coherent</span></Field>
              <Field label="Evidence class">{m.evidenceClasses.map((r) => <Mono key={r}>{r}</Mono>)}<span className="block text-[10px] text-slate-400 mt-0.5">Exact labels only; no ordering implied.</span></Field>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Membership" />
            <div className="space-y-2.5"><Field label="State"><MemberChip s={m.status} /></Field><Field label="Created">{absTime(m.createdAt)}</Field>
              <Field label={m.status === 'suspended' ? 'Suspended at' : 'Revoked at'}>{m.revokedAt ? absTime(m.revokedAt) : m.status === 'suspended' ? <HealthChip state="unavailable" label="Not recorded by schema" /> : '—'}</Field></div>
          </Card>
          <Card>
            <CardHeader title="Provider account state" hint="Unavailable through the current adapter." />
            <ul className="space-y-1.5">{['Account state', 'MFA', 'Email verified', 'Last sign-in', 'Recovery action'].map((x) => <li key={x} className="flex items-center justify-between text-[11px] text-slate-600">{x}<HealthChip state="unavailable" /></li>)}</ul>
          </Card>
          <Notice tone="neutral" title="No interventions offered">Suspension, restoration, role or scope change, invitation, recovery and ownership transfer have no governed semantics yet.</Notice>
        </div>
      </div>
    </>
  );
};
void cx; void Eyebrow;
