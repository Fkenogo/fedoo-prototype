// Shared Product Operations section types. Data shapes live in
// src/data/productOpsData.ts (prototype operational fixtures).
export type {
  ProductOpsModel,
  OpsMeasure,
  OpsInstrument,
  OpsRecommendationMap,
  OpsTemplate,
  OpsDraft,
  OpsDiagnostic,
  OpsHistoryEntry,
  OpsDescriptor,
  OpsVariant,
  LifecycleState,
  Readiness,
  LanguageState,
  EquivalenceState,
} from '../../data/productOpsData';

export type OpsSection =
  | 'overview'
  | 'measure-library'
  | 'instruments'
  | 'languages'
  | 'sector-mapping'
  | 'recommendations'
  | 'history'
  | 'diagnostics';
