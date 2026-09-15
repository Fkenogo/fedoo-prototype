import { ServiceSignal, Measure } from '../types';

/**
 * [PROTOTYPE ASSUMPTION ANNOTATION]:
 * This client helper simulates how a newly recorded customer feedback session
 * increments counts and recalculates sample distribution in the prototype.
 * In production Fedoo, signal aggregation, bayesian smoothing, and confidence
 * thresholds are computed authoritatively by the Fedoo backend engine.
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
    // Simulated prototype analytical state:
    evidenceLevel: newResponseCount >= 40 ? 'sufficient' : 'limited',
  };
}

/**
 * Format relative timestamps or dates
 */
export function formatTimeAgo(timestamp: string): string {
  return timestamp;
}
