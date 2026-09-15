import { ServiceSignal, FeedbackSession, Measure } from '../types';

/**
 * Calculates updated signal metrics when a new session is recorded.
 */
export function recalculateSignalWithSession(
  currentSignal: ServiceSignal,
  measure: Measure,
  scoreIndex: number, // 1 to 5
  scaleValue: string
): ServiceSignal {
  const newResponseCount = currentSignal.responseCount + 1;
  const isFavourable = scoreIndex >= 4;

  const currentFavourableCount = Math.round((currentSignal.favourablePercentage / 100) * currentSignal.responseCount);
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
    sufficiencyState: newResponseCount >= 50 ? 'healthy' : 'early_signal',
  };
}

/**
 * Format relative timestamps
 */
export function formatTimeAgo(timestamp: string): string {
  return timestamp;
}
