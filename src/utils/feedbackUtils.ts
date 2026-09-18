import { ServiceSignal, Measure } from '../types';

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
