import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, BellRing, Building2, ChevronDown, LifeBuoy, Menu, QrCode, Layers, Search, Settings2,
  ShieldCheck, Users, X, ArrowLeft, Timer,
} from 'lucide-react';
import { ConsoleProvider, useConsole } from './store';
import { absTime, relTime } from './derive';
import { clockNow, NOW, OPERATORS } from './model';
import { Chip, cx, Mono, ScopeChip } from './ui';
import { OrganisationsView, OrganisationDetailView } from './views/Organisations';
import { FeedbackOpsView, FeedbackPointDetailView } from './views/Feedback';
import { AccessView, AccessDetailView } from './views/Access';
import { HealthView } from './views/Health';
import { AttentionView } from './views/Attention';
import { CatalogueView } from './views/Catalogue';
import { SettingsView } from './views/Settings';
import { SupportEntryView, SupportWorkspaceView } from './views/Support';

interface NavItem { id: string; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: 'Operate', items: [
    { id: 'organisations', label: 'Organisations', icon: Building2, hint: 'Admission, lifecycle, commercial' },
    { id: 'feedback', label: 'Feedback Operations', icon: QrCode, hint: 'Where each chain stops' },
    { id: 'access', label: 'Users & Access', icon: Users, hint: 'Memberships and identity' },
  ] },
  { label: 'Observe', items: [
    { id: 'health', label: 'Platform Health', icon: Activity, hint: 'Observed facts, no scores' },
    { id: 'attention', label: 'Needs Attention', icon: BellRing, hint: 'Derived operator queue' },
  ] },
  { label: 'Product control plane', items: [
    { id: 'catalogue', label: 'Product / Catalogue', icon: Layers, hint: 'Canonical 88 and runtime constructs' },
  ] },
  { label: 'Platform', items: [
    { id: 'settings', label: 'Settings', icon: Settings2, hint: 'What is governed, and what is not' },
    { id: 'support', label: 'Support', icon: LifeBuoy, hint: 'Read-only, time-limited context' },
  ] },
];

const Sidebar: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { route, go, attention, orgs, activeSupport } = useConsole();
  const active = route.segments[0] ?? 'organisations';
  const badge: Record<string, { n: number; tone: string } | undefined> = {
    attention: attention.length ? { n: attention.length, tone: 'bg-amber-400 text-slate-900' } : undefined,
    organisations: orgs.filter((o) => o.admission === 'pending').length ? { n: orgs.filter((o) => o.admission === 'pending').length, tone: 'bg-slate-700 text-slate-100' } : undefined,
    support: activeSupport ? { n: 1, tone: 'bg-amber-400 text-slate-900' } : undefined,
  };
  return (
    <nav aria-label="Operator Console" className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight leading-tight">Fedoo Operations</div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-300/80">Operator Console</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-5">
        {NAV_GROUPS.map((g) => (
          <div key={g.label}>
            <div className="px-2.5 mb-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">{g.label}</div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.icon; const on = active === it.id; const b = badge[it.id];
                return (
                  <li key={it.id}>
                    <button onClick={() => { go(`/console/${it.id}`); onNavigate?.(); }} aria-current={on ? 'page' : undefined}
                      className={cx('w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors', on ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white')}>
                      <Icon className={cx('w-4 h-4 shrink-0', on ? 'text-cyan-300' : 'text-slate-500')} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-semibold leading-tight">{it.label}</span>
                        <span className={cx('block text-[10px] leading-tight mt-0.5 truncate', on ? 'text-slate-400' : 'text-slate-500')}>{it.hint}</span>
                      </span>
                      {b && <span className={cx('text-[10px] font-bold px-1.5 rounded-full', b.tone)}>{b.n}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-slate-800 text-[10px] text-slate-500 leading-snug">
        FOA-001 domains only. Nothing here changes Product Truth; every command re-authorises on the server.
      </div>
    </nav>
  );
};

const GlobalSearch: React.FC = () => {
  const { orgs, fps, go } = useConsole();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const t = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!t) return { o: [], f: [] };
    return {
      o: orgs.filter((o) => `${o.name} ${o.city} ${o.id}`.toLowerCase().includes(t)).slice(0, 5),
      f: fps.filter((f) => `${f.name} ${f.publicRef} ${f.id} ${orgs.find((o) => o.id === f.orgId)?.name}`.toLowerCase().includes(t)).slice(0, 5),
    };
  }, [t, orgs, fps]);
  const pick = (path: string) => { setOpen(false); setQ(''); go(path); };
  return (
    <div ref={ref} className="relative flex-1 max-w-md">
      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') { const first = results.o[0] ? `/console/organisations/${results.o[0].id}` : results.f[0] ? `/console/feedback/${results.f[0].id}` : null; if (first) pick(first); } }}
        placeholder="Find an Organisation or Feedback Point" aria-label="Find an Organisation or Feedback Point"
        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600/30" />
      {open && t && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
          {!results.o.length && !results.f.length && <div className="px-3 py-3 text-[11px] text-slate-500">No Organisation or Feedback Point matches “{q}”.</div>}
          {results.o.length > 0 && <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">Organisations</div>}
          {results.o.map((o) => (
            <button key={o.id} onClick={() => pick(`/console/organisations/${o.id}`)} className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs font-semibold text-slate-800">{o.name}</span><span className="text-[10px] text-slate-400">{o.city}</span>
            </button>
          ))}
          {results.f.length > 0 && <div className="px-2 pt-2 pb-0.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">Feedback Points</div>}
          {results.f.map((f) => (
            <button key={f.id} onClick={() => pick(`/console/feedback/${f.id}`)} className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2">
              <QrCode className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs font-semibold text-slate-800">{f.name}</span><span className="text-[10px] text-slate-400 truncate">{orgs.find((o) => o.id === f.orgId)?.name}</span>
            </button>
          ))}
          <div className="px-2.5 pt-2 mt-1 border-t border-slate-100 text-[10px] text-slate-400">Searches the Organisation and Feedback Operations directories you are permitted to read.</div>
        </div>
      )}
    </div>
  );
};

const OperatorMenu: React.FC = () => {
  const { operator, setOperatorId } = useConsole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const initials = operator.name.split(' ').map((p) => p[0]).join('');
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200">
        <span className="w-7 h-7 rounded-lg bg-slate-900 text-cyan-300 text-[11px] font-bold flex items-center justify-center">{initials}</span>
        <span className="text-left hidden sm:block">
          <span className="block text-xs font-bold text-slate-900 leading-tight">{operator.name}</span>
          <span className="block text-[10px] text-slate-500 leading-tight">Platform operator</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
          <div className="text-xs font-bold text-slate-900">{operator.name}</div>
          <div className="text-[11px] text-slate-500">{operator.role}</div>
          <p className="text-[11px] text-slate-500 mt-2 leading-snug">Operator identity is separate from any Organisation membership. Authority is granted per permission, purpose and target.</p>
          <div className="mt-3 rounded-xl bg-cyan-50/70 border border-cyan-200 p-2.5">
            <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-800 mb-1.5">Prototype review tool · review as</div>
            <div className="flex gap-1.5">
              {OPERATORS.map((o) => (
                <button key={o.id} onClick={() => setOperatorId(o.id)} className={cx('flex-1 text-[11px] font-semibold px-2 py-1.5 rounded-lg border', o.id === operator.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50')}>
                  {o.id === 'full' ? 'Full operator' : 'Read-only set'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-cyan-900/80 mt-1.5">Shows how controls and sections change when an exact permission is not held.</p>
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-wider font-bold text-slate-400">Held permissions ({operator.held.size})</div>
          <div className="mt-1.5 max-h-36 overflow-y-auto flex flex-wrap gap-1">{[...operator.held].map((p) => <Mono key={p}>{p.replace('platform.', '')}</Mono>)}</div>
        </div>
      )}
    </div>
  );
};

const SupportPill: React.FC = () => {
  const { activeSupport, orgById, go } = useConsole();
  if (!activeSupport) return null;
  const left = Math.max(0, Math.round((activeSupport.expiresAt - clockNow()) / 60000));
  return (
    <button onClick={() => go(`/console/support/${activeSupport.orgId}/${activeSupport.id}`)} className="hidden md:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100">
      <Timer className="w-3.5 h-3.5" /> Support context · {orgById(activeSupport.orgId)?.name} · {left} min left
    </button>
  );
};

const Routes: React.FC = () => {
  const { route } = useConsole();
  const [section, a, b] = route.segments;
  switch (section) {
    case undefined: case 'organisations': return a ? <OrganisationDetailView id={a} /> : <OrganisationsView />;
    case 'feedback': return a ? <FeedbackPointDetailView id={a} /> : <FeedbackOpsView />;
    case 'access': return a ? <AccessDetailView id={a} /> : <AccessView />;
    case 'health': return <HealthView />;
    case 'attention': return <AttentionView />;
    case 'catalogue': return <CatalogueView />;
    case 'settings': return <SettingsView />;
    case 'support': return a && b ? <SupportWorkspaceView orgId={a} contextId={b} /> : <SupportEntryView />;
    default: return <OrganisationsView />;
  }
};

const Shell: React.FC<{ onReturnToApp?: () => void }> = ({ onReturnToApp }) => {
  const { route, go } = useConsole();
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { setDrawer(false); }, [route.path]);
  const platformWide = !['support'].includes(route.segments[0] ?? '') && !(route.segments[0] === 'organisations' && route.segments[1]);
  return (
    <div className="min-h-[calc(100vh-2.25rem)] bg-slate-50 text-slate-900 flex" data-testid="operator-console">
      <aside className="hidden lg:block w-64 shrink-0 bg-slate-900 sticky top-9 self-start h-[calc(100vh-2.25rem)]"><Sidebar /></aside>
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDrawer(false)} />
          <div className="relative w-72 max-w-[85vw] bg-slate-900 h-full shadow-2xl">
            <button aria-label="Close navigation" onClick={() => setDrawer(false)} className="absolute right-2 top-3 p-1.5 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-9 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="px-3 sm:px-6 h-14 flex items-center gap-2 sm:gap-3">
            <button aria-label="Open navigation" onClick={() => setDrawer(true)} className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 text-slate-600"><Menu className="w-4 h-4" /></button>
            <GlobalSearch />
            <div className="flex-1" />
            <SupportPill />
            {onReturnToApp && (
              <button onClick={onReturnToApp} className="hidden xl:flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="w-3.5 h-3.5" />Organisation app</button>
            )}
            <OperatorMenu />
          </div>
          <div className="px-3 sm:px-6 py-1.5 border-t border-slate-100 bg-slate-50/80 flex items-center gap-2 flex-wrap text-[10px] text-slate-500">
            {platformWide ? <ScopeChip kind="platform" /> : null}
            <span>Observed <span className="font-semibold text-slate-700">{absTime(NOW.toISOString())}</span> · live read · <Chip tone="slate">Prototype · synthetic data</Chip></span>
          </div>
        </header>
        <main className="flex-1 px-3 sm:px-6 py-5 sm:py-6 max-w-[1280px] w-full mx-auto" id="console-main">
          <Routes />
          <p className="text-[10px] text-slate-400 text-center mt-10">
            Operator Console Experience Reference — states, names and counts are synthetic and shaped on FOA-001 read models. The prototype is Experience authority, not Product Truth authority.
          </p>
        </main>
      </div>
    </div>
  );
};

export const OperatorConsole: React.FC<{ onReturnToApp?: () => void }> = ({ onReturnToApp }) => (
  <ConsoleProvider><Shell onReturnToApp={onReturnToApp} /></ConsoleProvider>
);
export { relTime };
