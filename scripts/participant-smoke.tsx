// ============================================================================
// BOUNDED PARTICIPANT SMOKE CHECKS (PROTOTYPE REVIEW TOOLING ONLY)
// ============================================================================
// These are lightweight, dependency-free checks for the Pass 4 participant
// experience states that can be verified by server-rendering. They are NOT a
// production test programme. Interactive behaviours (submission recording
// exactly once, preview non-recording, back navigation preserving answers,
// language switching preserving answers) are guarded in code and validated
// manually; see the Pass 4 completion report.
//
// Run: npm run test:participant
// ============================================================================

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ParticipantFeedbackView } from '../src/components/ParticipantFeedbackView';
import {
  GOVERNED_MEASURES,
  VERA_BEAUTY_ORGANISATION,
  VERA_BEAUTY_ENDPOINTS,
  MULTI_LOCATION_ORGANISATION,
  MULTI_LOCATION_ENDPOINTS,
} from '../src/data/mockData';
import { Endpoint } from '../src/types';

const noop = () => {};

let failures = 0;
function check(name: string, condition: boolean) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}`);
  }
}

const veraEndpoint = VERA_BEAUTY_ENDPOINTS[0];
const emptyEndpoint: Endpoint = { ...veraEndpoint, id: 'ep-empty', activeMeasureIds: [] };

// Server-rendered markup escapes apostrophes/ampersands; normalise so copy
// assertions read as plain text.
const decode = (html: string) =>
  html.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');

const render = (props: Partial<React.ComponentProps<typeof ParticipantFeedbackView>>) =>
  decode(
    renderToStaticMarkup(
      <ParticipantFeedbackView
        endpoint={veraEndpoint}
        location={VERA_BEAUTY_ORGANISATION.locations[0]}
        organisation={VERA_BEAUTY_ORGANISATION}
        measures={GOVERNED_MEASURES}
        primaryLanguage="en"
        onSubmitFeedback={noop}
        {...props}
      />
    )
  );

console.log('Participant experience smoke checks');

// 1. Entry state shows Organisation + Location context and a start action.
const entry = render({});
check('entry shows organisation name', entry.includes('Vera Beauty'));
check('entry shows location name', entry.includes('Main Salon'));
check('entry shows Start feedback CTA', entry.includes('Start feedback'));
check('entry shows a duration estimate', /About \d+ (seconds|minute)/.test(entry));
check('entry avoids unsupported privacy wording', !entry.includes('Private customer feedback'));

// 2. Measure names must not appear as participant-facing metadata.
check('no measure label in participant UI', !entry.includes('Overall Experience'));

// 3. Language selector: multiple configured languages are offered.
const vera = render({ organisation: VERA_BEAUTY_ORGANISATION });
check('multi-language selector shows English', vera.includes('English'));
check('multi-language selector shows Français', vera.includes('Français'));

// 4. Language selector: a single configured language is not offered as a switch.
const bubblesEndpoint = MULTI_LOCATION_ENDPOINTS[0];
const single = render({
  endpoint: bubblesEndpoint,
  location: MULTI_LOCATION_ORGANISATION.locations[0],
  organisation: MULTI_LOCATION_ORGANISATION,
});
check('single language hides selector', !single.includes('Français'));

// 5. Paused state.
const paused = render({ overrideStatus: 'paused' });
check('paused shows neutral unavailable heading', paused.includes('Feedback is not available right now'));
check('paused shows paused explanation', paused.includes('currently paused'));
check('paused does not invent a reason', !paused.includes('updates service settings'));
check('paused cannot start questions', !paused.includes('Start feedback'));

// 6. Invalid / unavailable link state.
const invalid = render({ unavailable: true });
check('invalid shows link unavailable', invalid.includes("isn't available"));

// 7. No active questions state (graceful, no empty form).
const noQuestions = render({ endpoint: emptyEndpoint });
check('no-questions shows graceful message', noQuestions.includes("isn't available right now"));
check('no-questions renders no response options', !noQuestions.includes('Very satisfied'));

// 8. Preview banner.
const preview = render({ previewMode: true });
check('preview banner is explicit', preview.includes('Preview mode — responses are not recorded'));

console.log(failures === 0 ? '\nALL PARTICIPANT SMOKE CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
