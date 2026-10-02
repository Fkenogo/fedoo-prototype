# Fedoo Operator Console — Experience Reference & Production Binding Plan

**Status:** FOR FOUNDER EXPERIENCE REVIEW — not yet bound to production
**Product Truth baseline inspected:** `Fkenogo/fedoo` @ `507be9fba73d0fcd475f4ea406bfcfbe8211f52f` (FOA-001 Stages 1–8)
**Experience authority:** this prototype. It is **not** Product Truth authority. All data is synthetic.
**Code:** `src/console/` (entry `OperatorConsole.tsx`). Run `npm run dev`, open the **Operator Console** tab, or open `/#/console/organisations`. `npm run test:console` runs the smoke checks.

## 1. Did the existing prototype already cover the Operator Console?
No. The existing `OperatorView` ("Product Operations") is a Measure/Instrument *curation* slice. It does not cover Organisations, admission, lifecycle, commercial, Feedback Operations, Users & Access, Health, Needs Attention, Settings or Support, and it states "no Organisation approval queue", which contradicts FOA-001 admission. It is left untouched. The new console is a separate bounded slice. Note also: it cites 84 canonical Measures; the repository SSOT has **88**.

## 2. Reused from the prototype (directly)
Plus Jakarta Sans; slate neutrals; `rounded-2xl` white cards; 10–11px label scale; pill chips (`text-[10px] font-bold border`); slate-900 operator chrome with cyan accent (as the existing operator slice); emerald = healthy; rose = failed; amber = decision needed; empty-state and form-field patterns; hash-less review bar; mobile-first stacking.

## 3. Information architecture
| Group | Domain | Route |
|---|---|---|
| Operate | Organisations | `#/console/organisations[/<id>?tab=]` |
| Operate | Feedback Operations | `#/console/feedback[/<fp>]` |
| Operate | Users & Access | `#/console/access[/<membership>]` |
| Observe | Platform Health | `#/console/health[?org=<id>]` |
| Observe | Needs Attention | `#/console/attention` |
| Product control plane | Product / Catalogue | `#/console/catalogue?view=overview\|readiness\|lineage\|constructs\|retired\|diagnostics` |
| Platform | Settings | `#/console/settings` |
| Platform | Support | `#/console/support[/<org>/<context>]` |

Shell: dark left rail (drawer on mobile); top bar with *Find an Organisation or Feedback Point* (composes the two existing directory searches), support-context pill, operator identity menu (name, held permissions, **prototype-only "review as" switch** between a full and a read-only permission set); context strip with a **Platform-wide / Organisation target / Support context** scope chip so the permission scope of every screen is visible. No home dashboard and no new domains.

## 4. Screen designs (summary)
- **Organisations** — rows lead with name, admission, lifecycle, setup, tier/CU, Feedback Points (+ stopped count), health roll-up, Needs Attention count and the next action; UUIDs are a short secondary mono id. Filters: search, admission, lifecycle, attention, commercial. Detail tabs: Overview, Admission & lifecycle, Commercial, Feedback Points, Users & Access, Health, Needs Attention, Timeline. Commands (admit, suspend, reinstate, close, grant CU pack, change tier) use one deliberate dialog: expected state, required reason, exact typed phrase, permission named; locked with the permission name when not held.
- **Feedback Operations** — a "where chains stop" histogram, then a card per Feedback Point: stepper (link → … → signal), a banner "Stops at Acceptance — not observed", last Session/Submission/Acceptance, 7-day volume, Evidence status; ids/timestamps/lineage behind "Technical details". Result and Signal show as "evaluated in detail", exactly as the platform directory does. Detail page lists all nine links with plain meaning, configuration/Measure readiness, integrity findings, adjacent Organisation facts (never a cause). No Evidence content.
- **Users & Access** — membership state, identity-binding status, effective access (resolver result), WP-01 role/scope tokens only behind a disclosure with a "not Product roles" caution; provider limitation and un-offered interventions shown explicitly.
- **Health** — Platform-wide aggregate vs Organisation target; customer-facing path first (participant access → signals), inventories marked "no health judgement", platform facts last. Seven states each have their own icon + border style; `not_observed` is dashed and never green; source/freshness behind a disclosure.
- **Needs Attention** — a work queue grouped by source (or Organisation / domain). Shows the FOA-001 governed class only; where none exists it says "No governed severity". Source fact, first-observed basis, evidence payload (Organisation-target) and a link to the owning domain. Items are derived: admitting an Organisation or granting CU removes its item. Unimplemented sources listed.
- **Product / Catalogue** — dark "Repository-governed · read-only" panel (88) beside a cyan "Runtime-authored" panel (publish/retire only). Readiness (8 selectable / 5 conditional / 75 not), lineage & source-of-truth, publishable constructs with gates, retired history, diagnostics.
- **Settings** — "0 governed runtime settings exist" as an honest empty state; entries typed Read-only / Provider-dependent / Unavailable / Withheld; no control anywhere.
- **Support** — entry (reason + typed phrase), amber sticky banner (operator, Organisation, purpose, reason, countdown, "not conferred" list), composed sections each with its own permission state, Evidence denied, exit with reason, a denial demonstration. No impersonation, Evidence or notes.

## 5. Responsive approach
Desktop/tablet: rail + content, 5-column row grids. Below `lg`: rail becomes a drawer; rows become stacked cards; tab and pill rows scroll horizontally; dialogs become bottom sheets. No 8–10 column table exists anywhere.

## 6. Binding matrix
Legend: **EXP** experience-only · **COMP** new composition over existing services (no Product change) · **GAP** genuine backend gap.

| Experience component | Production route | Source service / read model | Product Truth owner | Existing command | Permission | Change needed |
|---|---|---|---|---|---|---|
| Shell, nav, scope chip | `/operator/*` | n/a | n/a | — | route-level | **EXP** |
| Find Org / Feedback Point | `/operator/organisations?q=`, `/operator/feedback?q=` | `read_organisation_directory`, `read_feedback_operations_directory` | Stage 2 / 4 | — | `platform.organisation.directory.read`, `platform.feedback.directory.read` | **COMP** (two reads) |
| Operator identity / held permissions | operator context | `operator_security.build_operator_context`, `platform_operator_grants` | Stage 1 | — | session | **COMP** (read held grants for the menu) |
| Org directory rows | `/operator/organisations` | `read_organisation_directory` | Stage 2 | — | `…directory.read` | **EXP** (name/admission/lifecycle/setup/FP count/latest feedback exist) |
| Org row: tier + CU | same | `commercial.read_operator_commercial_projection` | Stage 3 | — | `platform.commercial.account.read` (**per Organisation target**) | **COMP**; **GAP-1** |
| Org row: health roll-up | same | `platform_health.read_organisation_health` | Stage 6 | — | `platform.health.read` (**per Organisation target**) | **COMP**; **GAP-1** |
| Org row: attention count, next action | same | `needs_attention.read_needs_attention` (platform) | Stage 6 | — | `platform.attention.read` | **EXP** (group by `organisation.id`, `allowed_actions`) |
| Org filters | `?q=&pending=1` | directory | Stage 2 | — | — | **EXP** for admission; lifecycle/attention/commercial filters applied client-side; **COMP** if server paging needed |
| Org detail — Overview/Profile/Locations | `/operator/organisations/<id>` | `read_organisation_detail` | Stage 2 | — | `…detail.read`, `…admission.read`, `…lifecycle.read`, `platform.audit.read` | **EXP** |
| Admission & lifecycle + eligibility | same | `read_organisation_detail`, `organisation_eligibility` | Stage 2 | `admit/suspend/reinstate/close_organisation` | `…admission.admit`, `…lifecycle.suspend/reinstate/close` | **EXP** (dialog fields already required: reason, expected state, phrase, ids) |
| Commercial tab | same | `read_operator_commercial_projection` | Stage 3 | `grant_pack`, `change_tier` | `platform.commercial.account.read/ledger.read/grant/tier.change` | **EXP** |
| Timeline | same | `read_organisation_timeline` | Stage 1 audit | — | `platform.audit.read` | **EXP** |
| Feedback Ops cards | `/operator/feedback` | `read_feedback_operations_directory` | Stage 4 | — | `platform.feedback.directory.read` | **EXP** (boundary states, first-absent, windows all returned) |
| "Where chains stop" histogram | same | derived from directory rows | Stage 4 | — | same | **EXP** |
| Feedback Point detail | `/operator/feedback/<id>` | `read_feedback_point_diagnostic` | Stage 4 | — | `…detail.read`, `…diagnostic.read` (Org target) | **EXP** |
| Users & Access list/detail | `/operator/access`, `/operator/access/<id>` | `read_access_directory`, `read_access_detail`, `effective_access`, `provider_state` | Stage 5 | none (deferred) | `platform.access.directory/detail/identity.read` | **EXP** |
| Health | `/operator/health[/<org>]` | `read_platform_health`, `read_organisation_health` | Stage 6 | — | `platform.health.read` | **EXP** |
| Needs Attention | `/operator/attention` | `read_needs_attention` | Stage 6 | none (queue never mutates) | `platform.attention.read` | **EXP** |
| Catalogue overview/readiness/lineage | `/operator/product`, `/area/*`, `/measure/*` | `catalogue_workspace.read_catalogue_overview/list_measures/read_catalogue_area` | Stage 7 | — | `platform.catalogue.read` | **EXP**; **COMP** for the 88-row readiness list (paged `list_measures`) |
| Publish / retire | `/operator/product/command` | `catalogue_commands`, `command_gates`, `action_eligibility` | Stage 7 | `publish_activate`, `retire` | `platform.catalogue.publish/retire` | **EXP** |
| Catalogue diagnostics | `/operator/product/diagnostics` | `catalogue_findings` | Stage 7 | — | `platform.catalogue.validation.read` | **EXP** |
| Settings | `/operator/settings` | `read_settings_workspace` | Stage 8 | none | `platform.settings.read` | **EXP** (nature chip derived from `class`, `runtime_mutable`, `action`) |
| Support entry / workspace / exit | `/operator/support[/…]` | `support_context.enter/exit/read_support_workspace` | Stage 8 | enter, exit | `platform.support.context.enter/read` + each domain's own | **EXP** (replace Python repr with section renderers; banner fields exist) |
| Global support pill | all pages | list of operator's active contexts | Stage 8 | — | `platform.support.context.read` | **COMP** (one read per page) |

## 7. Genuine gaps (none change Product Truth)
- **GAP-1 (backend composition/performance, not Product):** Org-row tier/CU and health need Organisation-target grants per row; the platform-target health read intentionally returns no Organisation identity. Production needs either a bounded, batched per-Organisation roll-up read model built from existing owners under existing permissions, or the row shows "Not authorised" (designed). Decision for Tech Lead.
- **GAP-2 (optional UX, would touch a command contract):** confirmation phrases embed full UUIDs. The prototype adds a *Copy phrase* control but keeps the exact typed match. A shorter phrase would be a backend change and is **not** required.
- **GAP-3 (optional):** Needs Attention "first observed" for live-read conditions equals the read time (no durable history). Shown honestly with its basis; no change requested.
- **Not gaps (deliberately absent):** membership/role/recovery commands, notification routing, incident acknowledgement, runtime settings, support notes, Evidence access — all remain unavailable per FOA-001 and are shown as such.

## 8. Confirmations
Product Truth, FOA-001, permissions and state machines are unchanged; `Fkenogo/fedoo` was only read. `preview/pages.py` was not touched. No deployment. Pilot Operability remains paused.

---

# Pass 2 — Admission & commercial continuity (Founder review, 2026-10-02)

## 9. Founder commercial continuity disposition
The operating model the console must teach: Organisation established → pending admission → operator admits → Basic + 100 complimentary CU available → accepted feedback consumes 1 CU each → balance reaches zero → new accepted feedback blocked → operator confirms payment / commercial approval outside Fedoo → operator grants CU pack → acceptance resumes. This is the pilot / pre-payment-integration model. Payment automation is shown honestly as "Not integrated yet — manual operator process". Fedoo stores no bank transfer, cash receipt, provider response, invoice, tax or payment-method record.

## 10. No Trial lifecycle state
There is no governed Trial lifecycle, timer, expiry, free plan or trial Organisation. The word "Trial" does not appear in the console except in this prohibition. Admission (`pending` / `admitted`), lifecycle (`operational` / `suspended` / `closed`) and commercial capacity (tier + CU balance) are three separate state dimensions and are never merged into one status.

## 11. 100 CU complimentary allowance semantics
One-time, complimentary, granted at successful Organisation establishment (`signup_grant` 100 CU in the ledger), visible in the directory ("Complimentary" / "100 CU initial grant") and in Commercial ("Initial complimentary allowance"). Not recurring, not a separate lifecycle state, not timer-based. Directory distinguishes "Complimentary only" (no `operator_grant` in the ledger) from "Paid / manual CU" (at least one `operator_grant`). Tier stays Basic unless a `change_tier` command moves it.

## 12. Zero-CU semantics
`0 CU` + "New accepted feedback is blocked" (+ "Acceptance blocked" chip). Explicitly unaffected: admission stays as-is, lifecycle stays as-is, history and configuration remain preserved, and a CU grant restores acceptance. Zero CU never suspends, closes or un-admits. "Low" (1–20 CU remaining in this prototype) is an operator watch flag only — no governed low-balance threshold exists.

## 13. Manual pre-payment-integration continuation
Flow: zero → operator confirms commercial approval outside Fedoo → "Grant CU pack" → governed grant dialog (current balance, fixed pack, projected balance, permission, reason, exact phrase, audit notice, "Confirm commercial approval outside Fedoo before granting CU") → balance increases → Zero-CU Needs Attention item disappears (derived, queue never mutates). No balance overwrite ("Set balance to X") exists; the pack is fixed by tier (Basic 100, Premium 50 in the fixtures).

## 14. Admission / lifecycle / commercial separation in the UI
Overview tiles are labelled A · Admission, B · Operational lifecycle, C · Commercial, D · Feedback state, followed by Needs Attention and a factual "Recommended next operator action". An "Operator actions" card lists only Admit, Grant CU pack, Change tier, Suspend, Reinstate, Close, each gated by held permission and by the Organisation's own state; disallowed commands are not offered and no Reject / Start trial / Extend trial / Mark paid / Cancel subscription / Refund command is invented. Tier changes state "does not move CU and is not payment success". Lifecycle tab states that suspend/reinstate/close are lifecycle decisions and a grant never admits or closes.

## 15. Directory next-action alignment
Pending admission → Admit Organisation · Zero CU → Grant CU pack · Suspended (no queue item) → Review suspension (reinstate offered where permitted in Admission & lifecycle) · Feedback diagnostic issue → Open Feedback Point diagnostic · Catalogue readiness issue → Open catalogue readiness · No real action → "No next action named by any implemented source". `nextAction()` is unchanged in rule; the UI now also surfaces the factual recommendation on the overview.

## 16. Catalogue vocabulary correction — exact 8/5/75 replacement
Old wording ("8 selectable / 5 conditional / 75 not selectable", "Configuration-selectable") risked implying 80 of 88 canonical questions are unavailable to customers because instrument readiness is incomplete. Canonical tuple is `[productId, key, name, category, sector, readiness, configStatus, selectable, sessionPresentable, scaleFamily, questionVersion]`. Observed partition of the 88:
- `INSTRUMENT-PARTIAL|AVAILABLE|true|yes`: 5
- `DEFINED|AVAILABLE|true|yes`: 3
- `DEFINED|UNAVAILABLE|false|conditional`: 5
- `DEFINED|UNAVAILABLE|false|no`: 75
New experience wording: **8 Session-presentable** (instrument ready for a live session) / **5 Conditional** (presentable only when its rule is met) / **75 Instrument incomplete** (no usable Question Version yet — still canonical). Semantic mapping recorded here: A · governed question eligibility = all 88 rows are canonical governed Measures; B · instrument/session readiness = the 8/5/75 split above (`selectable` + `sessionPresentable` + `configStatus`); C · analytical calculation readiness = per-Feedback-Point diagnostic (`calculation_rule_unavailable` / `band_map_unavailable` → "Analytical readiness gap", Feedback Point stays operational), never this list. All 5 `INSTRUMENT-PARTIAL` rows are session-presentable, proving partial definition never implied unselectability. Canonical data unchanged.

## 17. Legacy Product Operations disposition
Option B adopted: kept, but the top-level "Product Operations" entry is relabelled "Product Operations · legacy" (tooltip: "Legacy prototype slice — not current Operator Console authority") and the slice itself opens with an amber banner carrying that exact sentence plus the 84-Measure / no-approval-queue note. The Operator Console remains the unambiguous current Experience Reference.

## 18. Production binding implications (Pass 2 deltas, no Product change)
GAP-1 retained: directory tier/CU + health still need Organisation-target reads per row; the "Not authorised" fallback stays designed. New Pass 2 surfaces bind as: commercial journey panel ← `read_operator_commercial_projection` + ledger (Stage 3); complimentary flag ← `signup_grant` entry presence; zero/low presentation ← balance value (low flag is EXP-only guidance, never a backend threshold); grant dialog facts ← tier + balance + fixed pack rule (existing `grant_pack`); attention disappearance ← derived `needs_attention` re-read after `grant_pack`. Catalogue relabel binds to the existing `list_measures` / `read_catalogue_overview` fields (`selectable`, `sessionPresentable`, `configStatus`, `readiness`); no new read model.

## 19. Pass 2 confirmations
`Fkenogo/fedoo` untouched; Product Truth / FOA-001 / permissions / state machines unchanged; `preview/pages.py` untouched; no deployment; Pilot Operability remains paused. Synthetic scenarios cover: pending → admit (Lakeview), newly admitted 100 CU (Umoja), 1 CU (Corner Bistro), 0 CU blocked (Savannah), grant → attention clears, Basic → Premium, suspended → reinstate (Fresh Mart), operational → suspend, close.
