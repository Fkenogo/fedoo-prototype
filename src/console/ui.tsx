import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Ban, Check, CheckCircle2, ChevronDown, ChevronRight, Copy, EyeOff, HelpCircle, Lock,
  Minus, Search, ShieldCheck, X, XCircle,
} from 'lucide-react';
import { BoundaryState, HealthState } from './model';
import { BOUNDARY_LABEL } from './derive';

// ---------------------------------------------------------------------------
// Shared presentation primitives for the Operator Console Experience Reference.
// Reuses the Fedoo prototype language: Plus Jakarta Sans, slate neutrals, rounded-2xl
// white cards, 10–11px label scale, emerald = healthy/observed, rose = failed,
// amber = needs a decision, cyan/slate-900 = operator chrome.
// ---------------------------------------------------------------------------

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const Card: React.FC<{ className?: string; children: React.ReactNode; tone?: 'default' | 'muted' | 'warn' | 'danger' }> = ({ className, children, tone = 'default' }) => (
  <section className={cx('rounded-2xl border p-4 sm:p-5',
    tone === 'default' && 'bg-white border-slate-200', tone === 'muted' && 'bg-slate-50 border-slate-200',
    tone === 'warn' && 'bg-amber-50/60 border-amber-200', tone === 'danger' && 'bg-rose-50/60 border-rose-200', className)}>
    {children}
  </section>
);

export const CardHeader: React.FC<{ title: string; hint?: React.ReactNode; right?: React.ReactNode; icon?: React.ReactNode }> = ({ title, hint, right, icon }) => (
  <div className="flex items-start justify-between gap-3 mb-3">
    <div className="flex items-start gap-2.5 min-w-0">
      {icon && <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-300 flex items-center justify-center shrink-0">{icon}</div>}
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {hint && <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{hint}</p>}
      </div>
    </div>
    {right && <div className="shrink-0">{right}</div>}
  </div>
);

export const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{children}</div>
);

// ---------------------------------------------------------------------------
// Chips
// ---------------------------------------------------------------------------
type Tone = 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' | 'cyan' | 'indigo' | 'violet';
const TONES: Record<Tone, string> = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  sky: 'bg-sky-50 text-sky-800 border-sky-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  violet: 'bg-violet-50 text-violet-800 border-violet-200',
};
export const Chip: React.FC<{ tone?: Tone; children: React.ReactNode; icon?: React.ReactNode; className?: string; title?: string }> = ({ tone = 'slate', children, icon, className, title }) => (
  <span title={title} className={cx('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap', TONES[tone], className)}>
    {icon}{children}
  </span>
);

export const AdmissionChip: React.FC<{ v: string }> = ({ v }) =>
  v === 'pending' ? <Chip tone="amber">Pending admission</Chip> : <Chip tone="emerald" icon={<Check className="w-3 h-3" />}>Admitted</Chip>;
export const LifecycleChip: React.FC<{ v: string }> = ({ v }) =>
  v === 'operational' ? <Chip tone="emerald">Operational</Chip> : v === 'suspended' ? <Chip tone="amber">Suspended</Chip> : <Chip tone="slate">Closed</Chip>;
export const TierChip: React.FC<{ v: string }> = ({ v }) => <Chip tone={v === 'premium' ? 'violet' : 'slate'}>{v === 'premium' ? 'Premium' : 'Basic'}</Chip>;
export const SetupChip: React.FC<{ v: string }> = ({ v }) =>
  v === 'complete' ? <Chip tone="emerald">Setup complete</Chip> : <Chip tone="amber">Setup incomplete</Chip>;
export const CuChip: React.FC<{ balance: number }> = ({ balance }) =>
  balance <= 0 ? <Chip tone="rose" title="New accepted feedback is blocked. Admission, lifecycle, history and configuration are unchanged.">0 CU</Chip> : <Chip tone="slate" className="tabular-nums">{balance} CU</Chip>;

// Commercial continuity vocabulary. Never a lifecycle state: "Trial" must not appear anywhere.
export const ComplimentaryChip: React.FC = () => (
  <Chip tone="sky" title="One-time complimentary allowance granted at establishment. Not recurring, not a lifecycle state, not time-limited.">Complimentary</Chip>
);
export const PaidPackChip: React.FC = () => (
  <Chip tone="indigo" title="Balance includes an operator-granted CU pack after commercial approval outside Fedoo.">Paid / manual CU</Chip>
);
export const LowCuChip: React.FC<{ balance: number }> = ({ balance }) => (
  <Chip tone="amber" title={`Balance is ${balance} CU. No governed low-balance threshold exists; this is an operator watch flag only.`}>Low · {balance} CU left</Chip>
);
export const AcceptanceBlockedChip: React.FC = () => (
  <Chip tone="rose" title="New accepted feedback is blocked. History and configuration remain preserved.">Acceptance blocked</Chip>
);

// Health / boundary states. Never colour-only: every state has its own icon + label,
// and not_observed / unavailable / unknown are visually distinct from healthy.
const HEALTH_STYLE: Record<HealthState, { cls: string; icon: React.ReactNode; label: string }> = {
  healthy_observed: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Healthy · observed' },
  degraded_observed: { cls: 'bg-amber-50 text-amber-800 border-amber-300', icon: <AlertTriangle className="w-3 h-3" />, label: 'Degraded · observed' },
  failed_observed: { cls: 'bg-rose-50 text-rose-700 border-rose-300', icon: <XCircle className="w-3 h-3" />, label: 'Failed · observed' },
  unavailable: { cls: 'bg-slate-100 text-slate-600 border-slate-300 [background-image:repeating-linear-gradient(135deg,transparent_0_5px,rgba(148,163,184,.25)_5px_6px)]', icon: <Ban className="w-3 h-3" />, label: 'Unavailable' },
  not_observed: { cls: 'bg-white text-slate-500 border-dashed border-slate-400', icon: <EyeOff className="w-3 h-3" />, label: 'Not observed' },
  unknown: { cls: 'bg-white text-violet-700 border-dotted border-violet-400', icon: <HelpCircle className="w-3 h-3" />, label: 'Unknown' },
  not_applicable: { cls: 'bg-transparent text-slate-400 border-transparent', icon: <Minus className="w-3 h-3" />, label: 'Not applicable' },
};
export const HealthChip: React.FC<{ state: HealthState; label?: string }> = ({ state, label }) => {
  const s = HEALTH_STYLE[state];
  return <span className={cx('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap', s.cls)}>{s.icon}{label ?? s.label}</span>;
};
export const BOUNDARY_TO_HEALTH: Record<BoundaryState, HealthState> = {
  passed: 'healthy_observed', failed: 'failed_observed', not_observed: 'not_observed', unknown: 'unknown', not_applicable: 'not_applicable',
};
const BOUNDARY_LABELS: Record<BoundaryState, string> = { passed: 'Passed', failed: 'Failed', not_observed: 'Not observed', unknown: 'Unknown', not_applicable: 'Not applicable' };
export const BoundaryChip: React.FC<{ state: BoundaryState }> = ({ state }) => <HealthChip state={BOUNDARY_TO_HEALTH[state]} label={BOUNDARY_LABELS[state]} />;

export const SEVERITY_META: Record<string, { label: string; tone: Tone }> = {
  alert: { label: 'Alert', tone: 'rose' },
  action_required: { label: 'Action required', tone: 'amber' },
  informational: { label: 'Informational', tone: 'sky' },
  unassigned: { label: 'No governed severity', tone: 'slate' },
};

// Where does this surface read from? Platform-wide vs Organisation-target is a permission fact.
export const ScopeChip: React.FC<{ kind: 'platform' | 'organisation' | 'support'; name?: string }> = ({ kind, name }) =>
  kind === 'platform' ? <Chip tone="cyan" title="Read under a platform-target grant: aggregates and summaries">Platform-wide</Chip>
  : kind === 'organisation' ? <Chip tone="indigo" title="Read under an exact Organisation-target grant">Organisation target{name ? ` · ${name}` : ''}</Chip>
  : <Chip tone="amber" title="Read-only support context">Support context{name ? ` · ${name}` : ''}</Chip>;

// ---------------------------------------------------------------------------
// Fields, disclosure, empty states
// ---------------------------------------------------------------------------
export const Field: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="min-w-0">
    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</div>
    <div className={cx('text-xs text-slate-800 mt-0.5 break-words', mono && 'font-mono text-[11px]')}>{children}</div>
  </div>
);

export const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="font-mono text-[10.5px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 break-all">{children}</code>
);

export const Disclosure: React.FC<{ label: string; children: React.ReactNode; defaultOpen?: boolean; count?: number }> = ({ label, children, defaultOpen = false, count }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-100 pt-2 mt-3">
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800">
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {label}{count !== undefined && <span className="text-slate-400 font-normal">({count})</span>}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
};

export const EmptyState: React.FC<{ title: string; body?: string; icon?: React.ReactNode }> = ({ title, body, icon }) => (
  <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-300 bg-white">
    <div className="mx-auto w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">{icon ?? <Search className="w-4 h-4" />}</div>
    <div className="text-sm font-bold text-slate-700">{title}</div>
    {body && <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">{body}</p>}
  </div>
);

export const Notice: React.FC<{ tone?: 'info' | 'warn' | 'neutral'; title?: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ tone = 'neutral', title, children, icon }) => (
  <div className={cx('rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed flex gap-2',
    tone === 'info' && 'bg-cyan-50/70 border-cyan-200 text-cyan-900', tone === 'warn' && 'bg-amber-50 border-amber-200 text-amber-900',
    tone === 'neutral' && 'bg-slate-50 border-slate-200 text-slate-600')}>
    {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
    <div>{title && <div className="font-bold mb-0.5">{title}</div>}{children}</div>
  </div>
);

export const PageHeader: React.FC<{ title: string; subtitle?: React.ReactNode; scope?: React.ReactNode; actions?: React.ReactNode; back?: { label: string; onClick: () => void } }> = ({ title, subtitle, scope, actions, back }) => (
  <div className="mb-5">
    {back && <button onClick={back.onClick} className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 mb-2 flex items-center gap-1">← {back.label}</button>}
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {scope}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </div>
  </div>
);

export const Tabs: React.FC<{ tabs: { id: string; label: string; badge?: number }[]; active: string; onChange: (id: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="overflow-x-auto no-scrollbar -mx-1 px-1 mb-5">
    <div className="flex gap-1 min-w-max border-b border-slate-200" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => onChange(t.id)}
          className={cx('px-3 py-2 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5',
            active === t.id ? 'border-cyan-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800')}>
          {t.label}
          {t.badge ? <span className="px-1.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  </div>
);

export const Segmented: React.FC<{ options: { id: string; label: string }[]; value: string; onChange: (id: string) => void; label?: string }> = ({ options, value, onChange, label }) => (
  <div role="group" aria-label={label} className="inline-flex bg-slate-100 rounded-xl p-0.5 max-w-full overflow-x-auto no-scrollbar">
    {options.map((o) => (
      <button key={o.id} onClick={() => onChange(o.id)} aria-pressed={value === o.id}
        className={cx('px-3 py-1.5 rounded-[10px] text-[11px] font-semibold whitespace-nowrap', value === o.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800')}>
        {o.label}
      </button>
    ))}
  </div>
);

export const SearchBox: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string; className?: string }> = ({ value, onChange, placeholder, className }) => (
  <div className={cx('relative', className)}>
    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600/30" />
  </div>
);

export const Select: React.FC<{ value: string; onChange: (v: string) => void; options: { id: string; label: string }[]; label: string }> = ({ value, onChange, options, label }) => (
  <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
    <span className="font-semibold">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-cyan-600/30">
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </label>
);

// ---------------------------------------------------------------------------
// Buttons and permission-bound actions
// ---------------------------------------------------------------------------
export const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ variant = 'secondary', className, ...p }) => (
  <button {...p} className={cx('px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5',
    variant === 'primary' && 'bg-slate-900 text-white hover:bg-slate-800', variant === 'secondary' && 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50',
    variant === 'danger' && 'bg-rose-700 text-white hover:bg-rose-800', variant === 'ghost' && 'text-slate-600 hover:bg-slate-100', className)} />
);

// A command control. When the operator does not hold the exact permission the control is replaced by
// an honest locked state naming that permission; the server decides again on every command.
export const GatedAction: React.FC<{ held: boolean; permission: string; children: React.ReactNode }> = ({ held, permission, children }) =>
  held ? <>{children}</> : (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl px-3 py-2" title={`Requires ${permission}`}>
      <Lock className="w-3 h-3" /> Requires <code className="font-mono text-[10px]">{permission}</code>
    </span>
  );

export const NotAuthorised: React.FC<{ permissions: string[]; what: string }> = ({ permissions, what }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center">
    <Lock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
    <div className="text-xs font-bold text-slate-700">{what} · not authorised</div>
    <p className="text-[11px] text-slate-500 mt-1">This domain needs its own independent permission. Nothing is inferred or hidden by another grant.</p>
    <div className="mt-2 flex flex-wrap gap-1 justify-center">{permissions.map((p) => <Mono key={p}>{p}</Mono>)}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Deliberate command dialog: reason + exact typed confirmation, exactly as the owning command requires.
// ---------------------------------------------------------------------------
export interface CommandSpec {
  title: string; verb: string; tone?: 'default' | 'danger';
  summary: React.ReactNode; consequences?: string[];
  expected: string; phrase: string; permission: string;
  onConfirm: (reason: string) => void;
}
export const CommandDialog: React.FC<{ spec: CommandSpec; onClose: () => void }> = ({ spec, onClose }) => {
  const [reason, setReason] = useState('');
  const [typed, setTyped] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const ready = reason.trim().length > 0 && reason.length <= 500 && typed === spec.phrase;
  const danger = spec.tone === 'danger';
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={spec.title}>
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Chip tone={danger ? 'rose' : 'cyan'}>{danger ? 'Irreversible command' : 'Operator command'}</Chip>
              <h2 className="text-base font-bold text-slate-900 mt-2">{spec.title}</h2>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="text-xs text-slate-600 mt-2 leading-relaxed">{spec.summary}</div>
          {spec.consequences && (
            <ul className="mt-3 space-y-1">
              {spec.consequences.map((c) => <li key={c} className="text-[11px] text-slate-600 flex gap-1.5"><span className="text-slate-300">•</span>{c}</li>)}
            </ul>
          )}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
            <Field label="Expected current state">{spec.expected}</Field>
            <Field label="Permission checked by the server"><span className="font-mono text-[10.5px]">{spec.permission}</span></Field>
          </div>
          <label className="block mt-4 text-[11px] font-semibold text-slate-600">Reason <span className="text-slate-400 font-normal">(required, recorded in the audit event)</span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={2}
              className="mt-1 w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-cyan-600/30" />
          </label>
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-600">Type the confirmation phrase exactly</span>
              <button onClick={() => { navigator.clipboard?.writeText(spec.phrase).catch(() => undefined); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="text-[10px] font-bold text-cyan-700 flex items-center gap-1"><Copy className="w-3 h-3" />{copied ? 'Copied' : 'Copy phrase'}</button>
            </div>
            <code className="block mt-1 font-mono text-[10.5px] bg-slate-100 text-slate-700 rounded-lg px-2.5 py-2 break-all select-all">{spec.phrase}</code>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} aria-label="Confirmation phrase"
              className={cx('mt-2 w-full font-mono text-[11px] rounded-xl border px-3 py-2 focus:outline-hidden focus:ring-2',
                typed && typed !== spec.phrase ? 'border-rose-300 focus:ring-rose-400/30' : 'border-slate-200 focus:ring-cyan-600/30')} />
          </div>
          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant={danger ? 'danger' : 'primary'} disabled={!ready} onClick={() => { spec.onConfirm(reason.trim()); onClose(); }}>
              <ShieldCheck className="w-3.5 h-3.5" />{spec.verb}
            </Btn>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Prototype: this changes only the local review state. In production the command is idempotent, re-authorised and audited in one transaction.</p>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Chain stepper: "where the chain stops" made visible
// ---------------------------------------------------------------------------
export const ChainStepper: React.FC<{ states: Record<string, BoundaryState>; order: readonly string[]; stoppedAt: string | null; compact?: boolean; evaluatedThrough?: string }> = ({ states, order, stoppedAt, compact, evaluatedThrough }) => {
  const evalIdx = evaluatedThrough ? order.indexOf(evaluatedThrough) : order.length - 1;
  return (
    <ol className="flex items-stretch gap-0.5 w-full" aria-label="Transaction chain">
      {order.map((b, i) => {
        const beyond = i > evalIdx;
        const st = beyond ? 'unknown' : states[b] ?? 'unknown';
        const stop = b === stoppedAt;
        const cls = beyond ? 'bg-white border-dotted border-slate-300 text-slate-300'
          : st === 'passed' ? 'bg-emerald-600 border-emerald-700 text-white'
          : st === 'failed' ? 'bg-rose-600 border-rose-700 text-white'
          : st === 'not_observed' ? 'bg-white border-dashed border-slate-400 text-slate-500'
          : st === 'not_applicable' ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-dotted border-violet-400 text-violet-600';
        return (
          <li key={b} className="flex-1 min-w-0" title={`${BOUNDARY_LABEL[b as keyof typeof BOUNDARY_LABEL]}: ${beyond ? 'evaluated in the Feedback Point detail' : st.replace('_', ' ')}`}>
            <div className={cx('h-6 border flex items-center justify-center text-[9px] font-bold', cls, i === 0 && 'rounded-l-lg', i === order.length - 1 && 'rounded-r-lg', stop && 'ring-2 ring-offset-1 ring-amber-500 z-10 relative')}>
              {st === 'passed' && !beyond ? <Check className="w-3 h-3" /> : st === 'failed' && !beyond ? <X className="w-3 h-3" /> : st === 'not_observed' && !beyond ? <EyeOff className="w-3 h-3" /> : beyond ? '·' : '?'}
            </div>
            {!compact && <div className={cx('text-[9px] mt-1 text-center truncate', stop ? 'font-bold text-amber-700' : 'text-slate-400')}>{BOUNDARY_LABEL[b as keyof typeof BOUNDARY_LABEL]}</div>}
          </li>
        );
      })}
    </ol>
  );
};
