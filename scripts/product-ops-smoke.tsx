// ============================================================================
// BOUNDED PRODUCT OPERATIONS SMOKE CHECKS (PROTOTYPE REVIEW TOOLING ONLY)
// ============================================================================
// Lightweight, dependency-free checks for the Pass 7 control-plane experience:
// Overview, Measure Library, Instrument detail, language status, recommendation
// mapping, draft lifecycle, no Organisation approval queue, no architecture
// jargon in primary UI, and diagnostics.
//
// Run: npm run test:product-ops
// ============================================================================

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OperatorView } from '../src/components/OperatorView';
import {
  OpsOverview,
  MeasureLibrary,
  InstrumentsWorkspace,
  LanguagesWorkspace,
  SectorMapping,
  RecommendationsTemplates,
  ChangeHistory,
  Diagnostics,
} from '../src/components/operator/OpsSections';
import { buildProductOpsModel } from '../src/data/productOpsData';
import { GOVERNED_MEASURES } from '../src/data/mockData';

const noop = () => {};
const model = buildProductOpsModel(GOVERNED_MEASURES);

let failures = 0;
function check(name: string, condition: boolean) {
  if (condition) console.log(`  ok   ${name}`);
  else {
    failures += 1;
    console.log(`  FAIL ${name}`);
  }
}

const decode = (html: string) =>
  html.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
const render = (el: React.ReactElement) => decode(renderToStaticMarkup(el));

const props = {
  model,
  onNavigate: noop,
  onCreateDraft: noop,
  onAdvanceDraft: noop,
  onUpdateDraftBody: noop,
  onToggleDiagnostic: noop,
  onToggleDescriptor: noop,
  onToggleRecommendationMeasure: noop,
};

console.log('Product Operations smoke checks');

// 1. Shell + Overview.
const shell = render(<OperatorView measures={GOVERNED_MEASURES} onReturnToApp={noop} />);
check('operator shell renders', shell.includes('Fedoo Product Operations'));
check('operator shell states no approval queue', shell.includes('no approval queue'));
check('shell has section navigation', ['Measure Library', 'Instruments', 'Languages', 'Diagnostics'].every((n) => shell.includes(n)));

const overview = render(<OpsOverview {...props} />);
check('overview heading', overview.includes('Operations overview'));
check('overview shows catalogue counts', overview.includes('Measures') && overview.includes('instrument-ready'));
check('overview shows language status', overview.includes('English operational') && overview.includes('French in progress'));
check('overview has Open workspace CTA', overview.includes('Open workspace'));

// 2. Measure Library.
const library = render(<MeasureLibrary {...props} />);
check('measure library heading', library.includes('Measure Library'));
check('measure library lists a measure', library.includes('Staff Courtesy'));
check('measure library shows readiness', library.includes('Operational readiness'));
check('measure library shows applicability', library.includes('Applicability'));
check('measure library shows language coverage', library.includes('Language coverage'));
check('measure library shows recommendation usage', library.includes('Recommendation usage'));

// 3. Instruments workspace + detail.
const instruments = render(<InstrumentsWorkspace {...props} />);
check('instruments workspace heading', instruments.includes('Instruments'));
check('instrument shows standard question', instruments.includes('Overall, how would you rate your experience today?'));
check('instrument shows scale and eligibility', instruments.includes('Scale family') && instruments.includes('Eligibility'));
check('instrument shows comparability state', instruments.includes('Comparability / equivalence'));
check('instrument offers create draft (not in-place edit)', instruments.includes('Create new draft version'));
check('instrument states published content is not edited in place', instruments.includes('not edited in place'));

// 4. Draft lifecycle labels.
const draftModel = {
  ...model,
  drafts: [{ id: 'd', objectType: 'Instrument' as const, objectName: 'Overall Experience — new draft', state: 'Draft' as const, operator: 'You', updated: 'Just now', summary: 'draft', body: 'x' }],
};
const draftRender = render(<InstrumentsWorkspace {...props} model={draftModel} />);
check('draft lifecycle shows Send to Review', draftRender.includes('Send to Review'));
const reviewModel = {
  ...model,
  drafts: [{ ...draftModel.drafts[0], state: 'Review' as const }],
};
const reviewRender = render(<InstrumentsWorkspace {...props} model={reviewModel} />);
check('draft lifecycle shows Publish new version', reviewRender.includes('Publish new version'));

// 5. Languages workspace.
const languages = render(<LanguagesWorkspace {...props} />);
check('languages heading', languages.includes('Languages'));
check('english operational', languages.includes('English') && languages.includes('Operational'));
check('french in progress', languages.includes('French') && languages.includes('In progress'));
check('translation is not equivalence stated', languages.includes('Translation is not equivalence'));
check('french workflow shown', languages.includes('French candidate') && languages.includes('Equivalence status'));

// 6. Recommendation mapping + templates.
const recs = render(<RecommendationsTemplates {...props} />);
check('recommendations heading', recs.includes('Recommendations & Templates'));
check('recommended starting measures shown', recs.includes('Recommended starting Measures'));
check('also relevant shown', recs.includes('Also relevant'));
check('templates shown', recs.includes('Templates') && recs.includes('Salon Visit'));

// 7. Sector mapping + custom descriptors.
const sectors = render(<SectorMapping {...props} />);
check('sector mapping heading', sectors.includes('Sector & Context Mapping'));
check('universal measures shown', sectors.includes('Universal Measures'));
check('context mapping shown', sectors.includes('Context mapping'));
check('descriptors are not an approval queue', sectors.includes('not an approval queue'));
check('emerging descriptor shown', sectors.includes('Bridal Styling'));

// 8. Change history.
const history = render(<ChangeHistory {...props} />);
check('change history heading', history.includes('Change history'));
check('history shows an object and action', history.includes('Staff Courtesy') && history.includes('Published new Instrument version'));

// 9. Diagnostics.
const diagnostics = render(<Diagnostics {...props} />);
check('diagnostics heading', diagnostics.includes('Diagnostics'));
check('diagnostic states shown', ['Missing reference', 'Incomplete metadata', 'Needs correction'].every((s) => diagnostics.includes(s)));
check('diagnostic can be resolved', diagnostics.includes('Mark resolved'));

// 10. No Organisation approval queue anywhere.
const allRenders = [shell, overview, library, instruments, languages, recs, sectors, history, diagnostics].join(' ');
check(
  'no Organisation approval queue',
  !/approve (this )?(organisation|business|feedback point|tracking|location|service descriptor)/i.test(allRenders) &&
    !/awaiting review|pending review|pending approval|approval required|operator review queue/i.test(allRenders)
);

// 11. No architecture-jargon regression in primary UI.
check(
  'no architecture jargon in primary UI',
  !/EA-0\d|immutable effective|fail-loud|governed compatibility class|architecture authority|prototype subset/i.test(allRenders)
);

// 12. No result-based business recommendation.
check(
  'no result-based business advice',
  !/you should|we recommend (you )?(add|train|hire)|customers love|performance is improving/i.test(allRenders)
);

console.log(failures === 0 ? '\nALL PRODUCT OPERATIONS SMOKE CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
