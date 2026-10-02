import React from 'react';
import { Ban, EyeOff, Lock, Pencil, Plug } from 'lucide-react';
import { CAPABILITIES, GOVERNED_RUNTIME_SETTINGS_COUNT, SETTINGS, SettingEntry } from '../model';
import { Card, CardHeader, Chip, cx, EmptyState, Field, Mono, Notice, PageHeader, ScopeChip } from '../ui';

const NATURE: Record<SettingEntry['nature'], { label: string; chip: React.ReactNode }> = {
  governed_editable: { label: 'Governed · editable', chip: <Chip tone="emerald" icon={<Pencil className="w-3 h-3" />}>Governed · editable</Chip> },
  read_only: { label: 'Read-only', chip: <Chip tone="slate" icon={<Lock className="w-3 h-3" />}>Read-only</Chip> },
  provider_dependent: { label: 'Provider-dependent', chip: <Chip tone="indigo" icon={<Plug className="w-3 h-3" />}>Provider-dependent</Chip> },
  unavailable: { label: 'Unavailable', chip: <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 text-slate-600 bg-slate-100 [background-image:repeating-linear-gradient(135deg,transparent_0_5px,rgba(148,163,184,.25)_5px_6px)]"><Ban className="w-3 h-3" />Unavailable</span> },
  withheld: { label: 'Withheld', chip: <Chip tone="slate" className="bg-slate-900 text-white border-slate-900" icon={<EyeOff className="w-3 h-3" />}>Withheld by policy</Chip> },
};

const Row: React.FC<{ s: SettingEntry }> = ({ s }) => (
  <li className="py-3.5 grid lg:grid-cols-[1.3fr_1.1fr_1.6fr] gap-x-5 gap-y-1.5">
    <div><div className="text-xs font-bold text-slate-900">{s.name}</div><div className="mt-1.5">{NATURE[s.nature].chip}</div></div>
    <div className="space-y-2"><Field label="Effective value">{s.effective}</Field><Field label="Owner">{s.owner}</Field></div>
    <div className="text-[11px] text-slate-600 leading-relaxed">{s.why}<div className="mt-1"><Mono>{s.key}</Mono></div></div>
  </li>
);

const Group: React.FC<{ title: string; hint: string; items: SettingEntry[] }> = ({ title, hint, items }) => (
  <Card><CardHeader title={title} hint={hint} /><ul className="divide-y divide-slate-100">{items.map((s) => <Row key={s.key} s={s} />)}</ul></Card>
);

export const SettingsView: React.FC = () => (
  <>
    <PageHeader title="Settings" scope={<ScopeChip kind="platform" />}
      subtitle="An honest inventory. A setting appears with a control only when an authoritative owner, governed values and an audited mutation command exist. Today none does." />
    <div className="flex flex-wrap gap-2 mb-5" aria-label="Legend">{(Object.keys(NATURE) as SettingEntry['nature'][]).map((k) => <span key={k}>{NATURE[k].chip}</span>)}</div>
    <div className="space-y-4">
      <Card tone="muted">
        <CardHeader title="Governed runtime settings" hint="Safe to read and change through an owning service." right={<Chip tone="slate">{GOVERNED_RUNTIME_SETTINGS_COUNT} exist</Chip>} />
        <EmptyState title="No operator-controlled setting has an owner yet" body="FOA-001 §17 states that operational settings have no owner or workflow. There is no settings table, no write permission and no generic key/value editor — so no control is shown." icon={<Lock className="w-4 h-4" />} />
      </Card>
      <Group title="Product policy" hint="Read-only here. Changed through the repository or the owning Product command." items={SETTINGS.filter((s) => s.cls === 'B')} />
      <Group title="Providers" hint="Bounded status only. The provider remains the owner; nothing is simulated." items={SETTINGS.filter((s) => s.cls === 'E')} />
      <Group title="Deployment-owned configuration and secrets" hint="Never returned and never editable through the console." items={SETTINGS.filter((s) => s.cls === 'C' || s.cls === 'D')} />
      <Group title="Derived facts" hint="Displayed, not editable." items={SETTINGS.filter((s) => s.cls === 'F')} />
      <Card>
        <CardHeader title="Capabilities that are not available" hint="Named so nobody assumes they exist." />
        <ul className="divide-y divide-slate-100">{CAPABILITIES.map((c) => (
          <li key={c.id} className="py-3 grid lg:grid-cols-[1.3fr_2.4fr] gap-x-5 gap-y-1">
            <div><div className="text-xs font-bold text-slate-900">{c.name}</div><div className="mt-1.5"><Chip tone={c.state === 'implemented' ? 'emerald' : c.state === 'blocked' ? 'rose' : 'slate'}>{c.state.replace('_', ' ')}</Chip></div></div>
            <div className="text-[11px] text-slate-600 leading-relaxed">{c.reason}{c.needs && <span className={cx('block mt-1 text-slate-500')}>Needs: {c.needs}</span>}<span className="block text-slate-400 mt-0.5">Owner: {c.owner}</span></div>
          </li>))}</ul>
      </Card>
      <Notice tone="neutral">Incident and escalation routing is unavailable. Needs Attention is derived from current state and offers no acknowledgement. Secrets, environment variables, connection strings and hostnames are never read by this console.</Notice>
    </div>
  </>
);
