# FEDOO Experience Reference — Adoption Assessment

- Prototype entry SHA: `bc49dae6207baaad1af1e569ac892bfabfda0cdc`
- Fedoo Product Truth baseline: `acb054a1fc6bb5501fe123f988d55e77f1a71ea3` (origin/main, read-only authority — not changed)
- Branch: `feat/product-truth-experience-realignment`
- Date (UTC): 2026-09-18
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

## All ADAPT items and why

1. **Movement labels (Overview cards).** Prototype: emerald “improving” / rose “declining” / slate
   “steady” pills with `%`. Truth: EA-05 prohibits these labels and material-movement thresholds;
   only raw pp delta with comparison state. Adjustment: neutral pill rendering `±Xpp` + tooltip
   stating the N≥10-both-periods rule; `comparison unavailable` where no delta. Hierarchy kept.
2. **Evidence badges (Overview, Measure detail, Location detail).** Prototype: universal
   “Reliable picture / Early feedback” (hidden ≥40 threshold). Truth: no universal quality score;
   N>0 descriptive, N=0 NO_EVIDENCE, comparison gated N≥10 both periods. Adjustment: exact counts
   (`N responses`, `no evidence`) + comparison-availability line. No production doc amendment needed
   (prototype threshold was never Product Truth).
3. **Review/attention surface (DECOUPLED from default Overview).** The adopted default
   Organisation Overview contains no Attention / flagged-for-review section and its headline
   is driven only by factual governed output (response counts, feedback points, measures,
   distributions, raw pp movement, evidence/comparison states). The review/attention
   interaction design is preserved as `src/components/AttentionReferencePanel.tsx` —
   REFERENCE ONLY, rendered exclusively when prototype review tooling enables it
   (`showAttentionReference`, default OFF, toggled from the prototype review bar), visually
   separated (dashed REFERENCE frame) and labelled non-authoritative. “All clear”/bottleneck
   language is removed everywhere. Production inclusion of any organisation-visible attention
   requires a later Founder/Product decision with governed Attention semantics; the adopted
   bounded Overview must not structurally depend on it. Production will still need a governed
   attention adapter if/when that decision lands — the retained reference interaction shows
   where such a surface would dock.
4. **First-run setup.** Prototype: “detect bottlenecks”, “recommended question set”, client-shaped
   Measure choice implying authored questions. Truth: Fedoo suggests Measures from governed
   applicability; Fedoo resolves Instruments/Question Set. Adjustment: copy realigned, bottleneck
   promise removed, sector select labelled prototype illustration. Docs: OOS-001 onboarding model may
   need later amendment if it implies client-authored content (flagged, not changed here).
5. **Participant flow binding.** Prototype: `endpoint.activeMeasureIds` → browser `SCALE_DEFINITIONS`.
   Truth: Endpoint → Effective Configuration → Immutable Effective Session Composition → governed
   Question/Scale. Adjustment: flow preserved; code + footer annotated as simulation; conceptual
   binding documented; UUIDs hidden. Production needs an assembly-resolution adapter — not a reason
   to degrade the flow.
6. **Feedback Point Publish/history.** Prototype: “Publish Updates Instantly … customers immediately
   see updated questions”. Truth: publish creates/supersedes governed configuration; future sessions
   use the new effective configuration; history retains frozen lineage. Adjustment: copy + history
   section realigned; QR persistence (ADOPT) untouched.
7. **Operator → Product Operations.** Prototype: narrow catalogue viewer with French-v1.0,
   unconditional comparability, statistical validity, immutable v1.0. Truth: none of those claims
   hold; curation spans Measures → templates → lifecycle → diagnostics/audit. Adjustment: full
   control-plane experience rewrite with section tabs, deferred-FR marking, versioned lifecycle,
   disabled publish/audit actions. No permissions or backend invented.
8. **Language.** Prototype: shell toggle + “Approved v1.0 French equivalents” + calibrated
   equivalency claim. Truth: EN v1 only; FR deferred; translation ≠ equivalence. Adjustment: shell
   localisation kept as presentation pattern; all measurement-FR surfaces marked illustration-only.
   Production docs (MIB/MQL language sections) need no change; if any older doc implies approved FR,
   it is flagged for later amendment.
9. **Technical identity exposure.** Prototype displayed `ID: {endpoint.id}` and session IDs.
   Adjustment: replaced with persistent-QR-identity language; no UUIDs in customer surfaces.

## All REJECT items and why

- **Improving/Stable/Declining, Material Movement, Attention, “Needs Review” as analytical truth,
  “All clear” conclusions, bottleneck detection, recommendations, causal explanations,
  benchmark/rank claims, opaque overall scores.** Each invents domain authority, measurement
  semantics or analytical meaning the bounded engine does not authorise (EA-04/EA-05 prohibitions).
  Removed or demoted to marked simulation; no production implementation may rely on them.
- **Universal “Reliable picture / Early feedback” quality score.** Rejected as a concept — current
  approved comparison rule is N≥10 for period comparison, not a descriptive-evidence quality score.
- **Client-authored canonical wording/scales/compatibility/Question Set semantics.** Rejected —
  users choose Measures/intent only.
- **Approved French formulations / unconditional comparability / statistical-validity guarantees /
  immutable v1.0.** Rejected as claims — FR deferred, comparability class-bound, lifecycle versioned.

## Unresolved Founder assumptions

1. **Attention design:** the Attention / flagged-for-review interaction is now DECOUPLED from
   the adopted default Overview and retained as REFERENCE ONLY (`AttentionReferencePanel`,
   prototype-tooling-gated, default OFF). Founder decision still needed on whether production
   ever ships an organisation-visible attention surface, and if so under which governed
   class/thresholds (OAA-001 vs deferred Attention). Until then, the bounded production Overview
   excludes it structurally.
2. **French shell scope:** EN/FR shell toggle kept as presentation pattern. Founder decision needed
   on whether bilingual shell ships at launch or English-only, independent of deferred measurement FR.
3. **Custom-question entitlement UX:** prototype states the ≤1/entitlement/comment-separation rule in
   copy but offers no operable flow. Founder decision needed on whether the bounded release exposes
   custom-question intake at all.

## Confirmations

- [x] Unsupported analytics removed or marked non-authoritative: movement labels, material-movement,
  “All clear” conclusions, bottleneck claims, recommendations, causal
  explanations, benchmarks/ranks, opaque scores, universal quality thresholds — all removed from
  authoritative surfaces. Organisation-visible Attention is DECOUPLED from the adopted default
  Overview entirely (headline + section removed); the interaction survives only as an explicitly
  labelled REFERENCE panel behind prototype tooling.
- [x] Participant flow binds conceptually to governed session composition: Endpoint → Effective
  Configuration → Immutable Effective Session Composition → governed Question/Scale; browser
  fixtures annotated simulation-only; no UUIDs in customer surfaces.
- [x] Product Operations realignment: control-plane experience covering Measures, readiness/
  lifecycle, Standard Questions, instrument versions, scale families/versions, language versions,
  equivalence/comparability authority, applicability, templates/pools, configuration support,
  provenance, draft/review/publish, diagnostics, audit; unavailable capabilities disabled/marked;
  unsupported claims removed.
- [x] Responsive/mobile: participant phone/standalone toggle retained and still fully responsive;
  dashboard grids (`md:`/`lg:` breakpoints, max-w containers, overflow-safe cards) untouched —
  no regression introduced (build passes; manual responsive check recommended in review).
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

## Final recommendation

**ADOPT WITH SPECIFIED ADAPTATIONS** — the prototype as realigned on this branch is fit to serve
as the Fedoo Experience Reference for production assembly, with production binding governed truth
(EA-01→EA-06) behind the preserved experience via adapters/read models, and the three Founder
assumptions above resolved before production reliance on attention, French shell scope, and
custom-question intake.
