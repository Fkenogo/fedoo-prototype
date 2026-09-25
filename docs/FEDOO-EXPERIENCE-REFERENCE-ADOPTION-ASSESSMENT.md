# FEDOO Experience Reference — Adoption Assessment

- Prototype entry SHA: `bc49dae6207baaad1af1e569ac892bfabfda0cdc`
- Operator Console completion pass entry SHA: `c5028af02f8913db9853abcfb4c3ed19e0781ca5` (branch `review/whole-prototype-acceptance-001`)
- Fedoo Product Truth baseline: `acb054a1fc6bb5501fe123f988d55e77f1a71ea3` (origin/main, read-only authority — not changed)
- Branch: `feat/product-truth-experience-realignment`
- Date (UTC): 2026-09-18
- **Adoption status:** APPROVED — ADOPTED AS FEDOO EXPERIENCE REFERENCE WITH SPECIFIED ADAPTATIONS
- **Founder adoption record:** `docs/FEDOO-EXPERIENCE-REFERENCE-ADOPTION-DECISION.md`
- **Approved reviewed prototype head:** `f0bf54dac08da4988a688bc35c93237b9e6e8d37`
- Rule applied: preserve the approved experience unless doing so would introduce a material
  security, integrity, privacy, or product-scope risk. Where production lacks a convenient
  API/read model, that is recorded as “production needs an adapter” — not a reason to degrade
  the prototype.

## Governing Product Truth (summary, EA-01→EA-06)

- **EA-01 Canonical Measures:** platform-owned Measures (`Measure` = what is measured), shared by
  reference. No scores/bands/sufficiency/movement invented at this layer.
- **EA-02 Instruments:** only 5 operational EN v1 instruments; French wording deferred —
  translation is not equivalence; same-Measure + same-v1.0 comparability only.
- **EA-03 Question Set Assembly:** Org selects Measures/intent → Fedoo resolves Instruments and
  assembles the Question Set → Effective Configuration → Immutable Effective Session
  Composition. Draft → Review/Test → Published → Superseded/Retired; endpoint access identity
  persists across config versions; historic sessions pin old versions; ≤1 active org custom
  question (entitlement-gated, never a Measure/signal); comment stays separate.
- **EA-04 Measure Results:** full canonical-order distribution; bands 5+4 Fav / 3 Mid / 2+1 Unfav
  (Higher-favourable 5-pt only); N>0 descriptive, N=0 → NO_EVIDENCE (never 0%); no
  means/scores/movement/attention/benchmarks/causality.
- **EA-05 Service Signals & History:** signal = view of one current result; history = comparable
  points sharing series identity. Comparison defaults to the preceding equivalent period;
  **comparison requires N≥10 in BOTH periods**; movement is a raw pp delta only. Prohibited:
  Improving/Stable/Declining, Needs Attention/Changed, material-movement thresholds,
  statistical significance, good/bad, benchmarks, opaque scores, causality.
- **EA-06 Golden chain:** end-to-end fixture proving the above; visibility exposes authorised
  facts only.

## Classification key

| Class | Meaning |
|---|---|
| ADOPT | Fits Product Truth; implement substantially as represented. |
| ADAPT | Direction right; must change to preserve product/security/integrity truth. |
| REFERENCE | Design/interaction inspiration; not an implementation requirement. |
| REJECT | Conflicts with Product Truth/scope; must not be carried forward. |
| UNRESOLVED ASSUMPTION | Requires Founder decision before production reliance. |

## Adoption matrix (by major area)

| # | Screen / journey / interaction | Class | Notes |
|---|---|---|---|
| 1 | Organisation shell, navigation, hierarchy, scope switching (org/all ↔ location) | ADOPT | First-class scope primitive preserved. |
| 2 | Overview layout, drill-down hierarchy (measure / location / feedback point) | ADOPT | Backend must not determine UI by accident — hierarchy kept. |
| 3 | Feedback Points list, persistent QR/link identity across config changes | ADOPT | Powerful concept preserved; Publish language realigned (G.7). |
| 4 | What We Track — org chooses visibility intent | ADOPT (with ADAPT wording) | Experience preserved; binding realigned: Measures/intent → governed Instruments + Question Set (D). |
| 5 | Locations + Location detail (per-location factual figures) | ADOPT (with ADAPT labels) | “Scores by Location”, counts only, no ranking (B). |
| 6 | Activity (recent sessions / comments feed) | ADOPT | Factual feed; no analytical meaning attached. |
| 7 | Settings — organisation, team access placeholders | ADOPT | Permissions remain placeholders; no authority invented. |
| 8 | First-run setup flow (short guided setup) | ADAPT | Direction preserved; claims realigned (F). |
| 9 | Participant feedback flow (short mobile-first) | ADAPT | Flow preserved; conceptual binding realigned to governed session composition; simulation annotated (E). |
| 10 | Feedback Point configuration (Change What We Track + history) | ADAPT | QR persistence ADOPT; Publish/history semantics realigned (G). |
| 11 | Improving / Steady / Declining movement pills | ADAPT (was REJECT as labels) | Labels removed; replaced with factual raw pp delta + comparison-availability note (B). Smallest adjustment, visual hierarchy kept. |
| 12 | “Reliable picture” / “Early feedback” universal quality badges | ADAPT | Removed as quality scores; replaced with exact evidence counts (`N responses`, `no evidence`) and N≥10 comparison rule (B/C). |
| 13 | Attention / “flagged for review” organisation-visible capability | REFERENCE / UNRESOLVED ASSUMPTION | Interaction pattern retained for future Attention work only (isolated `AttentionReferencePanel`, reachable exclusively via prototype review tooling, default OFF). NOT part of the adopted bounded production Overview. Production inclusion requires a later Founder/Product decision with governed Attention semantics. |
| 14 | French formulations presented as approved equivalents; “Approved v1.0 FR” | ADAPT | Marked prototype illustration only; FR Instruments deferred, no equivalence approved (H/I). Shell EN/FR toggle kept as presentation pattern only. |
| 15 | “Unconditional Cross-Location” / “statistical validity” / “Immutable v1.0” / “Benchmarked” | ADAPT | Removed; replaced with same-Measure+version+scale+compat-class rule, versioned lifecycle (H). |
| 16 | Platform Operator (narrow read-only governance shell) | ADAPT (largest) | Replaced with Product Operations control-plane experience: Measures, instruments, scales, languages/equivalence, applicability, templates/pools, lifecycle, provenance, diagnostics, audit; unavailable capabilities disabled and marked; no permissions invented (H). |
| 17 | Prototype scenario/review controls, device toggle, reset, toasts, mock data | REFERENCE | Kept visually separable (top dark bar, PROTOTYPE badges); mock data labelled simulation; calculations non-authoritative. The future-state Attention reference toggle lives here (Overview route only, default OFF). |
| 18 | Opaque overall/org-wide scores, benchmarks/ranks, recommendations, causal explanations | REJECT | None carried forward: no composite scores exist; no ranked cross-location product; no benchmarks; no causality/staff-blame (B). |
| 19 | Universal descriptive-evidence quality score (threshold-based “reliability”) | REJECT | Rejected as a concept; only governed rule is N≥10 for period comparison (C). |
| 20 | Client-authored canonical wording / scales / compatibility / Question Set semantics | REJECT | Users must not author these; interface hides mechanics (D). |
| 21 | Endpoint UUID/technical identity exposure (`ID: ep-…`, session IDs) | ADAPT | Removed from customer-facing surfaces; persistent human QR identity shown instead (E/G). Internal keys remain in fixtures only. |

## ADAPT items and why

1. **Movement labels (Overview cards).** Prototype: emerald “improving” / rose “declining” / slate
   “steady” pills with `%`. Truth: EA-05 prohibits these labels and material-movement thresholds;
   only raw pp delta with comparison state. Adjustment: neutral pill rendering `±Xpp` + tooltip
   stating the N≥10-both-periods rule; `comparison unavailable` where no delta. Hierarchy kept.
2. **Evidence badges (Overview, Measure detail, Location detail).** Prototype: universal
   “Reliable picture / Early feedback” (hidden ≥40 threshold). Truth: no universal quality score;
   N>0 descriptive, N=0 NO_EVIDENCE, comparison gated N≥10 both periods. Adjustment: exact counts
   (`N responses`, `no evidence`) + comparison-availability line. No production doc amendment needed
   (prototype threshold was never Product Truth).
3. **First-run setup.** Prototype: “detect bottlenecks”, “recommended question set”, client-shaped
   Measure choice implying authored questions. Truth: Fedoo suggests Measures from governed
   applicability; Fedoo resolves Instruments/Question Set. Adjustment: copy realigned, bottleneck
   promise removed, sector select labelled prototype illustration. Docs: OOS-001 onboarding model may
   need later amendment if it implies client-authored content (flagged, not changed here).
4. **Participant flow binding.** Prototype: `endpoint.activeMeasureIds` → browser `SCALE_DEFINITIONS`.
   Truth: Endpoint → Effective Configuration → Immutable Effective Session Composition → governed
   Question/Scale. Adjustment: flow preserved; code + footer annotated as simulation; conceptual
   binding documented; UUIDs hidden. Production needs an assembly-resolution adapter — not a reason
   to degrade the flow.
5. **Feedback Point Publish/history.** Prototype: “Publish Updates Instantly … customers immediately
   see updated questions”. Truth: publish creates/supersedes governed configuration; future sessions
   use the new effective configuration; history retains frozen lineage. Adjustment: copy + history
   section realigned; QR persistence (ADOPT) untouched.
6. **Operator → Product Operations.** Prototype: narrow catalogue viewer with French-v1.0,
   unconditional comparability, statistical validity, immutable v1.0. Truth: none of those claims
   hold; curation spans Measures → templates → lifecycle → diagnostics/audit. Adjustment: full
   control-plane experience rewrite with section tabs, deferred-FR marking, versioned lifecycle,
   disabled publish/audit actions. No permissions or backend invented.
7. **Language.** Prototype: shell toggle + “Approved v1.0 French equivalents” + calibrated
   equivalency claim. Truth: EN v1 only; FR deferred; translation ≠ equivalence. Adjustment: shell
   localisation kept as presentation pattern; all measurement-FR surfaces marked illustration-only.
   Production docs (MIB/MQL language sections) need no change; if any older doc implies approved FR,
   it is flagged for later amendment.
8. **Technical identity exposure.** Prototype displayed `ID: {endpoint.id}` and session IDs.
   Adjustment: replaced with persistent-QR-identity language; no UUIDs in customer surfaces.

## REFERENCE / UNRESOLVED items

1. **Attention / flagged-for-review surface.** The adopted default Organisation Overview contains no
   Attention / flagged-for-review section and its headline is driven only by factual governed output.
   The interaction design is preserved as `src/components/AttentionReferencePanel.tsx`, rendered only
   when prototype review tooling enables it (`showAttentionReference`, default OFF), visually separated
   and labelled non-authoritative. Production inclusion requires a later Founder/Product decision with
   governed Attention semantics.
2. **French shell launch scope.** The EN/FR shell toggle remains an experience pattern; production
   launch scope remains a later Founder/Product decision and is independent of deferred measurement-FR
   Instrument/equivalence authority.
3. **Custom-question intake UX.** Product Truth permits bounded custom-question capability under
   entitlement, but the prototype does not make it operable. Whether the bounded release exposes that
   intake UX remains a later Founder/Product decision.

## REJECT items and why

- **Improving/Stable/Declining, Material Movement, Attention as analytical truth, “All clear” conclusions,
  bottleneck detection, recommendations, causal explanations, benchmark/rank claims, opaque overall
  scores.** Each invents domain authority, measurement semantics or analytical meaning the bounded
  engine does not authorise. Removed from adopted production surfaces.
- **Universal “Reliable picture / Early feedback” quality score.** Rejected as a concept — current
  approved comparison rule is N≥10 for period comparison, not a descriptive-evidence quality score.
- **Client-authored canonical wording/scales/compatibility/Question Set semantics.** Rejected —
  users choose Measures/intent only.
- **Approved French formulations / unconditional comparability / statistical-validity guarantees /
  immutable v1.0.** Rejected as claims — FR deferred, comparability class-bound, lifecycle versioned.

## Confirmations

- [x] Unsupported analytics removed or marked non-authoritative: movement labels, material-movement,
  “All clear” conclusions, bottleneck claims, recommendations, causal explanations, benchmarks/ranks,
  opaque scores, universal quality thresholds — all removed from authoritative surfaces. Organisation-
  visible Attention is decoupled from the adopted default Overview entirely; the interaction survives
  only as an explicitly labelled REFERENCE panel behind prototype tooling.
- [x] Participant flow binds conceptually to governed session composition: Endpoint → Effective
  Configuration → Immutable Effective Session Composition → governed Question/Scale; browser
  fixtures annotated simulation-only; no UUIDs in customer surfaces.
- [x] Product Operations realignment: control-plane experience covering Measures, readiness/
  lifecycle, Standard Questions, instrument versions, scale families/versions, language versions,
  equivalence/comparability authority, applicability, templates/pools, configuration support,
  provenance, draft/review/publish, diagnostics, audit; unavailable capabilities disabled/marked;
  unsupported claims removed.
- [x] Responsive/mobile: participant phone/standalone toggle retained and still fully responsive;
  dashboard grids (`md:`/`lg:` breakpoints, max-w containers, overflow-safe cards) untouched.
- [x] Production repository untouched: all work on `Fkenogo/fedoo-prototype` branch only.

## Per-area adoption verdict

- Organisation shell / navigation / scope switching: **ADOPT**
- Overview / Feedback Points / What We Track / Locations / Activity: **ADOPT WITH ADAPTATIONS**
  (factual labels only, Attention decoupled from the default Overview; structure preserved)
- First-run setup: **ADOPT WITH ADAPTATIONS**
- Participant feedback: **ADOPT WITH ADAPTATIONS**
- Feedback Point configuration: **ADOPT WITH ADAPTATIONS**
- Product Operations (ex-Operator): **ADOPT WITH ADAPTATIONS** (largest realignment, done)
- Scenario/review controls + mock data: **REFERENCE** (kept separable, non-authoritative)

## Final adoption disposition

**ADOPTED AS FEDOO EXPERIENCE REFERENCE WITH SPECIFIED ADAPTATIONS.**

Founder approval was recorded on 18 September 2026 against reviewed prototype head
`f0bf54dac08da4988a688bc35c93237b9e6e8d37`; see
`docs/FEDOO-EXPERIENCE-REFERENCE-ADOPTION-DECISION.md`.

The approved Experience Reference now governs production experience assembly, while governed Product
Truth (EA-01→EA-06 and subsequent approved authorities) remains controlling for domain semantics,
security, integrity, permissions, lifecycle and authoritative analytical meaning.

## FEDOO OPERATOR CONSOLE — EXPERIENCE COMPLETION ASSESSMENT

Completion pass entry: `c5028af02f8913db9853abcfb4c3ed19e0781ca5` on `review/whole-prototype-acceptance-001`.
The new Operator Console wraps the retained Product Operations workspace in a human operating
console. All new operational records, health indicators and mutations are illustrative local
prototype state. No backend service, production authority or Product Truth is created by this UI.

### Existing Product Operations retained

Measure Library, Instruments, Languages, Sector & Context Mapping, Recommendations & Templates,
Product Change History and Product Diagnostics remain available under **Product**. Existing
catalogue interactions remain in place; Product Change History and Product Diagnostics are
separate from platform Audit and Platform Health. The product lifecycle remains an experience
reference; normal governed catalogue use has no Organisation approval queue.

### New operational domains

The console adds Overview; Organisations with search/filter, detail fixture, suspend/reactivate,
onboarding/location/member/entitlement summaries and read-only Support view; Users & Access with
invitation/access support examples; Subscriptions & Entitlements with capability states and a
custom-question pilot toggle; Feedback Operations with a QR support walkthrough and immutable
response boundary; Platform Health; platform Audit; and controlled Settings placeholders.
Material demo mutations append visible session-local audit items. Support view is read-only and is
not impersonation. The role selector illustrates five possible operator roles and does not define
a permission matrix.

### Product Truth alignment and integrity boundaries

The prototype describes governed Standard Questions, exactly five selected governed questions,
advisory recommendations, custom questions as separate from Measure Evidence/Signal/History,
persistent Feedback Point identity, anonymous participant defaults, and factual Activity. It does
not offer response editing, participant identification, historic composition/evidence rewriting,
retroactive recalculation or silent question wording changes. No analytical Attention semantics,
causality, benchmarks, rankings or opaque scores are introduced. Prototype counts and telemetry
are examples only and must not be treated as live facts.

### Readiness and dependencies

| Classification | Areas |
|---|---|
| OPERATIONAL NOW | Existing prototype Product catalogue interactions and the Organisation App/Participant experience in this prototype only. This classification does not assert production console services. |
| BACKEND REQUIRED | Live Organisation/member/location/Feedback Point read models; invitation delivery; access/membership mutations; entitlement persistence/enforcement; participant request/submission telemetry; operational exceptions; health/edge/background/migration telemetry; durable append-only platform audit; notification and integration settings. |
| PRODUCT DECISION REQUIRED | Operator authentication and authority model; final role permissions; entitlement semantics/effective-date precedence and override authority; support escalation ownership; operational exception taxonomy and thresholds. |
| DEFERRED | Custom-question subscription enforcement; selecting an authentication provider; true impersonation; secrets or arbitrary database administration; modifying participant responses or historic evidence. |

### Unresolved decisions and adoption boundary

Product/Security authority must define who may suspend/reactivate Organisations, change memberships,
grant overrides, inspect support data, resolve exceptions and publish governed Product changes.
Commercial authority must define entitlement semantics; there are intentionally no plan names, prices,
limits or payment-provider assumptions here. Provider-specific authentication and notification
behavior remains a placeholder until selected. Operators are domain-action users, not database
administrators. The prototype role model and audit log are reference-only; production permission
enforcement and immutable audit storage require backend/security work.

The console layout, object hierarchy, search/filter patterns, factual status language, read-only
support view and explicit capability classifications are ready for review/adoption as experience
patterns. Simulated operational actions, fixtures, health signals, permissions and audit behavior
are reference-only. Any authority, provider behavior, commercial policy or data access beyond
established Product Truth requires future Product/Security/Commercial authority.

### Final Operator Console alignment pass

- **Configuration vs analytical readiness:** Product Operations presents the 88 globally selectable
  V1 Questions separately from configuration/selectability and downstream distribution, band,
  comparison, movement and language/equivalence capability. Verified favourable-band mappings are
  identified only for Quality, Satisfaction and Likelihood in the verified engine context. No
  comparison, movement or equivalence capability is inferred from availability or band mappings;
  the summary marks unmapped catalogue-wide comparison/movement as deferred pending explicit
  governed per-question mappings. This is a descriptive reference, not new analytical semantics.
- **Product lifecycle in platform Audit:** Draft-to-Review and Review-to-Published transitions
  append session-local platform Audit entries with target, prior/resulting state, note, and
  `Product publication` source for publication. Specialist Product Change History remains
  available separately. Neither history claims durable production audit storage.
- **Illustrative role constraints:** The five role options remain. Support Operator cannot publish;
  Product Operator cannot grant/remove entitlement overrides; Read-only Auditor has representative
  mutation controls disabled and Product handlers reject mutation; Platform Administrator has
  broad prototype controls. Role labels and restrictions are explicitly illustrative, not a final
  permission matrix or backend RBAC. Denied actions explain that Product/Security authority is
  required to finalize permissions.

### Scenarios and validation

Fixtures cover normal multi-Organisation operations, partial onboarding (Mwezi Market), pending owner
invitation (The Corner Bistro), QR/link support inspection, a custom-question pilot entitlement,
degraded illustrative edge delivery and Product drafts/review state. Desktop-first layouts collapse
navigation and card grids for narrow screens; narrow-screen browser/device validation remains to be
performed before adoption. Build/lint outcomes are recorded with this completion pass rather than
implied by these fixtures.
