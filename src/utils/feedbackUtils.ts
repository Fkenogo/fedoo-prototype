import { ServiceSignal, Measure } from '../types';
import { SCALE_DEFINITIONS } from '../data/mockData';

export interface DistributionSummary {
  favourable: number;
  middle: number;
  unfavourable: number;
  total: number;
  favourablePct: number;
  middlePct: number;
  unfavourablePct: number;
}

// [PROTOTYPE ASSUMPTION — Product Truth realignment]: summarises a signal's
// distribution into favourable / middle / unfavourable using the governed
// higher-favourable 5-point interpretation (5–4 favourable, 3 middle,
// 2–1 unfavourable). Presentation only; production computes Measure Results
// and Service Signals authoritatively.
export function summarizeDistribution(
  measure: Measure,
  signal?: ServiceSignal
): DistributionSummary {
  const scale = SCALE_DEFINITIONS[measure.scaleFamily] || SCALE_DEFINITIONS.quality;
  const scoreFor = (label: string): number => {
    const exact = scale.find((o) => o.value.toLowerCase() === label.toLowerCase());
    if (exact) return exact.scoreIndex;
    const l = label.toLowerCase();
    if (l.startsWith('neither') || l === 'fair' || l === 'middle') return 3;
    if (/(excellent|very satisfied|very likely)/.test(l)) return 5;
    if (/(good|satisfied|likely)/.test(l)) return 4;
    if (/(poor|dissatisfied|unlikely)/.test(l)) return 2;
    return 3;
  };

  let favourable = 0;
  let middle = 0;
  let unfavourable = 0;
  (signal?.distribution || []).forEach((d) => {
    const s = scoreFor(d.label);
    if (s >= 4) favourable += d.count;
    else if (s === 3) middle += d.count;
    else unfavourable += d.count;
  });
  const total = favourable + middle + unfavourable;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return {
    favourable,
    middle,
    unfavourable,
    total,
    favourablePct: pct(favourable),
    middlePct: pct(middle),
    unfavourablePct: pct(unfavourable),
  };
}

// Factual comparison availability for the experience reference. Comparison is
// shown only when the prototype fixture establishes a raw pp delta. Direction
// labels are never surfaced.
export function comparisonAvailable(signal?: ServiceSignal): boolean {
  const m = signal?.movement;
  return Boolean(m && m.direction !== 'unavailable' && m.deltaPoints !== undefined);
}

// Parses fixture recency labels to an approximate age in minutes so the most
// recent timestamp can be identified. Returns null when a label cannot be
// reliably ordered.
export function recencyMinutes(label?: string | null): number | null {
  if (!label) return null;
  const l = label.trim().toLowerCase();
  if (l === 'just now' || l === 'today') return 0;
  if (l === 'yesterday') return 24 * 60;
  const m = l.match(/^(\d+)\s*(min|mins|minute|minutes)\s+ago$/);
  if (m) return Number(m[1]);
  const h = l.match(/^(\d+)\s*(hour|hours|hr|hrs)\s+ago$/);
  if (h) return Number(h[1]) * 60;
  const d = l.match(/^(\d+)\s*(day|days)\s+ago$/);
  if (d) return Number(d[1]) * 24 * 60;
  return null;
}

// User-facing channel labels. Channel is access context only.
export const CHANNEL_LABELS: Record<string, string> = {
  qr: 'QR',
  link: 'Web link',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
};

export function channelLabel(channel?: string): string {
  if (!channel) return '';
  return CHANNEL_LABELS[channel] || channel;
}

// Resolves the most recent reliably-ordered timestamp from a set of labels.
// Returns kind 'latest' with the label only when every candidate parses;
// 'recent' when ordering cannot be trusted; 'none' when there are no labels.
export function resolveRecency(
  labels: (string | null | undefined)[]
): { kind: 'latest' | 'recent' | 'none'; label: string | null } {
  const candidates = labels.filter((t): t is string => Boolean(t));
  if (candidates.length === 0) return { kind: 'none', label: null };
  const parsed = candidates.map((label) => ({ label, minutes: recencyMinutes(label) }));
  if (parsed.every((p) => p.minutes !== null)) {
    const latest = parsed.reduce((a, b) =>
      (a.minutes as number) <= (b.minutes as number) ? a : b
    );
    return { kind: 'latest', label: latest.label };
  }
  return { kind: 'recent', label: null };
}

/**
 * [PROTOTYPE ASSUMPTION ANNOTATION — Product Truth realignment]:
 * This client helper SIMULATES how a newly recorded customer feedback session
 * increments counts in the prototype. It is NOT Product Truth.
 * Production signal aggregation is computed authoritatively by the Fedoo
 * backend engine (EA-04 Measure Result + EA-05 Service Signal):
 *   - Descriptive display any N>0; N=0 → NO_EVIDENCE.
 *   - Period comparison requires N>=10 in BOTH periods (EA-05 v1).
 *   - Movement = raw percentage-point delta only (no Improving/Declining/
 *     Stable, no material-movement, no attention, no statistical claims).
 * The evidenceLevel assigned below is a prototype placeholder so fixtures
 * render; production evidence/comparison state comes from the engine.
 */
export function recalculateSignalWithSession(
  currentSignal: ServiceSignal,
  _measure: Measure,
  scoreIndex: number, // 1 to 5
  scaleValue: string
): ServiceSignal {
  const newResponseCount = currentSignal.responseCount + 1;
  const isFavourable = scoreIndex >= 4;

  const currentFavourablePercentage = currentSignal.favourablePercentage ?? 0;
  const currentFavourableCount = Math.round((currentFavourablePercentage / 100) * currentSignal.responseCount);
  const newFavourableCount = currentFavourableCount + (isFavourable ? 1 : 0);
  const newFavourablePercentage = Math.round((newFavourableCount / newResponseCount) * 100);

  // Update distribution
  const updatedDistribution = currentSignal.distribution.map(item => {
    const isThisLabel = item.label.toLowerCase() === scaleValue.toLowerCase() ||
      (scaleValue.toLowerCase().startsWith(item.label.toLowerCase()));
    const count = item.count + (isThisLabel ? 1 : 0);
    return {
      ...item,
      count,
      percentage: Math.round((count / newResponseCount) * 1000) / 10,
    };
  });

  return {
    ...currentSignal,
    responseCount: newResponseCount,
    favourablePercentage: newFavourablePercentage,
    scoreLabel: `${newFavourablePercentage}% Favourable`,
    distribution: updatedDistribution,
    // Simulated prototype evidence marker ONLY (non-authoritative).
    // Production: N>0 → descriptive display; comparison gated on N>=10 in
    // BOTH periods. Never present this threshold as a quality/reliability score.
    evidenceLevel: newResponseCount >= 40 ? 'sufficient' : 'limited',
  };
}

/**
 * Format relative timestamps or dates
 */
export function formatTimeAgo(timestamp: string): string {
  return timestamp;
}
