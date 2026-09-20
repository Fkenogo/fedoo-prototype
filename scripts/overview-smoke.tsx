// ============================================================================
// BOUNDED OVERVIEW / SIGNAL SMOKE CHECKS (PROTOTYPE REVIEW TOOLING ONLY)
// ============================================================================
// Lightweight, dependency-free checks for the Pass 5 Overview presentation
// states: no evidence, descriptive evidence, valid movement, unavailable
// movement, Organisation scope and Location scope. Not a full analytics suite.
//
// Run: npm run test:overview
// ============================================================================

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OverviewView } from '../src/components/OverviewView';
import {
  GOVERNED_MEASURES,
  VERA_BEAUTY_ORGANISATION,
  VERA_BEAUTY_ENDPOINTS,
  VERA_BEAUTY_SIGNALS,
  VERA_BEAUTY_SESSIONS,
  CITY_CLINIC_ORGANISATION,
  CITY_CLINIC_ENDPOINTS,
  CITY_CLINIC_SIGNALS,
  CITY_CLINIC_SESSIONS,
  MULTI_LOCATION_ORGANISATION,
  MULTI_LOCATION_ENDPOINTS,
  MULTI_LOCATION_SIGNALS,
  INITIAL_FEEDBACK_SESSIONS,
} from '../src/data/mockData';

const noop = () => {};

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

const render = (props: Partial<React.ComponentProps<typeof OverviewView>>) =>
  decode(
    renderToStaticMarkup(
      <OverviewView
        organisationName="Vera Beauty"
        currentScope="loc-vera-main"
        scopeLocationName="Main Salon"
        locations={VERA_BEAUTY_ORGANISATION.locations}
        measures={GOVERNED_MEASURES}
        signals={VERA_BEAUTY_SIGNALS}
        endpoints={VERA_BEAUTY_ENDPOINTS}
        recentSessions={VERA_BEAUTY_SESSIONS}
        needsReviewItems={[]}
        onSelectMeasure={noop}
        onNavigateTab={noop}
        onSelectEndpoint={noop}
        onStartSetup={noop}
        {...props}
      />
    )
  );

console.log('Overview / signal smoke checks');

// 1. Descriptive evidence + activity summary (Vera, early evidence).
const vera = render({});
check('activity summary shows response count', vera.includes('21') && vera.includes('responses'));
check('shows Customer experience section', vera.includes('Customer experience'));
check('shows favourable descriptive result', vera.includes('81%') && vera.includes('favourable'));
check('shows distribution summary text', vera.includes('Favourable 81%'));
check('valid movement is a raw pp delta', vera.includes('+2pp vs previous period'));
check('N=0 measure shows No feedback yet', vera.includes('No feedback yet'));

// 2. Unavailable comparison (insufficient period counts).
check(
  'insufficient evidence shows comparison unavailable copy',
  vera.includes('Not enough feedback to compare periods yet')
);

// 3. No prohibited movement labels / judgement / score.
check('no Improving/Declining/Stable labels', !/Improving|Declining|Stable/.test(vera));
check('no universal score heading', !/Overall .*Score|Service Health|Organisation Rating/i.test(vera));
check('no benchmark wording', !/benchmark|industry average|peer comparison/i.test(vera));
check('no result-based recommendation', !/you should|we recommend|add more staff/i.test(vera));

// 4. N=0 must not render a fake 0%.
check('no fake 0% favourable', !vera.includes('0%') || !vera.includes('0% favourable'));

// 5. Attention remains reference-only and off by default.
check('attention not shown by default', !vera.includes('Needs Attention'));

// 6. Period context is read-only (no filter control that implies filtering).
check('period context shown as read-only label', vera.includes('Last 30 days'));
check('period has no interactive selector', !vera.includes('<select'));
check('period does not offer unfiltered options', !vera.includes('Last 7 days'));

// 7. Latest feedback is the most recent reliably-ordered fixture timestamp.
check('latest feedback reflects the most recent timestamp', vera.includes('Latest feedback 2 hours ago'));

// 8. No-evidence state is internally consistent.
const noEvidence = render({ noEvidenceOverride: true });
check('no-evidence state heading', noEvidence.includes('Waiting for your first feedback'));
check('no-evidence offers View Feedback Points', noEvidence.includes('View Feedback Points'));
check('no-evidence does not show favourable %', !noEvidence.includes('% favourable'));
check('no-evidence shows no signal results', !noEvidence.includes('No feedback yet') || !noEvidence.includes('favourable'));
check('no-evidence shows no recent comments', !noEvidence.includes('braids'));
check('no-evidence shows no movement', !noEvidence.includes('vs previous period'));
check(
  'no-evidence feedback points do not show counts',
  !noEvidence.includes('14 responses') && !noEvidence.includes('7 responses')
);
check('no-evidence feedback points remain listed as Active', noEvidence.includes('Active'));
check('no-evidence shows No responses yet', noEvidence.includes('No responses yet'));

// 9. City Clinic — limited evidence (descriptive, no valid comparison).
const clinic = render({
  organisationName: 'City Clinic',
  currentScope: 'loc-clinic-main',
  scopeLocationName: 'City Clinic — Main',
  locations: CITY_CLINIC_ORGANISATION.locations,
  signals: CITY_CLINIC_SIGNALS,
  endpoints: CITY_CLINIC_ENDPOINTS,
  recentSessions: CITY_CLINIC_SESSIONS,
});
check('limited evidence shows descriptive result', clinic.includes('83%'));
check('limited evidence has no valid movement', !clinic.includes('vs previous period'));

// 10. Organisation scope vs Location scope (Bubbles Café).
const orgScope = render({
  organisationName: 'Bubbles Café',
  currentScope: 'all',
  scopeLocationName: 'All Locations',
  locations: MULTI_LOCATION_ORGANISATION.locations,
  signals: MULTI_LOCATION_SIGNALS,
  endpoints: MULTI_LOCATION_ENDPOINTS,
  recentSessions: INITIAL_FEEDBACK_SESSIONS,
});
const locScope = render({
  organisationName: 'Bubbles Café',
  currentScope: 'loc-airport',
  scopeLocationName: 'Airport Concourse',
  locations: MULTI_LOCATION_ORGANISATION.locations,
  signals: MULTI_LOCATION_SIGNALS,
  endpoints: MULTI_LOCATION_ENDPOINTS,
  recentSessions: INITIAL_FEEDBACK_SESSIONS,
});
check('org scope shows all-location staff result (94%)', orgScope.includes('94%'));
check('location scope shows that location result (90%)', locScope.includes('90%'));
check('org scope shows multiple locations represented', orgScope.includes('3 Locations represented'));
check('location scope shows one location represented', locScope.includes('1 Location represented'));
check('established evidence shows valid movement', orgScope.includes('vs previous period'));

console.log(failures === 0 ? '\nALL OVERVIEW SMOKE CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
